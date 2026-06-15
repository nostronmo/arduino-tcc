import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusSincronizacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from './dto/update-dispositivo.dto';

@Injectable()
export class DispositivosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateDispositivoDto) {
    await this.validarVeiculoDoUsuario(usuarioId, dto.veiculoId);
    return this.prisma.dispositivo.create({
      data: {
        veiculoId: dto.veiculoId,
        codigoDispositivo: dto.codigoDispositivo,
      },
      include: { veiculo: true },
    });
  }

  findAll(usuarioId: string) {
    return this.prisma.dispositivo.findMany({
      where: { veiculo: { usuarioId } },
      include: { veiculo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { id },
      include: { veiculo: true },
    });
    if (!dispositivo) throw new NotFoundException('Dispositivo nao encontrado.');
    if (dispositivo.veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Dispositivo nao pertence ao usuario autenticado.');
    }
    return dispositivo;
  }

  async update(usuarioId: string, id: string, dto: UpdateDispositivoDto) {
    await this.findOne(usuarioId, id);
    return this.prisma.dispositivo.update({
      where: { id },
      data: dto,
      include: { veiculo: true },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.dispositivo.delete({ where: { id } });
    return { message: 'Dispositivo removido com sucesso.' };
  }

  async verificarSincronizacao() {
    const limite = new Date(Date.now() - 5 * 60 * 1000);
    const resultado = await this.prisma.dispositivo.updateMany({
      where: {
        OR: [
          { ultimaSincronizacao: null },
          { ultimaSincronizacao: { lt: limite } },
        ],
        statusSincronizacao: StatusSincronizacao.SINCRONIZADO,
      },
      data: { statusSincronizacao: StatusSincronizacao.NAO_SINCRONIZADO },
    });

    return {
      dispositivosMarcadosComoNaoSincronizados: resultado.count,
      limiteSemAtualizacaoMinutos: 5,
    };
  }

  private async validarVeiculoDoUsuario(usuarioId: string, veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id: veiculoId } });
    if (!veiculo) throw new NotFoundException('Veiculo nao encontrado.');
    if (veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Veiculo nao pertence ao usuario autenticado.');
    }
  }
}
