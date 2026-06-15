import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculosService } from './veiculos.service';

@UseGuards(JwtAuthGuard)
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(@CurrentUser() usuario, @Body() dto: CreateVeiculoDto) {
    return this.veiculosService.create(usuario.id, dto);
  }

  @Get()
  findAll(@CurrentUser() usuario) {
    return this.veiculosService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@CurrentUser() usuario, @Param('id') id: string) {
    return this.veiculosService.findOne(usuario.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() usuario,
    @Param('id') id: string,
    @Body() dto: UpdateVeiculoDto,
  ) {
    return this.veiculosService.update(usuario.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() usuario, @Param('id') id: string) {
    return this.veiculosService.remove(usuario.id, id);
  }
}
