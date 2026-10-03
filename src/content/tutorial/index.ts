import type { Lesson } from "../types.ts";
import { fundamentos } from "./fundamentos.ts";
import { seleccion } from "./seleccion.ts";
import { transformacion } from "./transformacion.ts";
import { limpieza } from "./limpieza.ts";
import { agregacion } from "./agregacion.ts";
import { combinar } from "./combinar.ts";
import { reestructurar } from "./reestructurar.ts";
import { seriesTemporales } from "./series-temporales.ts";
import { experto } from "./experto.ts";

export const LESSONS: Lesson[] = [
  fundamentos,
  seleccion,
  transformacion,
  limpieza,
  agregacion,
  combinar,
  reestructurar,
  seriesTemporales,
  experto,
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
