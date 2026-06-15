type ConfigPanelProps = {
  baseUrl: string;
  isLoading: boolean;
  onBaseUrlChange: (value: string) => void;
  onTestConnection: () => void;
};

export function ConfigPanel({
  baseUrl,
  isLoading,
  onBaseUrlChange,
  onTestConnection
}: ConfigPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Configuração da API</h2>
          <p className="text-sm text-slate-600">Conexão com o backend NestJS que grava no PostgreSQL.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:items-end">
        <div>
          <div className="text-sm font-extrabold text-slate-700">Fonte de dados</div>
          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-800">
            Backend real conectado por API REST
          </div>
        </div>

        <div>
          <label htmlFor="backend-url" className="mb-2 block text-sm font-extrabold text-slate-700">
            URL base da API
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="backend-url"
              type="url"
              value={baseUrl}
              onChange={(event) => onBaseUrlChange(event.target.value)}
              placeholder="http://localhost:8080"
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isLoading}
              className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Testar conexão
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
