"use client";

import { ALL_CHALLENGES } from "@/content/challenges";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber, currentChallenge } from "@/lib/progress/unlock";

const EMPTY: Record<string, never> = {};

/**
 * Progreso para el inicio. Hasta hidratar se usa un progreso vacío, para que el
 * HTML del servidor y el primer render del cliente coincidan.
 */
export function useHomeProgress() {
  const hydrated = useHasHydrated();
  const stored = useProgress((s) => s.completed);
  const completed = hydrated ? stored : EMPTY;
  const done = Object.keys(completed).length;
  const current = currentChallenge(completed);
  return {
    hydrated,
    done,
    total: ALL_CHALLENGES.length,
    current,
    currentNumber: current ? challengeNumber(current.id) : 0,
    started: done > 0,
  };
}
