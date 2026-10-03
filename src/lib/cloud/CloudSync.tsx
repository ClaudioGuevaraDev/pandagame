"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { startAuth, takeJustSignedIn, useAuth } from "./auth";
import { postLoginTarget } from "./post-login";
import { flushAnswers, scheduleFlush } from "./answers";
import { flushPush, schedulePush, startSync, stopSync } from "./sync";

/** Conecta la sesión con el progreso y el registro de respuestas. No dibuja nada. */
export function CloudSync() {
  const hydrated = useHasHydrated();
  const userId = useAuth((s) => s.user?.id ?? null);
  const router = useRouter();

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
    void startSync(userId).then((merged) => {
      scheduleFlush(0);
      // Recién vuelto de Google en un reto: al reto donde se quedó (con el progreso ya fusionado).
      if (!takeJustSignedIn() || !merged) return;
      const target = postLoginTarget(window.location.pathname, useProgress.getState().completed);
      if (target) router.replace(target as Route);
    });
    return useProgress.subscribe(schedulePush);
  }, [hydrated, userId, router]);

  return null;
}
