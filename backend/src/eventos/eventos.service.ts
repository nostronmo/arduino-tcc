import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(usuarioId: string) {
    return this.prisma.eventoVeicular.findMany({
      where: { veiculo: { usuarioId } },
      include: { veiculo: true, dispositivo: true, registroTelemetria: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByVeiculo(usuarioId: string, veiculoId: string) {
    await this.validarVeiculoDoUsuario(usuarioId, veiculoId);
    return this.prisma.eventoVeicular.findMany({
      where: { veiculoId },
      include: { dispositivo: true, registroTelemetria: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const evento = await this.prisma.eventoVeicular.findUnique({
      where: { id },
      include: { veiculo: true, dispositivo: true, registroTelemetria: true },
    });
    if (!evento) throw new NotFoundException('Evento nao encontrado.');
    if (evento.veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Evento nao pertence ao usuario autenticado.');
    }
    return evento;
  }

  private async validarVeiculoDoUsuario(usuarioId: string, veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id: veiculoId } });
    if (!veiculo) throw new NotFoundException('Veiculo nao encontrado.');
    if (veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Veiculo nao pertence ao usuario autenticado.');
    }
  }
}
