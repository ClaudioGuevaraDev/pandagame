import type { Route } from "next";
import type { Scene } from "../types.ts";
import { prologoYBosque } from "./facil.ts";
import { rio } from "./medio.ts";
import { cumbre } from "./dificil.ts";

/** Todas las escenas en orden: prólogo y una después de cada reto. */
export const SCENES: Scene[] = [...prologoYBosque, ...rio, ...cumbre];

export function getScene(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}

/** Escena que se desbloquea al completar un reto (null = el prólogo). */
export function sceneAfter(challengeId: string | null): Scene | undefined {
  return SCENES.find((s) => s.after === challengeId);
}

export const sceneHref = (s: Scene) => `/historia/${s.id}` as Route;
