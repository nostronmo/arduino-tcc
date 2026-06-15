import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracaoVeiculoDto } from './create-configuracao-veiculo.dto';

export class UpdateConfiguracaoVeiculoDto extends PartialType(
  OmitType(CreateConfiguracaoVeiculoDto, ['veiculoId'] as const),
) {}
