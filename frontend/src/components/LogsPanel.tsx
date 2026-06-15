import type { LogEntry } from "@/src/types/telemetry";

type LogsPanelProps = {
  logs: LogEntry[];
};

const levelClasses: Record<LogEntry["level"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800"
};

function formatLogTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "medium"
  }).format(new Date(value));
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const visibleLogs = logs.slice(0, 30);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Logs recentes</h2>
          <p className="mt-1 text-sm text-slate-600">
            {visibleLogs.length} de {logs.length} evento(s)
          </p>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-auto rounded-md border border-slate-200 bg-slate-50">
        {logs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhum evento veicular recebido.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {visibleLogs.map((log, index) => (
              <li key={`${log.timestamp}-${index}`} className="grid gap-3 bg-white px-4 py-3 sm:grid-cols-[82px_76px_minmax(0,1fr)] sm:items-start">
                <div>
                  <time className="text-sm font-bold text-slate-500">{formatLogTime(log.timestamp)}</time>
                </div>
                <div>
                  <span className={`w-fit rounded-full border px-2 py-1 text-xs font-extrabold uppercase ${levelClasses[log.level]}`}>
                    {log.level}
                  </span>
                </div>
                <p className="text-sm leading-5 text-slate-800">{log.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
