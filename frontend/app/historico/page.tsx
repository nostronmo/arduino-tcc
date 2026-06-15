"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/src/components/AppShell";
import {
  fetchVehicleTelemetry,
  fetchVehicles,
  getStoredBaseUrl
} from "@/src/lib/api";
import type { TelemetryRecord, VehicleRecord } from "@/src/types/telemetry";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export default function HistoricoPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [records, setRecords] = useState<TelemetryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      setIsLoading(true);
      const result = await fetchVehicles(getStoredBaseUrl());

      if (result.ok) {
        setVehicles(result.data);
        const firstId = result.data[0]?.id || "";
        setVehicleId(firstId);
        if (firstId) {
          await loadTelemetry(firstId);
        }
        setError(null);
      } else {
        setError(result.message);
      }

      setIsLoading(false);
    }

    void loadVehicles();
  }, []);

  async function loadTelemetry(nextVehicleId: string) {
    const result = await fetchVehicleTelemetry(getStoredBaseUrl(), nextVehicleId);

    if (result.ok) {
      setRecords(result.data);
      setError(null);
    } else {
      setError(result.message);
      setRecords([]);
    }
  }

  async function handleVehicleChange(nextVehicleId: string) {
    setVehicleId(nextVehicleId);
    if (nextVehicleId) {
      await loadTelemetry(nextVehicleId);
    } else {
      setRecords([]);
    }
  }

  return (
    <AppShell
      title="Histórico de telemetria"
      description="Explore registros salvos por veículo, incluindo velocidade, RPM, temperatura e eventos vinculados."
    >
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 border-b border-slate-200 pb-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Registros armazenados</h2>
            <p className="text-sm text-slate-600">{records.length} leitura(s)</p>
          </div>
          <select
            value={vehicleId}
            onChange={(event) => void handleVehicleChange(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Selecione um veículo</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-sm font-bold text-slate-500">Carregando...</div>
        ) : records.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nenhuma leitura encontrada para o veículo selecionado.
          </div>
        ) : (
          <div className="overflow-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Velocidade</th>
                  <th className="px-4 py-3">RPM</th>
                  <th className="px-4 py-3">Temperatura</th>
                  <th className="px-4 py-3">Eventos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-bold text-slate-700">{formatDate(record.timestamp)}</td>
                    <td className="px-4 py-3 text-slate-700">{record.velocidadeObd ?? "--"} km/h</td>
                    <td className="px-4 py-3 text-slate-700">{record.rpm ?? "--"}</td>
                    <td className="px-4 py-3 text-slate-700">{record.temperaturaMotor ?? "--"} C</td>
                    <td className="px-4 py-3 text-slate-700">{record.eventos?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
