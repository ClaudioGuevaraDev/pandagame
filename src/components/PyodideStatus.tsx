"use client";

import { Loader2 } from "lucide-react";
import { useRunnerStatus } from "@/lib/pyodide/runner";

export function PyodideStatus() {
  const { status, error } = useRunnerStatus();
  const label = {
    idle: "Python en espera",
    loading: "Cargando Python + pandas…",
    ready: "Python listo",
    running: "Ejecutando…",
    error: "Error al cargar Python",
  }[status];
  const dot = {
    idle: "bg-zinc-500",
    loading: "bg-amber-400",
    ready: "bg-emerald-400",
    running: "bg-sky-400",
    error: "bg-red-500",
  }[status];
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400" title={error ?? undefined}>
      {status === "loading" || status === "running" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      )}
      {label}
    </span>
  );
}
