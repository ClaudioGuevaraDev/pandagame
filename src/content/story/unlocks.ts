import { ALL_CHALLENGES } from "../challenges/index.ts";
import { LESSONS } from "../tutorial/index.ts";
import type { Unlock } from "./types.ts";

/**
 * Recompensas de la historia. Para mover una recompensa a otro momento basta con
 * cambiar su `after` (el reto tras el cual se obtiene; null = desde el prólogo).
 */
const REWARDS: Unlock[] = [
  {
    id: "pincel",
    kind: "item",
    name: "Pincel de datos",
    description: "El pincel de la Maestra Lin. Con él, cada tabla cuenta su verdad (es decir: pandas).",
    icon: "Brush",
    after: null,
  },
  {
    id: "pistas-1",
    kind: "hints",
    name: "Pergamino de pistas I",
    description: "Desbloquea la primera pista de cada reto.",
    icon: "Scroll",
    after: "facil-3",
    hints: 1,
  },
  {
    id: "huella",
    kind: "item",
    name: "Huella en el barro",
    description: "Pequeña, con garras. No es de panda.",
    icon: "Footprints",
    after: "facil-4",
  },
  {
    id: "brujula",
    kind: "perk",
    name: "Brújula de bambú",
    description: "Autocompletado en el editor: sugiere funciones y métodos de pandas mientras escribes.",
    icon: "Compass",
    after: "facil-5",
    perk: "autocompletar",
  },
  {
    id: "pagina",
    kind: "item",
    name: "Página arrancada",
    description: "Una hoja del inventario de bambú, sin la columna del total.",
    icon: "FileX",
    after: "facil-6",
  },
  {
    id: "lupa",
    kind: "perk",
    name: "Lupa de Bao",
    description: "Botón «Ver datos» en cada reto: muestra las tablas de entrada antes de tocarlas.",
    icon: "Search",
    after: "facil-8",
    perk: "ver-datos",
  },
  {
    id: "linterna",
    kind: "item",
    name: "Linterna de guardia",
    description: "Para vigilar el almacén en las noches de luna.",
    icon: "Flashlight",
    after: "facil-9",
  },
  {
    id: "pistas-2",
    kind: "hints",
    name: "Pergamino de pistas II",
    description: "Desbloquea la segunda pista de cada reto.",
    icon: "ScrollText",
    after: "facil-10",
    hints: 2,
  },
  {
    id: "registro-falso",
    kind: "item",
    name: "Registro falsificado",
    description: "Refuerzos de vacunas que nunca se pusieron.",
    icon: "FileWarning",
    after: "medio-2",
  },
  {
    id: "catalejo",
    kind: "perk",
    name: "Catalejo",
    description: "Cuando un test falla, compara la tabla esperada y la tuya celda por celda.",
    icon: "Telescope",
    after: "medio-5",
    perk: "comparar",
  },
  {
    id: "coartada",
    kind: "item",
    name: "Coartada de Kiko",
    description: "Los tiempos del torneo prueban que Kiko estaba trepando.",
    icon: "Award",
    after: "medio-6",
  },
  {
    id: "sello-luna",
    kind: "item",
    name: "Sello de luna",
    description: "Encontrado en una caja que nadie registró.",
    icon: "Moon",
    after: "medio-9",
  },
  {
    id: "pistas-3",
    kind: "hints",
    name: "Pergamino de pistas III",
    description: "Desbloquea todas las pistas de cada reto.",
    icon: "ScrollText",
    after: "medio-10",
    hints: Infinity,
  },
  {
    id: "pincel-maestro",
    kind: "perk",
    name: "Pincel del maestro",
    description: "Ya puedes pegar código en el editor de los retos.",
    icon: "PenTool",
    after: "medio-10",
    perk: "pegar",
  },
  {
    id: "llave",
    kind: "item",
    name: "Llave del almacén de invierno",
    description: "Escondida entre los registros de la clínica.",
    icon: "Key",
    after: "dificil-3",
  },
  {
    id: "mapa-almacenes",
    kind: "item",
    name: "Mapa de almacenes",
    description: "Los almacenes del santuario, ordenados por bambú guardado.",
    icon: "MapPinned",
    after: "dificil-7",
  },
  {
    id: "sello-maestro",
    kind: "item",
    name: "Sello del Maestro Panda",
    description: "El sello que solo llevan los maestros del Gran Archivo.",
    icon: "Award",
    after: "dificil-10",
  },
];

/**
 * Lecciones del tutorial: la introducción y la primera están abiertas desde el
 * prólogo; cada una de las demás se obtiene justo antes del primer reto que la usa.
 */
const LESSON_UNLOCKS: Unlock[] = LESSONS.map((lesson) => {
  const first = ALL_CHALLENGES.findIndex((c) => c.tutorialLink === lesson.slug);
  const after = lesson.module <= 1 || first <= 0 ? null : ALL_CHALLENGES[first - 1].id;
  return {
    id: `leccion-${lesson.slug}`,
    kind: "lesson",
    name: `Pergamino: ${lesson.title}`,
    description: lesson.summary,
    icon: "BookOpen",
    after,
    lesson: lesson.slug,
  };
});

export const UNLOCKS: Unlock[] = [...REWARDS, ...LESSON_UNLOCKS];
