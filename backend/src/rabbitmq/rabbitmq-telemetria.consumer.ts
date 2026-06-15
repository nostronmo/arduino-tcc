import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { TelemetriaService } from '../telemetria/telemetria.service';

type TelemetriaMqttPayload = {
  pacoteId?: string;
  codigoDispositivo: string;
  timestamp?: string;
  velocidadeObd?: number;
  rpm?: number;
  temperaturaMotor?: number;
};

@Injectable()
export class MqttTelemetriaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttTelemetriaConsumer.name);
  private client?: mqtt.MqttClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly telemetriaService: TelemetriaService,
  ) {}

  async onModuleInit() {
    const url = this.configService.get<string>('MQTT_URL') ?? 'mqtt://localhost:9002';
    const username = this.configService.get<string>('MQTT_USERNAME') ?? 'admin';
    const password = this.configService.get<string>('MQTT_PASSWORD') ?? 'admin';

    const topic = 'telemetria/veicular';

    this.logger.log(`Conectando ao broker EMQX (MQTT) em ${url}...`);

    this.client = mqtt.connect(url, {
      username,
      password,
      clientId: `nestjs_backend_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Conectado ao EMQX. Inscrevendo-se no tópico: ${topic}`);

      this.client?.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Erro ao se inscrever no tópico: ${err.message}`);
        }
      });
    });

    this.client.on('message', async (incomingTopic, message) => {
      if (incomingTopic === topic) {
        await this.handleMessage(message);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error(`Erro no cliente MQTT: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    this.client?.end();
  }

  private async handleMessage(message: Buffer) {
    try {
      const content = message.toString('utf8');
      const parsed = JSON.parse(content) as TelemetriaMqttPayload | TelemetriaMqttPayload[];
      const payloads = Array.isArray(parsed) ? parsed : [parsed];

      for (const payload of payloads) {
        const resultado = await this.telemetriaService.create({
          pacoteId: payload.pacoteId,
          codigoDispositivo: payload.codigoDispositivo,
          timestamp: payload.timestamp ?? new Date().toISOString(),
          velocidadeObd: payload.velocidadeObd,
          rpm: payload.rpm,
          temperaturaMotor: payload.temperaturaMotor,
        });

        this.publishAck(payload, resultado.configuracaoAplicada);
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao processar telemetria MQTT: ${messageText}`);
    }
  }

  private publishAck(payload: TelemetriaMqttPayload, configuracaoAplicada?: unknown) {
    if (!payload.pacoteId || !this.client) return;

    const ackTopic = `telemetria/ack/${payload.codigoDispositivo}`;
    const ackPayload = {
      pacoteId: payload.pacoteId,
      codigoDispositivo: payload.codigoDispositivo,
      status: 'SALVO_NO_POSTGRES',
      configuracaoAplicada,
      timestamp: new Date().toISOString(),
    };

    this.client.publish(ackTopic, JSON.stringify(ackPayload), { qos: 1 });
  }
}
