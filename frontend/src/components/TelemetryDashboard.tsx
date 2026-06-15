"use client";

import Link from "next/link";
import { clearAuthSession, type BackendUser } from "@/src/lib/api";
import { CommandPanel } from "@/src/components/CommandPanel";
import { ConfigPanel } from "@/src/components/ConfigPanel";
import { EventConfigPanel } from "@/src/components/EventConfigPanel";
import { LogsPanel } from "@/src/components/LogsPanel";
import { StatusBar } from "@/src/components/StatusBar";
import { TelemetryPanel } from "@/src/components/TelemetryPanel";
import { useTelemetry } from "@/src/hooks/useTelemetry";

type TelemetryDashboardProps = {
  user: BackendUser;
  onLogout: () => void;
};

export function TelemetryDashboard({
  user,
  onLogout
}: TelemetryDashboardProps) {
  const {
    baseUrl,
    updateBaseUrl,
    dashboard,
    error,
    lastUpdated,
    isLoading,
    isCommandRunning,
    isSavingConfig,
    refresh,
    testConnection,
    runCommand,
    saveConfig
  } = useTelemetry();

  function handleLogout() {
    clearAuthSession();
    onLogout();
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-sky-700">
                  Backend real
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-emerald-700">
                  PostgreSQL / ESP32 / OBD-II
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
                Caixa preta veicular
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Monitoramento real com backend NestJS, PostgreSQL, RabbitMQ, ESP32 e OBD-II/CAN.
              </p>
            </div>

            <div className="grid gap-3 sm:min-w-80">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-extrabold uppercase tracking-normal text-slate-500">
                  Operador
                </div>
                <div className="mt-1 truncate text-sm font-bold text-slate-950">
                  {user.nome} | {user.email}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-extrabold uppercase tracking-normal text-slate-500">
                    Veículo
                  </div>
                  <div className="mt-1 truncate text-sm font-bold text-slate-950">
                    {dashboard.vehicle?.plate ?? "--"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-extrabold uppercase tracking-normal text-slate-500">
                    Status
                  </div>
                  <div className={dashboard.status.connected ? "mt-1 text-sm font-bold text-emerald-700" : "mt-1 text-sm font-bold text-rose-700"}>
                    {dashboard.status.connected ? "Conectado" : "Desconectado"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 border-t border-slate-200 bg-slate-950 text-white sm:grid-cols-3">
            <div className="border-b border-white/10 px-5 py-3 sm:border-b-0 sm:border-r">
              <div className="text-xs font-bold text-slate-300">Dispositivo</div>
              <div className="mt-1 text-sm font-extrabold">{dashboard.status.deviceName}</div>
            </div>
            <div className="border-b border-white/10 px-5 py-3 sm:border-b-0 sm:border-r">
              <div className="text-xs font-bold text-slate-300">Registros no backend</div>
              <div className="mt-1 text-sm font-extrabold">
                {dashboard.telemetry ? dashboard.telemetry.storedRecords : "--"}
              </div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs font-bold text-slate-300">Eventos exibidos</div>
              <div className="mt-1 text-sm font-extrabold">{dashboard.logs.length}</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 border-t border-white/10 bg-slate-900 px-5 py-3">
            {[
              ["Dashboard", "/dashboard"],
              ["Veículos", "/veiculos"],
              ["Dispositivos", "/dispositivos"],
              ["Histórico", "/historico"],
              ["Eventos", "/eventos"]
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-extrabold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            <ConfigPanel
              baseUrl={baseUrl}
              isLoading={isLoading}
              onBaseUrlChange={updateBaseUrl}
              onTestConnection={testConnection}
            />

            <StatusBar
              status={dashboard.status}
              vehicle={dashboard.vehicle}
              error={error}
              lastUpdated={lastUpdated}
              isLoading={isLoading}
            />

            <TelemetryPanel telemetry={dashboard.telemetry} />

            <EventConfigPanel
              vehicle={dashboard.vehicle}
              config={dashboard.config}
              isSaving={isSavingConfig}
              onSave={saveConfig}
            />
          </div>

          <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-5">
            <CommandPanel
              isBusy={isCommandRunning}
              isLoading={isLoading}
              onCommand={runCommand}
              onRefresh={refresh}
            />

            <LogsPanel logs={dashboard.logs} />
          </aside>
        </div>
      </div>
    </main>
  );
}
