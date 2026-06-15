import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ConfiguracoesVeiculoModule } from './configuracoes-veiculo/configuracoes-veiculo.module';
import { DispositivosModule } from './dispositivos/dispositivos.module';
import { EventosModule } from './eventos/eventos.module';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { TelemetriaModule } from './telemetria/telemetria.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VeiculosModule } from './veiculos/veiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    VeiculosModule,
    DispositivosModule,
    TelemetriaModule,
    RabbitmqModule,
    EventosModule,
    ConfiguracoesVeiculoModule,
  ],
})
export class AppModule {}
