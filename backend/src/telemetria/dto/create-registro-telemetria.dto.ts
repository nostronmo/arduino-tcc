import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRegistroTelemetriaDto {
  @IsString()
  @IsOptional()
  pacoteId?: string;

  @IsString()
  @IsNotEmpty()
  codigoDispositivo: string;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  velocidadeObd?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rpm?: number;

  @IsNumber()
  @IsOptional()
  temperaturaMotor?: number;
}
