"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/src/components/AppShell";
import {
  createDevice,
  deleteDevice,
  fetchDevices,
  fetchVehicles,
  getStoredBaseUrl
} from "@/src/lib/api";
import type { DeviceRecord, VehicleRecord } from "@/src/types/telemetry";

export default function DispositivosPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [veiculoId, setVeiculoId] = useState("");
  const [codigoDispositivo, setCodigoDispositivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    setIsLoading(true);
    const [devicesResult, vehiclesResult] = await Promise.all([
      fetchDevices(getStoredBaseUrl()),
      fetchVehicles(getStoredBaseUrl())
    ]);

    if (devicesResult.ok) {
      setDevices(devicesResult.data);
    } else {
      setError(devicesResult.message);
      setDevices([]);
    }

    if (vehiclesResult.ok) {
      setVehicles(vehiclesResult.data);
      setVeiculoId((current) => current || vehiclesResult.data[0]?.id || "");
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const result = await createDevice(getStoredBaseUrl(), {
      veiculoId,
      codigoDispositivo
    });

    if (result.ok) {
      setCodigoDispositivo("");
      await loadData();
    } else {
      setError(result.message);
    }

    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteDevice(getStoredBaseUrl(), id);

    if (result.ok) {
      await loadData();
    } else {
      setError(result.message);
    }
  }

  return (
    <AppShell
      title="Gestão de dispositivos"
      description="Vincule dispositivos ESP32 aos veículos e acompanhe o estado de sincronização."
    >
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-950">Vincular dispositivo</h2>
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-slate-700">Veículo</span>
              <select
                value={veiculoId}
                onChange={(event) => setVeiculoId(event.target.value)}
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Selecione</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-slate-700">Código do dispositivo</span>
              <input
                value={codigoDispositivo}
                onChange={(event) => setCodigoDispositivo(event.target.value)}
                placeholder="ESP32-TCC-001"
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving || !veiculoId}
            className="mt-4 min-h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400"
          >
            {isSaving ? "Salvando..." : "Vincular dispositivo"}
          </button>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-extrabold text-slate-950">Dispositivos cadastrados</h2>
            <p className="text-sm text-slate-600">{devices.length} registro(s)</p>
          </div>

          {isLoading ? (
            <div className="text-sm font-bold text-slate-500">Carregando...</div>
          ) : devices.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhum dispositivo encontrado.
            </div>
          ) : (
            <div className="grid gap-3">
              {devices.map((device) => (
                <article key={device.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-950">
                        {device.codigoDispositivo}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Status {device.statusSincronizacao} | Última sincronização {device.ultimaSincronizacao || "--"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(device.id)}
                      className="min-h-10 rounded-md border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
