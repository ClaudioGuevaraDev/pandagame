import type { Challenge, Level, LevelId } from "../types.ts";
import { facil } from "./facil.ts";
import { medio } from "./medio.ts";
import { dificil } from "./dificil.ts";

export const LEVELS: Level[] = [
  {
    id: "facil",
    name: "Bosque de Bambú",
    difficulty: "Fácil",
    description: "Tus primeros pasos: crear, explorar, filtrar y ordenar DataFrames.",
    challenges: facil,
  },
  {
    id: "medio",
    name: "Río de Datos",
    difficulty: "Medio",
    description: "Limpieza, texto, agrupaciones y combinación de tablas.",
    challenges: medio,
  },
  {
    id: "dificil",
    name: "Cumbre del Maestro Panda",
    difficulty: "Difícil",
    description: "Reestructuración, series temporales y pipelines de nivel experto.",
    challenges: dificil,
  },
];

/** Todos los retos en orden de juego. */
export const ALL_CHALLENGES: Challenge[] = LEVELS.flatMap((l) => l.challenges);

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getChallenge(levelId: string, number: number): Challenge | undefined {
  return getLevel(levelId)?.challenges.find((c) => c.number === number);
}

export function getChallengeById(id: string): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
}

export function challengeHref(c: Pick<Challenge, "level" | "number">): string {
  return `/jugar/${c.level}/${c.number}`;
}

export function isLevelId(id: string): id is LevelId {
  return LEVELS.some((l) => l.id === id);
}
