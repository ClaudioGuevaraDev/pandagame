import type { LevelId } from "@/content/types";

/** Pigmento de cada nivel (clases literales para que Tailwind las detecte). */
export const LEVEL_THEME: Record<
  LevelId,
  {
    /** Numeral kanji decorativo. */
    kanji: string;
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    stroke: string;
    hex: string;
  }
> = {
  facil: {
    kanji: "一",
    text: "text-bamboo",
    bg: "bg-bamboo",
    bgSoft: "bg-bamboo/10",
    border: "border-bamboo",
    stroke: "stroke-bamboo",
    hex: "#4e7a36",
  },
  medio: {
    kanji: "二",
    text: "text-river",
    bg: "bg-river",
    bgSoft: "bg-river/10",
    border: "border-river",
    stroke: "stroke-river",
    hex: "#2c5d7c",
  },
  dificil: {
    kanji: "三",
    text: "text-summit",
    bg: "bg-summit",
    bgSoft: "bg-summit/10",
    border: "border-summit",
    stroke: "stroke-summit",
    hex: "#6a4778",
  },
};

export const KANJI_NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
