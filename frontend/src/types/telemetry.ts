export type VehicleStatus = "ligado" | "desligado" | "erro";

export type SyncStatus = "sincronizado" | "pendente" | "offline";

export type VehicleInfo = {
  id: string;
  label: string;
  plate: string;
  brand: string;
  model: string;
};

export type VehicleRecord = {
  id: string;
  placa: string;
  chassi: string | null;
  marca: string;
  modelo: string;
  ano: number;
  dispositivo?: DeviceRecord | null;
  configuracao?: EventConfig | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DeviceRecord = {
  id: string;
  veiculoId: string;
  codigoDispositivo: string;
  statusSincronizacao: "SINCRONIZADO" | "NAO_SINCRONIZADO";
  ultimaSincronizacao: string | null;
  veiculo?: VehicleRecord | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TelemetryRecord = {
  id: string;
  pacoteId?: string | null;
  dispositivoId: string;
  veiculoId: string;
  timestamp: string;
  velocidadeObd: number | null;
  rpm: number | null;
  temperaturaMotor: number | null;
  eventos?: EventRecord[];
  createdAt?: string;
};

export type EventRecord = {
  id?: string;
  veiculoId?: string;
  dispositivoId?: string;
  registroTelemetriaId?: string;
  tipo: string;
  descricao: string;
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  timestamp: string;
  veiculo?: VehicleRecord;
  dispositivo?: DeviceRecord;
  registroTelemetria?: TelemetryRecord;
  createdAt?: string;
};

export type TelemetryData = {
  speed: number;
  rpm: number;
  engineTemperature: number;
  vehicleStatus: VehicleStatus;
  storedRecords: number;
  syncStatus: SyncStatus;
  timestamp: string;
};

export type EventConfig = {
  limiteVelocidade: number;
  tempoParadaLongaMinutos: number;
  limiteFrenagemBrusca: number;
  limiteAceleracaoBrusca: number;
};

export type DeviceStatus = {
  connected: boolean;
  deviceName: string;
  firmwareVersion: string;
  lastSyncAt: string | null;
};

export type DashboardData = {
  vehicle: VehicleInfo | null;
  status: DeviceStatus;
  telemetry: TelemetryData | null;
  logs: LogEntry[];
  config: EventConfig | null;
};

export type LogEntry = {
  level: "info" | "warning" | "error";
  message: string;
  timestamp: string;
};

export type DeviceCommand = "sync";
