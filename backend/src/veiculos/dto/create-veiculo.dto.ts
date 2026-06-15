import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVeiculoDto {
  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsString()
  @IsOptional()
  chassi?: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  ano: number;
}
