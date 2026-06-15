"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BASE_URL,
  fetchDashboard,
  getStoredBaseUrl,
  saveBaseUrl,
  updateVehicleConfig,
  verifySync
} from "@/src/lib/api";
import type {
  DashboardData,
  DeviceCommand,
  EventConfig,
  LogEntry
} from "@/src/types/telemetry";

const emptyDashboard: DashboardData = {
  vehicle: null,
  status: {
    connected: false,
    deviceName: "Backend nao conectado",
    firmwareVersion: "-",
    lastSyncAt: null
  },
  telemetry: null,
  logs: [],
  config: null
};

function createLocalLog(level: LogEntry["level"], message: string): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString()
  };
}

export function useTelemetry() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    setBaseUrl(getStoredBaseUrl());
  }, []);

  const updateBaseUrl = useCallback((value: string) => {
    setBaseUrl(value);
    saveBaseUrl(value);
  }, []);

  const pushLocalLog = useCallback((level: LogEntry["level"], message: string) => {
    setDashboard((current) => ({
      ...current,
      logs: [createLocalLog(level, message), ...current.logs].slice(0, 30)
    }));
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    const result = await fetchDashboard(baseUrl);

    if (result.ok) {
      setDashboard(result.data);
      setError(null);
    } else {
      setDashboard((current) => ({
        ...current,
        status: emptyDashboard.status,
        logs: [createLocalLog("error", result.message), ...current.logs].slice(0, 30)
      }));
      setError(result.message);
    }

    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
  }, [baseUrl]);

  const testConnection = useCallback(async () => {
    setIsLoading(true);

    const result = await fetchDashboard(baseUrl);

    if (result.ok) {
      setDashboard((current) => ({
        ...result.data,
        logs: [
          createLocalLog("info", "Conexao com backend testada com sucesso."),
          ...result.data.logs
        ].slice(0, 30)
      }));
      setError(null);
    } else {
      setError(result.message);
      setDashboard((current) => ({
        ...current,
        status: emptyDashboard.status,
        logs: [createLocalLog("error", result.message), ...current.logs].slice(0, 30)
      }));
    }

    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
  }, [baseUrl]);

  const runCommand = useCallback(
    async (command: DeviceCommand) => {
      setIsCommandRunning(true);

      if (command === "sync") {
        const result = await verifySync(baseUrl);

      if (result.ok) {
          const updated =
            result.data.dispositivosMarcadosComoNaoSincronizados ??
            result.data.atualizados ??
            0;
          setError(null);
          pushLocalLog("info", `Verificacao concluida. ${updated} dispositivo(s) marcado(s) como nao sincronizado(s).`);
          await refresh();
        } else {
          setError(result.message);
          pushLocalLog("error", result.message);
        }
      }

      setIsCommandRunning(false);
    },
    [baseUrl, pushLocalLog, refresh]
  );

  const saveConfig = useCallback(
    async (config: EventConfig) => {
      if (!dashboard.vehicle) {
        setError("Nenhum veiculo disponivel para atualizar configuracao.");
        return;
      }

      setIsSavingConfig(true);

      const result = await updateVehicleConfig(baseUrl, dashboard.vehicle.id, config);

      if (result.ok) {
        setDashboard((current) => ({
          ...current,
          config: {
            limiteVelocidade: result.data.limiteVelocidade,
            tempoParadaLongaMinutos: result.data.tempoParadaLongaMinutos,
            limiteFrenagemBrusca: result.data.limiteFrenagemBrusca,
            limiteAceleracaoBrusca: result.data.limiteAceleracaoBrusca
          },
          logs: [
            createLocalLog("info", "Configuracao de eventos atualizada no backend."),
            ...current.logs
          ].slice(0, 30)
        }));
        setError(null);
      } else {
        setError(result.message);
        pushLocalLog("error", result.message);
      }

      setIsSavingConfig(false);
    },
    [baseUrl, dashboard.vehicle, pushLocalLog]
  );

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
    baseUrl,
    updateBaseUrl,
    dashboard,
    error,
    lastUpdated,
    isLoading,
    isCommandRunning,
    isSavingConfig,
    refresh,
    testConnection,
    runCommand,
    saveConfig
  };
}
