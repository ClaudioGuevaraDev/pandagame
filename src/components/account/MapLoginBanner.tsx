"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LEVELS } from "@/content/challenges";
import { useAuth } from "@/lib/cloud/auth";
import { levelProgress } from "@/lib/progress/unlock";
import type { CompletedInfo } from "@/lib/progress/store";
import { LoginNudge } from "./LoginNudge";

const KEY = "pandagame-login-nudge";

function readDismissed(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? -1);
  } catch {
    return -1;
  }
}

/**
 * Invitación a guardar el avance en el mapa: aparece tras el primer reto. Si se
 * descarta, vuelve a aparecer al completar un nivel nuevo.
 */
export function MapLoginBanner({ completed }: { completed: Record<string, CompletedInfo> }) {
  const signedOut = useAuth((s) => s.status === "out");
  const levelsDone = LEVELS.filter((l) => {
    const p = levelProgress(l.id, completed);
    return p.done === p.total;
  }).length;
  const [dismissed, setDismissed] = useState(readDismissed);

  if (!signedOut || Object.keys(completed).length === 0 || levelsDone <= dismissed) return null;

  const dismiss = () => {
    setDismissed(levelsDone);
    try {
      localStorage.setItem(KEY, String(levelsDone));
    } catch {}
  };

  return (
    <div className="ink-in fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-md items-center gap-1 rounded-lg bg-paper-3 shadow-[3px_4px_0_0_var(--ink)]">
      <LoginNudge
        className="flex-1 border-solid"
        text={`Llevas ${Object.keys(completed).length} ${Object.keys(completed).length === 1 ? "reto" : "retos"}. Guarda tu avance para no perderlo.`}
      />
      <button onClick={dismiss} className="btn-ghost absolute -right-2 -top-2 rounded-full border-2 border-ink bg-paper-3 p-0.5" aria-label="Descartar aviso">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
