import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateConfiguracaoVeiculoDto {
  @IsString()
  @IsNotEmpty()
  veiculoId: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limiteVelocidade?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  tempoParadaLongaMinutos?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limiteFrenagemBrusca?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limiteAceleracaoBrusca?: number;
}
