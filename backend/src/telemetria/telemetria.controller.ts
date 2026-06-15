import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateRegistroTelemetriaDto } from './dto/create-registro-telemetria.dto';
import { TelemetriaService } from './telemetria.service';

@Controller('telemetria')
export class TelemetriaController {
  constructor(private readonly telemetriaService: TelemetriaService) {}

  @Post()
  create(@Body() dto: CreateRegistroTelemetriaDto) {
    return this.telemetriaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('veiculo/:veiculoId')
  findByVeiculo(@CurrentUser() usuario, @Param('veiculoId') veiculoId: string) {
    return this.telemetriaService.findByVeiculo(usuario.id, veiculoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dispositivo/:dispositivoId')
  findByDispositivo(
    @CurrentUser() usuario,
    @Param('dispositivoId') dispositivoId: string,
  ) {
    return this.telemetriaService.findByDispositivo(usuario.id, dispositivoId);
  }
}
