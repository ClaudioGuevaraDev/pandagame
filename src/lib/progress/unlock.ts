import { ALL_CHALLENGES, LEVELS } from "@/content/challenges";
import type { Challenge, LevelId } from "@/content/types";

type Completed = Record<string, unknown>;

/** Un reto está desbloqueado si todos los anteriores (en orden de juego) están completados. */
export function isChallengeUnlocked(id: string, completed: Completed): boolean {
  const idx = ALL_CHALLENGES.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  return ALL_CHALLENGES.slice(0, idx).every((c) => completed[c.id]);
}

export function isLevelUnlocked(levelId: LevelId, completed: Completed): boolean {
  const first = LEVELS.find((l) => l.id === levelId)?.challenges[0];
  return !!first && isChallengeUnlocked(first.id, completed);
}

/** Primer reto no completado (el "actual"), o undefined si se completó todo. */
export function currentChallenge(completed: Completed): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => !completed[c.id]);
}

export function nextChallenge(id: string): Challenge | undefined {
  const idx = ALL_CHALLENGES.findIndex((c) => c.id === id);
  return idx >= 0 ? ALL_CHALLENGES[idx + 1] : undefined;
}

export function levelProgress(levelId: LevelId, completed: Completed) {
  const level = LEVELS.find((l) => l.id === levelId)!;
  const done = level.challenges.filter((c) => completed[c.id]).length;
  return { done, total: level.challenges.length };
}
