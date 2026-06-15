"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/src/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAuthSession() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
        Carregando painel...
      </div>
    </main>
  );
}
