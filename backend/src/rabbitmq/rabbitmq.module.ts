import { Module } from '@nestjs/common';
import { TelemetriaModule } from '../telemetria/telemetria.module';
import { MqttTelemetriaConsumer } from './rabbitmq-telemetria.consumer';

@Module({
  imports: [TelemetriaModule],
  providers: [MqttTelemetriaConsumer],
})
export class RabbitmqModule {}
