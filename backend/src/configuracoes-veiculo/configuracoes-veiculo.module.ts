import { Module } from '@nestjs/common';
import { ConfiguracoesVeiculoController } from './configuracoes-veiculo.controller';
import { ConfiguracoesVeiculoService } from './configuracoes-veiculo.service';

@Module({
  controllers: [ConfiguracoesVeiculoController],
  providers: [ConfiguracoesVeiculoService],
})
export class ConfiguracoesVeiculoModule {}
