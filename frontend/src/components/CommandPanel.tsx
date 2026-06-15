import type { DeviceCommand } from "@/src/types/telemetry";

type CommandPanelProps = {
  isBusy: boolean;
  isLoading: boolean;
  onCommand: (command: DeviceCommand) => void;
  onRefresh: () => void;
};

const commandButtons: Array<{
  label: string;
  command: DeviceCommand;
  className: string;
}> = [
  {
    label: "Verificar sincronização",
    command: "sync",
    className: "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
  }
];

export function CommandPanel({
  isBusy,
  isLoading,
  onCommand,
  onRefresh
}: CommandPanelProps) {
  const disabled = isBusy || isLoading;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-extrabold text-slate-950">Operação</h2>
        <p className="mt-1 text-sm text-slate-600">Ações reais expostas pelo backend para o dispositivo.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {commandButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => onCommand(button.command)}
            disabled={disabled}
            className={`min-h-11 rounded-md border px-4 text-sm font-extrabold shadow-sm transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${button.className}`}
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          className="min-h-11 rounded-md border border-slate-300 bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          Atualizar agora
        </button>
      </div>
    </section>
  );
}
