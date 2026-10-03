import type { LevelId } from "@/content/types";

/** Clases de Tailwind por nivel (literales completos para que Tailwind las detecte). */
export const LEVEL_THEME: Record<
  LevelId,
  {
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    ring: string;
    gradient: string;
    shadow: string;
    stroke: string;
    hex: string;
  }
> = {
  facil: {
    text: "text-emerald-400",
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    ring: "ring-emerald-400",
    gradient: "from-emerald-500 to-lime-500",
    shadow: "shadow-[0_6px_0_0_#047857]",
    stroke: "stroke-emerald-500",
    hex: "#10b981",
  },
  medio: {
    text: "text-sky-400",
    bg: "bg-sky-500",
    bgSoft: "bg-sky-500/10",
    border: "border-sky-500/40",
    ring: "ring-sky-400",
    gradient: "from-sky-500 to-cyan-400",
    shadow: "shadow-[0_6px_0_0_#0369a1]",
    stroke: "stroke-sky-500",
    hex: "#0ea5e9",
  },
  dificil: {
    text: "text-violet-400",
    bg: "bg-violet-500",
    bgSoft: "bg-violet-500/10",
    border: "border-violet-500/40",
    ring: "ring-violet-400",
    gradient: "from-violet-500 to-fuchsia-500",
    shadow: "shadow-[0_6px_0_0_#6d28d9]",
    stroke: "stroke-violet-500",
    hex: "#8b5cf6",
  },
};
