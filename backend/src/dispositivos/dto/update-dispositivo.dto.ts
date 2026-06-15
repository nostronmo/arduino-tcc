import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusSincronizacao } from '@prisma/client';

export class UpdateDispositivoDto {
  @IsString()
  @IsOptional()
  codigoDispositivo?: string;

  @IsEnum(StatusSincronizacao)
  @IsOptional()
  statusSincronizacao?: StatusSincronizacao;
}
