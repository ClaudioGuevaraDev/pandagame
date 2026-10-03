import { ALL_CHALLENGES, LEVELS } from "@/content/challenges";
import type { Challenge, LevelId } from "@/content/types";

type Completed = Record<string, unknown>;

/** Posición de cada reto en el orden de juego. */
const INDEX = new Map(ALL_CHALLENGES.map((c, i) => [c.id, i]));

/** Número de reto global (1..30). */
export function challengeNumber(id: string): number {
  return (INDEX.get(id) ?? -1) + 1;
}

/** Índice del primer reto sin completar, o ALL_CHALLENGES.length si se completó todo. */
export function firstOpenIndex(completed: Completed): number {
  const i = ALL_CHALLENGES.findIndex((c) => !completed[c.id]);
  return i === -1 ? ALL_CHALLENGES.length : i;
}

/** Un reto está desbloqueado si todos los anteriores (en orden de juego) están completados. */
export function isChallengeUnlocked(id: string, completed: Completed, firstOpen = firstOpenIndex(completed)): boolean {
  const idx = INDEX.get(id);
  return idx !== undefined && idx <= firstOpen;
}

export function isLevelUnlocked(levelId: LevelId, completed: Completed): boolean {
  const first = LEVELS.find((l) => l.id === levelId)?.challenges[0];
  return !!first && isChallengeUnlocked(first.id, completed);
}

/** Primer reto no completado (el "actual"), o undefined si se completó todo. */
export function currentChallenge(completed: Completed): Challenge | undefined {
  return ALL_CHALLENGES[firstOpenIndex(completed)];
}

export function nextChallenge(id: string): Challenge | undefined {
  const idx = INDEX.get(id);
  return idx === undefined ? undefined : ALL_CHALLENGES[idx + 1];
}

export function levelProgress(levelId: LevelId, completed: Completed) {
  const challenges = LEVELS.find((l) => l.id === levelId)?.challenges ?? [];
  const done = challenges.filter((c) => completed[c.id]).length;
  return { done, total: challenges.length };
}
