"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/src/components/AppShell";
import { fetchEvents, getStoredBaseUrl } from "@/src/lib/api";
import type { EventRecord } from "@/src/types/telemetry";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export default function EventosPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const result = await fetchEvents(getStoredBaseUrl());

      if (result.ok) {
        setEvents(result.data);
        setError(null);
      } else {
        setError(result.message);
        setEvents([]);
      }

      setIsLoading(false);
    }

    void loadEvents();
  }, []);

  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.tipo))).sort(),
    [events]
  );

  const filteredEvents = events.filter((event) => {
    const matchesSeverity = !severity || event.severidade === severity;
    const matchesType = !type || event.tipo === type;
    return matchesSeverity && matchesType;
  });

  return (
    <AppShell
      title="Eventos veiculares"
      description="Consulte eventos do usuário com filtros por severidade e tipo."
    >
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 border-b border-slate-200 pb-4 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Consulta de eventos</h2>
            <p className="text-sm text-slate-600">{filteredEvents.length} evento(s)</p>
          </div>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Todas as severidades</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Todos os tipos</option>
            {eventTypes.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-sm font-bold text-slate-500">Carregando...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nenhum evento encontrado.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredEvents.map((event, index) => (
              <article key={`${event.id ?? event.timestamp}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">{event.tipo}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-700">{event.descricao}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">{formatDate(event.timestamp)}</p>
                  </div>
                  <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
                    {event.severidade}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
