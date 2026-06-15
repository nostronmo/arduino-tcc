ALTER TABLE "registros_telemetria" ADD COLUMN "pacoteId" TEXT;
CREATE UNIQUE INDEX "registros_telemetria_pacoteId_key" ON "registros_telemetria"("pacoteId");
