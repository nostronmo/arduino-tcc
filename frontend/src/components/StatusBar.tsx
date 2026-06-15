import type { DeviceStatus, VehicleInfo } from "@/src/types/telemetry";

type StatusBarProps = {
  status: DeviceStatus;
  vehicle: VehicleInfo | null;
  error: string | null;
  lastUpdated: string | null;
  isLoading: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export function StatusBar({
  status,
  vehicle,
  error,
  lastUpdated,
  isLoading
}: StatusBarProps) {
  const connectedClasses = status.connected
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-extrabold ${connectedClasses}`}>
              <span className={status.connected ? "h-2 w-2 rounded-full bg-emerald-500" : "h-2 w-2 rounded-full bg-rose-500"} />
              {status.connected ? "Conectado" : "Desconectado"}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-extrabold text-slate-700">
              Backend real
            </span>
            {isLoading ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-extrabold text-sky-700">
                Atualizando
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-950">{status.deviceName}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {vehicle ? `${vehicle.label} | Placa ${vehicle.plate}` : "Nenhum veículo carregado"} | {status.firmwareVersion}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:min-w-96 lg:text-right">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-bold">Última leitura da tela</div>
            <div className="mt-1 font-extrabold text-slate-950">{formatDateTime(lastUpdated)}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-bold">Última sincronização</div>
            <div className="mt-1 font-extrabold text-slate-950">{formatDateTime(status.lastSyncAt)}</div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-extrabold text-rose-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}
