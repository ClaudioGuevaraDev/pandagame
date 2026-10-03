import { ALL_CHALLENGES, challengeHref } from "../../content/challenges/index.ts";

const CHALLENGE_PATH = /^\/jugar\/[^/]+\/\d+\/?$/;

/**
 * Adónde llevar al jugador justo después de iniciar sesión: si estaba en un reto
 * (por ejemplo, el 1 en un dispositivo nuevo), a su reto actual según el progreso
 * ya fusionado con la nube. null si debe quedarse donde está.
 */
export function postLoginTarget(pathname: string, completed: Record<string, unknown>): string | null {
  if (!CHALLENGE_PATH.test(pathname)) return null;
  const current = ALL_CHALLENGES.find((c) => !completed[c.id]);
  if (!current) return null;
  const href = challengeHref(current);
  return pathname.replace(/\/$/, "") === href ? null : href;
}
