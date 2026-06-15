import type {
  DashboardData,
  DeviceRecord,
  DeviceStatus,
  EventConfig,
  EventRecord,
  LogEntry,
  SyncStatus,
  TelemetryData,
  TelemetryRecord,
  VehicleInfo,
  VehicleRecord
} from "@/src/types/telemetry";

export const DEFAULT_BASE_URL = "http://localhost:8080";

const BASE_URL_STORAGE_KEY = "telemetria_backend_base_url";
const AUTH_STORAGE_KEY = "telemetria_backend_auth";
const REQUEST_TIMEOUT_MS = 5000;

type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  ok: false;
  message: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type BackendUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  usuario: BackendUser;
  accessToken: string;
};

type AuthResponse = AuthSession;

type DispositivoApi = DeviceRecord;

type VeiculoApi = VehicleRecord & {
  dispositivo?: DispositivoApi | null;
};

type RegistroTelemetriaApi = TelemetryRecord;

type EventoApi = EventRecord;

type ConfiguracaoApi = EventConfig & {
  id: string;
  veiculoId: string;
};

export function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export function getStoredBaseUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_BASE_URL;
  }

  return localStorage.getItem(BASE_URL_STORAGE_KEY) || DEFAULT_BASE_URL;
}

export function saveBaseUrl(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(BASE_URL_STORAGE_KEY, normalizeBaseUrl(url));
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function requestJson<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    return {
      ok: false,
      message: "Informe a URL base do backend antes de conectar."
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store",
      signal: controller.signal
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : `O backend respondeu com erro HTTP ${response.status}.`;

      if (response.status === 401) {
        clearAuthSession();
      }

      return {
        ok: false,
        message
      };
    }

    return { ok: true, data: data as T };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message: "Tempo limite ao conectar com o backend. Verifique se a API NestJS esta rodando."
      };
    }

    if (error instanceof SyntaxError) {
      return {
        ok: false,
        message: "O backend respondeu, mas o JSON retornado nao pode ser lido."
      };
    }

    return {
      ok: false,
      message: "Nao foi possivel conectar ao backend. Confira a URL, a porta e o CORS da API."
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function authenticatedRequest<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
) {
  const session = getAuthSession();

  if (!session?.accessToken) {
    return {
      ok: false,
      message: "Sessao expirada. Faca login novamente."
    } satisfies ApiFailure;
  }

  return requestJson<T>(baseUrl, path, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(options?.headers ?? {})
    }
  });
}

export async function login(baseUrl: string, email: string, senha: string) {
  const result = await requestJson<AuthResponse>(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });

  if (result.ok) {
    saveBaseUrl(baseUrl);
    saveAuthSession(result.data);
  }

  return result;
}

export async function register(
  baseUrl: string,
  payload: { nome: string; email: string; senha: string }
) {
  const result = await requestJson<AuthResponse>(baseUrl, "/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result.ok) {
    saveBaseUrl(baseUrl);
    saveAuthSession(result.data);
  }

  return result;
}

function syncStatusFromApi(status?: DispositivoApi["statusSincronizacao"]): SyncStatus {
  if (status === "SINCRONIZADO") {
    return "sincronizado";
  }

  if (status === "NAO_SINCRONIZADO") {
    return "offline";
  }

  return "pendente";
}

function mapVehicle(veiculo: VeiculoApi): VehicleInfo {
  return {
    id: veiculo.id,
    label: `${veiculo.marca} ${veiculo.modelo}`,
    plate: veiculo.placa,
    brand: veiculo.marca,
    model: veiculo.modelo
  };
}

function mapTelemetry(
  registro: RegistroTelemetriaApi | undefined,
  totalRegistros: number,
  syncStatus: SyncStatus
): TelemetryData | null {
  if (!registro) {
    return null;
  }

  const speed = registro.velocidadeObd ?? 0;
  const rpm = registro.rpm ?? 0;

  return {
    speed,
    rpm,
    engineTemperature: registro.temperaturaMotor ?? 0,
    vehicleStatus: speed > 0 || rpm > 0 ? "ligado" : "desligado",
    storedRecords: totalRegistros,
    syncStatus,
    timestamp: registro.timestamp
  };
}

function mapLogs(eventos: EventoApi[]): LogEntry[] {
  return eventos.map((evento) => ({
    level: evento.severidade === "ALTA" ? "error" : evento.severidade === "MEDIA" ? "warning" : "info",
    message: `${evento.tipo}: ${evento.descricao}`,
    timestamp: evento.timestamp
  }));
}

function mapStatus(dispositivo?: DispositivoApi | null): DeviceStatus {
  return {
    connected: dispositivo?.statusSincronizacao === "SINCRONIZADO",
    deviceName: dispositivo?.codigoDispositivo ?? "Nenhum dispositivo cadastrado",
    firmwareVersion: "ESP32 OBD-II",
    lastSyncAt: dispositivo?.ultimaSincronizacao ?? null
  };
}

