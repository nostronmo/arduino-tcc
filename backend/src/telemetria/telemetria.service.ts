import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  SeveridadeEvento,
  StatusSincronizacao,
  TipoEvento,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRegistroTelemetriaDto } from "./dto/create-registro-telemetria.dto";

type EventoDerivado = {
  tipo: TipoEvento;
  descricao: string;
  severidade: SeveridadeEvento;
};

@Injectable()
export class TelemetriaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistroTelemetriaDto) {
    if (dto.pacoteId) {
      const registroExistente = await this.prisma.registroTelemetria.findUnique(
        {
          where: { pacoteId: dto.pacoteId },
          include: { eventos: true },
        },
      );

      if (registroExistente) {
        const configuracaoAplicada = await this.obterConfiguracaoDoVeiculo(
          registroExistente.veiculoId,
        );

        await this.prisma.dispositivo.update({
          where: { id: registroExistente.dispositivoId },
          data: {
            statusSincronizacao: StatusSincronizacao.SINCRONIZADO,
            ultimaSincronizacao: new Date(),
          },
        });

        return {
          registro: registroExistente,
          eventosGerados: registroExistente.eventos,
          configuracaoAplicada,
          duplicado: true,
        };
      }
    }

    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { codigoDispositivo: dto.codigoDispositivo },
      include: { veiculo: { include: { configuracao: true } } },
    });

    if (!dispositivo) {
      throw new NotFoundException("Codigo do dispositivo nao encontrado.");
    }

    const timestamp = new Date(dto.timestamp);
    const registro = await this.prisma.registroTelemetria.create({
      data: {
        pacoteId: dto.pacoteId,
        dispositivoId: dispositivo.id,
        veiculoId: dispositivo.veiculoId,
        timestamp,
        velocidadeObd: dto.velocidadeObd,
        rpm: dto.rpm,
        temperaturaMotor: dto.temperaturaMotor,
      },
    });

    await this.prisma.dispositivo.update({
      where: { id: dispositivo.id },
      data: {
        statusSincronizacao: StatusSincronizacao.SINCRONIZADO,
        ultimaSincronizacao: new Date(),
      },
    });

    const configuracaoAplicada =
      dispositivo.veiculo.configuracao ??
      (await this.prisma.configuracaoVeiculo.create({
        data: { veiculoId: dispositivo.veiculoId },
      }));

    const eventos = await this.gerarEventosDerivados({
      registro,
      dispositivoId: dispositivo.id,
      veiculoId: dispositivo.veiculoId,
      configuracao: configuracaoAplicada,
    });

    return { registro, eventosGerados: eventos, configuracaoAplicada };
  }

  async findByVeiculo(usuarioId: string, veiculoId: string) {
    await this.validarVeiculoDoUsuario(usuarioId, veiculoId);
    return this.prisma.registroTelemetria.findMany({
      where: { veiculoId },
      include: { eventos: true },
      orderBy: { timestamp: "desc" },
    });
  }

  async findByDispositivo(usuarioId: string, dispositivoId: string) {
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
      include: { veiculo: true },
    });
    if (!dispositivo)
      throw new NotFoundException("Dispositivo nao encontrado.");
    if (dispositivo.veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        "Dispositivo nao pertence ao usuario autenticado.",
      );
    }

    return this.prisma.registroTelemetria.findMany({
      where: { dispositivoId },
      include: { eventos: true },
      orderBy: { timestamp: "desc" },
    });
  }

  private async gerarEventosDerivados(params) {
    const { registro, dispositivoId, veiculoId, configuracao } = params;
    const eventosParaCriar: EventoDerivado[] = [];
    const velocidadeAtual = this.obterVelocidade(registro);

    if (
      velocidadeAtual !== null &&
      velocidadeAtual > configuracao.limiteVelocidade
    ) {
      eventosParaCriar.push({
        tipo: TipoEvento.EXCESSO_VELOCIDADE,
        descricao: `Velocidade registrada de ${velocidadeAtual} km/h acima do limite de ${configuracao.limiteVelocidade} km/h.`,
        severidade: SeveridadeEvento.MEDIA,
      });
    }

    const registroAnterior = await this.prisma.registroTelemetria.findFirst({
      where: {
        dispositivoId,
        timestamp: { lt: registro.timestamp },
        id: { not: registro.id },
      },
      orderBy: { timestamp: "desc" },
    });

    if (registroAnterior && velocidadeAtual !== null) {
      const velocidadeAnterior = this.obterVelocidade(registroAnterior);
      const diferencaSegundos =
        (registro.timestamp.getTime() - registroAnterior.timestamp.getTime()) /
        1000;

      if (velocidadeAnterior !== null && diferencaSegundos > 0) {
        const variacao = velocidadeAtual - velocidadeAnterior;

        if (
          variacao <= -configuracao.limiteFrenagemBrusca &&
          diferencaSegundos <= 2
        ) {
          eventosParaCriar.push({
            tipo: TipoEvento.FRENAGEM_BRUSCA,
            descricao: `Reducao de ${Math.abs(variacao)} km/h em ${diferencaSegundos.toFixed(1)} segundos.`,
            severidade: SeveridadeEvento.ALTA,
          });
        }

        if (
          variacao >= configuracao.limiteAceleracaoBrusca &&
          diferencaSegundos <= 3
        ) {
          eventosParaCriar.push({
            tipo: TipoEvento.ACELERACAO_BRUSCA,
            descricao: `Aumento de ${variacao} km/h em ${diferencaSegundos.toFixed(1)} segundos.`,
            severidade: SeveridadeEvento.MEDIA,
          });
        }
      }
    }

    if (velocidadeAtual === 0) {
      const eventoParada = await this.verificarParadaProlongada({
        registro,
        dispositivoId,
        veiculoId,
        tempoMinutos: configuracao.tempoParadaLongaMinutos,
      });
      if (eventoParada) eventosParaCriar.push(eventoParada);
    }

    if (eventosParaCriar.length === 0) return [];

    await this.prisma.eventoVeicular.createMany({
      data: eventosParaCriar.map((evento) => ({
        veiculoId,
        dispositivoId,
        registroTelemetriaId: registro.id,
        tipo: evento.tipo,
        descricao: evento.descricao,
        severidade: evento.severidade,
        timestamp: registro.timestamp,
      })),
    });

    return this.prisma.eventoVeicular.findMany({
      where: { registroTelemetriaId: registro.id },
      orderBy: { createdAt: "asc" },
    });
  }

  private async verificarParadaProlongada(
    params,
  ): Promise<EventoDerivado | null> {
    const { registro, dispositivoId, veiculoId, tempoMinutos } = params;
    const ultimoMovimento = await this.prisma.registroTelemetria.findFirst({
      where: {
        dispositivoId,
        timestamp: { lt: registro.timestamp },
        velocidadeObd: { gt: 0 },
      },
      orderBy: { timestamp: "desc" },
    });

    const inicioParada = await this.prisma.registroTelemetria.findFirst({
      where: {
        dispositivoId,
        timestamp: ultimoMovimento
          ? { gt: ultimoMovimento.timestamp, lte: registro.timestamp }
          : { lte: registro.timestamp },
        velocidadeObd: 0,
      },
      orderBy: { timestamp: "asc" },
    });

    if (!inicioParada) return null;

    const minutosParado =
      (registro.timestamp.getTime() - inicioParada.timestamp.getTime()) / 60000;
    if (minutosParado < tempoMinutos) return null;

    const eventoExistente = await this.prisma.eventoVeicular.findFirst({
      where: {
        veiculoId,
        tipo: TipoEvento.PARADA_PROLONGADA,
        timestamp: { gte: inicioParada.timestamp },
      },
    });

    if (eventoExistente) return null;

    return {
      tipo: TipoEvento.PARADA_PROLONGADA,
      descricao: `Veiculo parado por ${minutosParado.toFixed(1)} minutos.`,
      severidade: SeveridadeEvento.BAIXA,
    };
  }

  private obterVelocidade(registro): number | null {
    return registro.velocidadeObd ?? null;
  }

  private async obterConfiguracaoDoVeiculo(veiculoId: string) {
    return this.prisma.configuracaoVeiculo.findUnique({
      where: { veiculoId },
    });
  }

  private async validarVeiculoDoUsuario(usuarioId: string, veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: veiculoId },
    });
    if (!veiculo) throw new NotFoundException("Veiculo nao encontrado.");
    if (veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        "Veiculo nao pertence ao usuario autenticado.",
      );
    }
  }
}
