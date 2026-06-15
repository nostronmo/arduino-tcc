import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ConfiguracoesVeiculoService } from './configuracoes-veiculo.service';
import { CreateConfiguracaoVeiculoDto } from './dto/create-configuracao-veiculo.dto';
import { UpdateConfiguracaoVeiculoDto } from './dto/update-configuracao-veiculo.dto';

@UseGuards(JwtAuthGuard)
@Controller('configuracoes-veiculo')
export class ConfiguracoesVeiculoController {
  constructor(private readonly service: ConfiguracoesVeiculoService) {}

  @Post()
  create(@CurrentUser() usuario, @Body() dto: CreateConfiguracaoVeiculoDto) {
    return this.service.create(usuario.id, dto);
  }

  @Get(':veiculoId')
  findByVeiculo(@CurrentUser() usuario, @Param('veiculoId') veiculoId: string) {
    return this.service.findByVeiculo(usuario.id, veiculoId);
  }

  @Put(':veiculoId')
  update(
    @CurrentUser() usuario,
    @Param('veiculoId') veiculoId: string,
    @Body() dto: UpdateConfiguracaoVeiculoDto,
  ) {
    return this.service.update(usuario.id, veiculoId, dto);
  }
}
