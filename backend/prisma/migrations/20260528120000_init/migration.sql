CREATE TYPE "StatusSincronizacao" AS ENUM ('SINCRONIZADO', 'NAO_SINCRONIZADO');
CREATE TYPE "SeveridadeEvento" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');
CREATE TYPE "TipoEvento" AS ENUM ('FRENAGEM_BRUSCA', 'ACELERACAO_BRUSCA', 'EXCESSO_VELOCIDADE', 'PARADA_PROLONGADA');

CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "veiculos" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "placa" TEXT NOT NULL,
  "chassi" TEXT,
  "modelo" TEXT NOT NULL,
  "marca" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dispositivos" (
  "id" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "codigoDispositivo" TEXT NOT NULL,
  "statusSincronizacao" "StatusSincronizacao" NOT NULL DEFAULT 'NAO_SINCRONIZADO',
  "ultimaSincronizacao" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "registros_telemetria" (
  "id" TEXT NOT NULL,
  "dispositivoId" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "velocidadeObd" DOUBLE PRECISION,
  "velocidadeGps" DOUBLE PRECISION,
  "rpm" INTEGER,
  "temperaturaMotor" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "registros_telemetria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "eventos_veiculares" (
  "id" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "dispositivoId" TEXT NOT NULL,
  "registroTelemetriaId" TEXT NOT NULL,
  "tipo" "TipoEvento" NOT NULL,
  "descricao" TEXT NOT NULL,
  "severidade" "SeveridadeEvento" NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "eventos_veiculares_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuracoes_veiculo" (
  "id" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "limiteVelocidade" DOUBLE PRECISION NOT NULL DEFAULT 80,
  "tempoParadaLongaMinutos" INTEGER NOT NULL DEFAULT 10,
  "limiteFrenagemBrusca" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "limiteAceleracaoBrusca" DOUBLE PRECISION NOT NULL DEFAULT 25,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "configuracoes_veiculo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");
CREATE UNIQUE INDEX "veiculos_chassi_key" ON "veiculos"("chassi");
CREATE INDEX "veiculos_usuarioId_idx" ON "veiculos"("usuarioId");
CREATE UNIQUE INDEX "dispositivos_veiculoId_key" ON "dispositivos"("veiculoId");
CREATE UNIQUE INDEX "dispositivos_codigoDispositivo_key" ON "dispositivos"("codigoDispositivo");
CREATE INDEX "registros_telemetria_veiculoId_timestamp_idx" ON "registros_telemetria"("veiculoId", "timestamp");
CREATE INDEX "registros_telemetria_dispositivoId_timestamp_idx" ON "registros_telemetria"("dispositivoId", "timestamp");
CREATE INDEX "eventos_veiculares_veiculoId_timestamp_idx" ON "eventos_veiculares"("veiculoId", "timestamp");
CREATE INDEX "eventos_veiculares_tipo_idx" ON "eventos_veiculares"("tipo");
CREATE UNIQUE INDEX "configuracoes_veiculo_veiculoId_key" ON "configuracoes_veiculo"("veiculoId");

ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "registros_telemetria" ADD CONSTRAINT "registros_telemetria_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "registros_telemetria" ADD CONSTRAINT "registros_telemetria_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "eventos_veiculares" ADD CONSTRAINT "eventos_veiculares_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "eventos_veiculares" ADD CONSTRAINT "eventos_veiculares_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "eventos_veiculares" ADD CONSTRAINT "eventos_veiculares_registroTelemetriaId_fkey" FOREIGN KEY ("registroTelemetriaId") REFERENCES "registros_telemetria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "configuracoes_veiculo" ADD CONSTRAINT "configuracoes_veiculo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
