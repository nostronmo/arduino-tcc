import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDispositivoDto {
  @IsString()
  @IsNotEmpty()
  veiculoId: string;

  @IsString()
  @IsNotEmpty()
  codigoDispositivo: string;
}
