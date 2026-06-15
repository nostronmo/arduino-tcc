import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { EventosService } from './eventos.service';

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  findAll(@CurrentUser() usuario) {
    return this.eventosService.findAll(usuario.id);
  }

  @Get('veiculo/:veiculoId')
  findByVeiculo(@CurrentUser() usuario, @Param('veiculoId') veiculoId: string) {
    return this.eventosService.findByVeiculo(usuario.id, veiculoId);
  }

  @Get(':id')
  findOne(@CurrentUser() usuario, @Param('id') id: string) {
    return this.eventosService.findOne(usuario.id, id);
  }
}
