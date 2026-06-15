"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TelemetryDashboard } from "@/src/components/TelemetryDashboard";
import { getAuthSession, type AuthSession } from "@/src/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    setSession(currentSession);
    setIsChecking(false);
  }, [router]);

  if (isChecking || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
          Verificando acesso...
        </div>
      </main>
    );
  }

  return (
    <TelemetryDashboard
      user={session.usuario}
      onLogout={() => router.replace("/login")}
    />
  );
}
