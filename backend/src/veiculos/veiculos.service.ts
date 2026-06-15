import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  create(usuarioId: string, dto: CreateVeiculoDto) {
    return this.prisma.veiculo.create({
      data: {
        usuarioId,
        placa: dto.placa,
        chassi: dto.chassi,
        modelo: dto.modelo,
        marca: dto.marca,
        ano: dto.ano,
        configuracao: { create: {} },
      },
      include: { configuracao: true, dispositivo: true },
    });
  }

  findAll(usuarioId: string) {
    return this.prisma.veiculo.findMany({
      where: { usuarioId },
      include: { dispositivo: true, configuracao: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: { dispositivo: true, configuracao: true },
    });
    if (!veiculo) throw new NotFoundException('Veiculo nao encontrado.');
    if (veiculo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Veiculo nao pertence ao usuario autenticado.');
    }
    return veiculo;
  }

  async update(usuarioId: string, id: string, dto: UpdateVeiculoDto) {
    await this.findOne(usuarioId, id);
    return this.prisma.veiculo.update({
      where: { id },
      data: dto,
      include: { dispositivo: true, configuracao: true },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.veiculo.delete({ where: { id } });
    return { message: 'Veiculo removido com sucesso.' };
  }
}
