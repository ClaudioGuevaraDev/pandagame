"use client";

import { useEffect } from "react";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { startAuth, useAuth } from "./auth";
import { flushAnswers, scheduleFlush } from "./answers";
import { flushPush, schedulePush, startSync, stopSync } from "./sync";

/** Conecta la sesión con el progreso y el registro de respuestas. No dibuja nada. */
export function CloudSync() {
  const hydrated = useHasHydrated();
  const userId = useAuth((s) => s.user?.id ?? null);

  useEffect(() => {
    startAuth();
    const online = () => {
      void flushAnswers();
      flushPush();
    };
    window.addEventListener("online", online);
    window.addEventListener("pagehide", flushPush);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("pagehide", flushPush);
    };
  }, []);

  // El progreso local debe estar leído antes de fusionarlo con el de la nube.
  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      stopSync();
      return;
    }
    void startSync(userId).then(() => scheduleFlush(0));
    return useProgress.subscribe(schedulePush);
  }, [hydrated, userId]);

  return null;
}
