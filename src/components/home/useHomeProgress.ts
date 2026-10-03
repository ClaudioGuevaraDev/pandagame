"use client";

import { ALL_CHALLENGES } from "@/content/challenges";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber, currentChallenge } from "@/lib/progress/unlock";
import { nextStop } from "@/lib/story/unlocks";

const EMPTY: Record<string, never> = {};

/**
 * Progreso para el inicio. Hasta hidratar se usa un progreso vacío, para que el
 * HTML del servidor y el primer render del cliente coincidan.
 */
export function useHomeProgress() {
  const hydrated = useHasHydrated();
  const stored = useProgress((s) => s.completed);
  const storedSeen = useProgress((s) => s.scenesSeen);
  const completed = hydrated ? stored : EMPTY;
  const scenesSeen = hydrated ? storedSeen : EMPTY;
  const done = Object.keys(completed).length;
  const current = currentChallenge(completed);
  return {
    hydrated,
    done,
    total: ALL_CHALLENGES.length,
    current,
    currentNumber: current ? challengeNumber(current.id) : 0,
    /** Siguiente parada: una escena pendiente o el reto actual. */
    stop: nextStop(completed, scenesSeen),
    started: done > 0,
  };
}
