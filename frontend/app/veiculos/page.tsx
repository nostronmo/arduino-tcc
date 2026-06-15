"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/src/components/AppShell";
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  getStoredBaseUrl
} from "@/src/lib/api";
import type { VehicleRecord } from "@/src/types/telemetry";

const initialForm = {
  placa: "",
  chassi: "",
  marca: "",
  modelo: "",
  ano: new Date().getFullYear()
};

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadVehicles() {
    setIsLoading(true);
    const result = await fetchVehicles(getStoredBaseUrl());

    if (result.ok) {
      setVehicles(result.data);
      setError(null);
    } else {
      setError(result.message);
      setVehicles([]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const result = await createVehicle(getStoredBaseUrl(), {
      ...form,
      chassi: form.chassi || undefined,
      ano: Number(form.ano)
    });

    if (result.ok) {
      setForm(initialForm);
      await loadVehicles();
    } else {
      setError(result.message);
    }

    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteVehicle(getStoredBaseUrl(), id);

    if (result.ok) {
      await loadVehicles();
    } else {
      setError(result.message);
    }
  }

  return (
    <AppShell
      title="Gestão de veículos"
      description="Cadastre, liste e remova os veículos vinculados ao usuário autenticado."
    >
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-950">Novo veículo</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["placa", "Placa"],
              ["marca", "Marca"],
              ["modelo", "Modelo"],
              ["chassi", "Chassi"]
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-sm font-extrabold text-slate-700">{label}</span>
                <input
                  value={String(form[key as keyof typeof form])}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-slate-700">Ano</span>
              <input
                type="number"
                min={1900}
                max={2100}
                value={form.ano}
                onChange={(event) => setForm((current) => ({ ...current, ano: Number(event.target.value) }))}
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 min-h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400"
          >
            {isSaving ? "Salvando..." : "Cadastrar veículo"}
          </button>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">Veículos cadastrados</h2>
              <p className="text-sm text-slate-600">{vehicles.length} registro(s)</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm font-bold text-slate-500">Carregando...</div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhum veículo encontrado.
            </div>
          ) : (
            <div className="grid gap-3">
              {vehicles.map((vehicle) => (
                <article key={vehicle.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-950">
                        {vehicle.marca} {vehicle.modelo}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Placa {vehicle.placa} | Ano {vehicle.ano} | Chassi {vehicle.chassi || "--"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(vehicle.id)}
                      className="min-h-10 rounded-md border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
                    >
                      Excluir
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
