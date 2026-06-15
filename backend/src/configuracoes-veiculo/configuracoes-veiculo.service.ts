import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConfiguracaoVeiculoDto } from './dto/create-configuracao-veiculo.dto';
import { UpdateConfiguracaoVeiculoDto } from './dto/update-configuracao-veiculo.dto';

@Injectable()
export class ConfiguracoesVeiculoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateConfiguracaoVeiculoDto) {
    await this.validarVeiculoDoUsuario(usuarioId, dto.veiculoId);
    return this.prisma.configuracaoVeiculo.upsert({
      where: { veiculoId: dto.veiculoId },
      create: {
        veiculoId: dto.veiculoId,
        limiteVelocidade: dto.limiteVelocidade,
        tempoParadaLongaMinutos: dto.tempoParadaLongaMinutos,
        limiteFrenagemBrusca: dto.limiteFrenagemBrusca,
        limiteAceleracaoBrusca: dto.limiteAceleracaoBrusca,
      },
      update: {
        limiteVelocidade: dto.limiteVelocidade,
        tempoParadaLongaMinutos: dto.tempoParadaLongaMinutos,
        limiteFrenagemBrusca: dto.limiteFrenagemBrusca,
        limiteAceleracaoBrusca: dto.limiteAceleracaoBrusca,
      },
    });
  }

  async findByVeiculo(usuarioId: string, veiculoId: string) {
    await this.validarVeiculoDoUsuario(usuarioId, veiculoId);
    const configuracao = await this.prisma.configuracaoVeiculo.findUnique({
      where: { veiculoId },
    });
    if (!configuracao) {
      return this.prisma.configuracaoVeiculo.create({
        data: { veiculoId },
      });
    }
    return configuracao;
  }

  async update(
    usuarioId: string,
    veiculoId: string,
    dto: UpdateConfiguracaoVeiculoDto,
  ) {
    await this.validarVeiculoDoUsuario(usuarioId, veiculoId);
    return this.prisma.configuracaoVeiculo.upsert({
      where: { veiculoId },
      create: { veiculoId, ...dto },
      update: dto,
    });
  }

  private async validarVeiculoDoUsuario(usuarioId: string, veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id: veiculoId } });
    if (!veiculo) throw new NotFoundException('Veiculo nao encontrado.');
    if (veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Veiculo nao pertence ao usuario autenticado.');
    }
  }
}
