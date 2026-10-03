import type { LevelId } from "@/content/types";

/**
 * Paleta en hex para donde no llegan las variables CSS (tema de Monaco,
 * atributos SVG). Debe coincidir con los tokens de globals.css.
 */
export const PALETTE = {
  paper: "#f3ead6",
  paper2: "#e9dcc0",
  paper3: "#fbf6ea",
  ink: "#1d1b18",
  ink2: "#4a443b",
  ink3: "#655b4a",
  rule: "#d6c7a6",
  ruleDark: "#b9a881",
  seal: "#c23a22",
  sealInk: "#a93120",
  bamboo: "#4e7a36",
  river: "#2c5d7c",
  summit: "#6a4778",
} as const;

/** Pigmento de cada nivel (clases literales para que Tailwind las detecte). */
export const LEVEL_THEME = {
  facil: {
    kanji: "一",
    // Texto pequeño con el tono oscuro para cumplir contraste AA.
    text: "text-bamboo-ink",
    bg: "bg-bamboo",
    hex: PALETTE.bamboo,
  },
  medio: {
    kanji: "二",
    text: "text-river",
    bg: "bg-river",
    hex: PALETTE.river,
  },
  dificil: {
    kanji: "三",
    text: "text-summit",
    bg: "bg-summit",
    hex: PALETTE.summit,
  },
} as const satisfies Record<LevelId, { kanji: string; text: string; bg: string; hex: string }>;

export const KANJI_NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

/** Tema oscuro "piedra de tinta" del editor y de la vista previa del tutorial. */
export const EDITOR_PALETTE = {
  bg: "#1d1b18",
  lineHighlight: "#2a2723",
  fg: "#f3ead6",
  comment: "#a89c85",
  lineNumber: "#7d7262",
  keyword: "#f2c14e",
  string: "#a6d189",
  number: "#ff8a6b",
  type: "#8ec5e8",
  delimiter: "#d6c7a6",
  cursor: "#ff8a6b",
  selection: "#c23a22",
  border: "#3a362f",
} as const;
