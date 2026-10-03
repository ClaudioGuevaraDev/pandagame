import type { ChallengeIconName } from "./icons.ts";

export type LevelId = "facil" | "medio" | "dificil";

export type ChallengeTest = {
  /** Nombre visible para el usuario, ej. "result es un DataFrame". */
  name: string;
  /**
   * Código Python con `assert`s. Se ejecuta en una copia del namespace del
   * usuario (después de `setup` + código del usuario). Tiene disponibles
   * `pd`, `np` y los helpers `check_frame` / `check_series`.
   */
  code: string;
};

export type Challenge = {
  /** ej. "facil-1" */
  id: string;
  level: LevelId;
  /** Posición dentro del nivel, empezando en 1. */
  number: number;
  /** Nombre del reto, ej. "Primer brote". */
  title: string;
  /** Icono de lucide-react registrado en icons.ts, ej. "Sprout". */
  icon: ChallengeIconName;
  /** Tema corto, ej. "Crear DataFrames". */
  topic: string;
  /** Contexto de la historia (voz del narrador), se muestra sobre el enunciado. */
  mision: string;
  /** Enunciado en markdown. */
  description: string;
  /** Python que prepara los datos (se ejecuta antes del código del usuario). */
  setup: string;
  starterCode: string;
  /** Solución de referencia: debe pasar todos los tests. */
  solution: string;
  hints: string[];
  tests: ChallengeTest[];
  /** Slug de la lección relacionada del tutorial. */
  tutorialLink?: string;
};

export type Level = {
  id: LevelId;
  name: string;
  difficulty: string;
  description: string;
  challenges: Challenge[];
};

export type LessonBlock =
  | { type: "markdown"; content: string }
  | { type: "code"; code: string; title?: string }
  /** Guía visual de los botones de un reto (componente ChallengeGuide). */
  | { type: "guide" };

export type Lesson = {
  slug: string;
  module: number;
  title: string;
  summary: string;
  blocks: LessonBlock[];
  /** ids de retos relacionados, ej. ["facil-1"] */
  relatedChallenges?: string[];
};
