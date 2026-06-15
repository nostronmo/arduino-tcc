"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getAuthSession } from "@/src/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/veiculos", label: "Veículos" },
  { href: "/dispositivos", label: "Dispositivos" },
  { href: "/historico", label: "Histórico" },
  { href: "/eventos", label: "Eventos" }
];

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function AppShell({
  children,
  title,
  description
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getAuthSession();

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-sky-700">
                  Sistema TCC
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-emerald-700">
                  Backend real
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                {description}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-extrabold uppercase tracking-normal text-slate-500">
                Operador
              </div>
              <div className="mt-1 max-w-72 truncate text-sm font-bold text-slate-950">
                {session?.usuario.nome ?? "Visualização local"} | {session?.usuario.email ?? "demo@local"}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-950 px-5 py-3">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "rounded-md bg-white px-3 py-2 text-sm font-extrabold text-slate-950"
                      : "rounded-md px-3 py-2 text-sm font-extrabold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="ml-auto rounded-md border border-white/20 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Sair
            </button>
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
