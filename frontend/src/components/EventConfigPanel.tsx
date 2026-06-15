"use client";

import { useEffect, useState } from "react";
import type { EventConfig, VehicleInfo } from "@/src/types/telemetry";

type EventConfigPanelProps = {
  vehicle: VehicleInfo | null;
  config: EventConfig | null;
  isSaving: boolean;
  onSave: (config: EventConfig) => Promise<void>;
};

const defaultConfig: EventConfig = {
  limiteVelocidade: 80,
  tempoParadaLongaMinutos: 10,
  limiteFrenagemBrusca: 20,
  limiteAceleracaoBrusca: 25
};

type Field = {
  key: keyof EventConfig;
  label: string;
  unit: string;
  min: number;
};

const fields: Field[] = [
  {
    key: "limiteVelocidade",
    label: "Excesso de velocidade",
    unit: "km/h",
    min: 1
  },
  {
    key: "tempoParadaLongaMinutos",
    label: "Parada prolongada",
    unit: "min",
    min: 1
  },
  {
    key: "limiteFrenagemBrusca",
    label: "Frenagem brusca",
    unit: "km/h",
    min: 1
  },
  {
    key: "limiteAceleracaoBrusca",
    label: "Aceleração brusca",
    unit: "km/h",
    min: 1
  }
];

export function EventConfigPanel({
  vehicle,
  config,
  isSaving,
  onSave
}: EventConfigPanelProps) {
  const [form, setForm] = useState<EventConfig>(config ?? defaultConfig);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setForm(config ?? defaultConfig);
    }
  }, [config, isDirty]);

  function updateField(key: keyof EventConfig, value: string) {
    const numericValue = Number(value);
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      [key]: Number.isFinite(numericValue) ? numericValue : 0
    }));
  }

  async function handleSave() {
    await onSave(form);
    setIsDirty(false);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Configuração dos eventos</h2>
          <p className="text-sm text-slate-600">
            Limites usados pelo backend ao gerar eventos derivados.
          </p>
        </div>
        {vehicle ? (
          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-extrabold text-slate-700">
            {vehicle.plate}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-sm font-extrabold text-slate-700">{field.label}</span>
            <div className="flex min-h-11 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <input
                type="number"
                min={field.min}
                step={field.key === "tempoParadaLongaMinutos" ? 1 : 0.1}
                value={form[field.key]}
                onFocus={() => setIsDirty(true)}
                onInput={(event) => updateField(field.key, event.currentTarget.value)}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="min-w-0 flex-1 border-0 px-3 text-sm font-bold text-slate-950 outline-none"
              />
              <span className="grid w-14 place-items-center border-l border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-500">
                {field.unit}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          O dispositivo recebe esses limites no ACK, mas os eventos são calculados no backend.
        </p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!vehicle || isSaving}
          className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Salvando..." : "Salvar configuração"}
        </button>
      </div>
    </section>
  );
}
