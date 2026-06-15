import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from './dto/update-dispositivo.dto';
import { DispositivosService } from './dispositivos.service';

@UseGuards(JwtAuthGuard)
@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly dispositivosService: DispositivosService) {}

  @Post()
  create(@CurrentUser() usuario, @Body() dto: CreateDispositivoDto) {
    return this.dispositivosService.create(usuario.id, dto);
  }

  @Get()
  findAll(@CurrentUser() usuario) {
    return this.dispositivosService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@CurrentUser() usuario, @Param('id') id: string) {
    return this.dispositivosService.findOne(usuario.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() usuario,
    @Param('id') id: string,
    @Body() dto: UpdateDispositivoDto,
  ) {
    return this.dispositivosService.update(usuario.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() usuario, @Param('id') id: string) {
    return this.dispositivosService.remove(usuario.id, id);
  }

  @Patch('verificar-sincronizacao')
  verificarSincronizacao() {
    return this.dispositivosService.verificarSincronizacao();
  }
}