export async function fetchDashboard(baseUrl: string): Promise<ApiResult<DashboardData>> {
  const veiculosResult = await authenticatedRequest<VeiculoApi[]>(baseUrl, "/veiculos");

  if (!veiculosResult.ok) {
    return veiculosResult;
  }

  const veiculo = veiculosResult.data[0];

  if (!veiculo) {
    return {
      ok: true,
      data: {
        vehicle: null,
        status: mapStatus(null),
        telemetry: null,
        logs: [],
        config: null
      }
    };
  }

  const syncStatus = syncStatusFromApi(veiculo.dispositivo?.statusSincronizacao);
  const [registrosResult, eventosResult, configResult] = await Promise.all([
    authenticatedRequest<RegistroTelemetriaApi[]>(baseUrl, `/telemetria/veiculo/${veiculo.id}`),
    authenticatedRequest<EventoApi[]>(baseUrl, `/eventos/veiculo/${veiculo.id}`),
    authenticatedRequest<ConfiguracaoApi>(baseUrl, `/configuracoes-veiculo/${veiculo.id}`)
  ]);

  if (!registrosResult.ok) {
    return { ok: false, message: registrosResult.message };
  }

  if (!eventosResult.ok) {
    return { ok: false, message: eventosResult.message };
  }

  if (!configResult.ok) {
    return { ok: false, message: configResult.message };
  }

  return {
    ok: true,
    data: {
      vehicle: mapVehicle(veiculo),
      status: mapStatus(veiculo.dispositivo),
      telemetry: mapTelemetry(registrosResult.data[0], registrosResult.data.length, syncStatus),
      logs: mapLogs(eventosResult.data),
      config: {
        limiteVelocidade: configResult.data.limiteVelocidade,
        tempoParadaLongaMinutos: configResult.data.tempoParadaLongaMinutos,
        limiteFrenagemBrusca: configResult.data.limiteFrenagemBrusca,
        limiteAceleracaoBrusca: configResult.data.limiteAceleracaoBrusca
      }
    }
  };
}

export async function verifySync(baseUrl: string) {
  return authenticatedRequest<{
    dispositivosMarcadosComoNaoSincronizados?: number;
    atualizados?: number;
    limiteSemAtualizacaoMinutos?: number;
  }>(baseUrl, "/dispositivos/verificar-sincronizacao", { method: "PATCH" });
}

export async function updateVehicleConfig(
  baseUrl: string,
  vehicleId: string,
  config: EventConfig
) {
  return authenticatedRequest<ConfiguracaoApi>(
    baseUrl,
    `/configuracoes-veiculo/${vehicleId}`,
    {
      method: "PUT",
      body: JSON.stringify(config)
    }
  );
}

export function fetchVehicles(baseUrl: string) {
  return authenticatedRequest<VehicleRecord[]>(baseUrl, "/veiculos");
}

export function createVehicle(
  baseUrl: string,
  payload: { placa: string; chassi?: string; marca: string; modelo: string; ano: number }
) {
  return authenticatedRequest<VehicleRecord>(baseUrl, "/veiculos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateVehicle(
  baseUrl: string,
  id: string,
  payload: Partial<{ placa: string; chassi: string; marca: string; modelo: string; ano: number }>
) {
  return authenticatedRequest<VehicleRecord>(baseUrl, `/veiculos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteVehicle(baseUrl: string, id: string) {
  return authenticatedRequest<{ message: string }>(baseUrl, `/veiculos/${id}`, {
    method: "DELETE"
  });
}

export function fetchDevices(baseUrl: string) {
  return authenticatedRequest<DeviceRecord[]>(baseUrl, "/dispositivos");
}

export function createDevice(
  baseUrl: string,
  payload: { veiculoId: string; codigoDispositivo: string }
) {
  return authenticatedRequest<DeviceRecord>(baseUrl, "/dispositivos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateDevice(
  baseUrl: string,
  id: string,
  payload: Partial<{ codigoDispositivo: string; statusSincronizacao: DeviceRecord["statusSincronizacao"] }>
) {
  return authenticatedRequest<DeviceRecord>(baseUrl, `/dispositivos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteDevice(baseUrl: string, id: string) {
  return authenticatedRequest<{ message: string }>(baseUrl, `/dispositivos/${id}`, {
    method: "DELETE"
  });
}

export function fetchEvents(baseUrl: string) {
  return authenticatedRequest<EventRecord[]>(baseUrl, "/eventos");
}

export function fetchVehicleTelemetry(baseUrl: string, veiculoId: string) {
  return authenticatedRequest<TelemetryRecord[]>(
    baseUrl,
    `/telemetria/veiculo/${veiculoId}`
  );
}
