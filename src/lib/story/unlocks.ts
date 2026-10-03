import { ALL_CHALLENGES, LEVELS } from "@/content/challenges";
import { LESSONS } from "@/content/tutorial";
import { SCENES, sceneAfter } from "@/content/story/scenes";
import { UNLOCKS } from "@/content/story/unlocks";
import type { PerkId, Scene, Unlock } from "@/content/story/types";
import { challengeNumber, currentChallenge, firstOpenIndex } from "@/lib/progress/unlock";

/**
 * Todo lo que se desbloquea en la historia se deriva de los retos completados:
 * así nunca se desincroniza del progreso.
 */
type Completed = Record<string, unknown>;

export function isUnlocked(u: Unlock, completed: Completed): boolean {
  return u.after === null || !!completed[u.after];
}

export function ownedUnlocks(completed: Completed): Unlock[] {
  return UNLOCKS.filter((u) => isUnlocked(u, completed));
}

/** Recompensas que aparecen en el Diario (las lecciones van en el tutorial). */
export const COLLECTIBLES = UNLOCKS.filter((u) => u.kind !== "lesson");

export function ownedCollectibles(completed: Completed): number {
  return COLLECTIBLES.filter((u) => isUnlocked(u, completed)).length;
}

/** Recompensas que se obtienen al completar un reto (o en el prólogo, con null). */
export function unlocksAfter(challengeId: string | null): Unlock[] {
  return UNLOCKS.filter((u) => u.after === challengeId);
}

export function hasPerk(perk: PerkId, completed: Completed): boolean {
  return UNLOCKS.some((u) => u.perk === perk && isUnlocked(u, completed));
}

export const perkUnlock = (perk: PerkId) => UNLOCKS.find((u) => u.perk === perk);

const HINT_SCROLLS = UNLOCKS.filter((u) => u.kind === "hints").sort((a, b) => (a.hints ?? 0) - (b.hints ?? 0));

/** Cuántas pistas por reto se pueden ver ahora. */
export function hintsAllowed(completed: Completed): number {
  return HINT_SCROLLS.reduce((n, u) => (isUnlocked(u, completed) ? Math.max(n, u.hints ?? 0) : n), 0);
}

/** El siguiente pergamino de pistas por conseguir (para explicar el candado). */
export function nextHintScroll(completed: Completed): Unlock | undefined {
  return HINT_SCROLLS.find((u) => !isUnlocked(u, completed));
}

export function lessonUnlock(slug: string): Unlock | undefined {
  return UNLOCKS.find((u) => u.kind === "lesson" && u.lesson === slug);
}

export function isLessonUnlocked(slug: string, completed: Completed): boolean {
  const u = lessonUnlock(slug);
  return !u || isUnlocked(u, completed);
}

/** Texto "Reto N · Título" del reto que hay que completar para obtener algo. */
export function unlockSource(u: Unlock): string {
  if (!u.after) return "el prólogo";
  const c = ALL_CHALLENGES.find((x) => x.id === u.after);
  return c ? `el reto ${challengeNumber(c.id)} · ${c.title}` : u.after;
}

// ── Escenas ─────────────────────────────────────────────────────────────

export function isSceneUnlocked(scene: Scene, completed: Completed): boolean {
  return scene.after === null || !!completed[scene.after];
}

/**
 * La siguiente parada del jugador: una escena desbloqueada sin ver (en orden)
 * o, si no hay ninguna, el reto actual. undefined si ya terminó todo.
 */
export function nextStop(
  completed: Completed,
  scenesSeen: Record<string, unknown>,
): { type: "scene"; scene: Scene } | { type: "challenge"; challenge: (typeof ALL_CHALLENGES)[number] } | undefined {
  const current = currentChallenge(completed);
  // Solo la escena justo anterior al reto actual (no se obliga a ver escenas viejas).
  const i = firstOpenIndex(completed);
  const pending = sceneAfter(i === 0 ? null : ALL_CHALLENGES[i - 1].id);
  if (pending && isSceneUnlocked(pending, completed) && !scenesSeen[pending.id]) return { type: "scene", scene: pending };
  return current ? { type: "challenge", challenge: current } : undefined;
}

// ── Logros ──────────────────────────────────────────────────────────────

export type ProgressSnapshot = {
  completed: Record<string, { attempts: number }>;
  scenesSeen: Record<string, unknown>;
  hintsUsed: Record<string, number>;
  tutorialRead: Record<string, unknown>;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  /** Carácter del sello. */
  char: string;
  check: (p: ProgressSnapshot) => boolean;
};

const firstTry = (p: ProgressSnapshot) => Object.values(p.completed).filter((c) => c.attempts === 1).length;
const levelDone = (p: ProgressSnapshot, i: number) => LEVELS[i].challenges.every((c) => p.completed[c.id]);
const ITEMS = UNLOCKS.filter((u) => u.kind === "item");

export const ACHIEVEMENTS: Achievement[] = [
  { id: "primer-sello", name: "Primer sello", description: "Completa tu primer reto.", char: "一", check: (p) => Object.keys(p.completed).length > 0 },
  { id: "a-la-primera", name: "A la primera", description: "Supera un reto en el primer intento.", char: "的", check: (p) => firstTry(p) >= 1 },
  { id: "racha", name: "Pulso firme", description: "Supera 10 retos en el primer intento.", char: "迅", check: (p) => firstTry(p) >= 10 },
  { id: "bosque", name: "Guardián del bosque", description: "Completa el Bosque de Bambú.", char: "竹", check: (p) => levelDone(p, 0) },
  { id: "rio", name: "Señor del río", description: "Completa el Río de Datos.", char: "川", check: (p) => levelDone(p, 1) },
  {
    id: "sin-pistas",
    name: "Sin pergaminos",
    description: "Completa un nivel entero sin abrir ninguna pista.",
    char: "独",
    check: (p) => LEVELS.some((l, i) => levelDone(p, i) && l.challenges.every((c) => !p.hintsUsed[c.id])),
  },
  { id: "lector", name: "Lector de cómics", description: "Ve todas las escenas de la historia.", char: "絵", check: (p) => SCENES.every((s) => p.scenesSeen[s.id]) },
  { id: "erudito", name: "Erudito", description: "Lee todas las lecciones del tutorial.", char: "学", check: (p) => LESSONS.every((l) => p.tutorialRead[l.slug]) },
  { id: "coleccionista", name: "Coleccionista", description: "Reúne todos los objetos de la historia.", char: "宝", check: (p) => ITEMS.every((u) => isUnlocked(u, p.completed)) },
  { id: "maestro", name: "Maestro Panda", description: "Completa los 30 retos y resuelve el misterio.", char: "師", check: (p) => ALL_CHALLENGES.every((c) => p.completed[c.id]) },
];
