import type { UnlockIconName } from "./icons.ts";

/** Tipos del modo historia: personajes, viñetas, escenas y recompensas. */

export const CHARACTER_IDS = ["bao", "lin", "kiko", "goro", "cria", "sombra"] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const POSES = ["idle", "think", "surprise", "point", "cheer", "write", "sad", "run"] as const;
export type Pose = (typeof POSES)[number];

export const MOODS = ["neutral", "happy", "surprised", "worried", "determined", "sad"] as const;
export type Mood = (typeof MOODS)[number];

export const BACKGROUNDS = ["archivo", "bosque", "guarderia", "rio", "cumbre", "noche", "almacen", "accion"] as const;
export type BackgroundName = (typeof BACKGROUNDS)[number];

export const PROPS = [
  "pincel",
  "pergamino",
  "huella",
  "pagina",
  "linterna",
  "lupa",
  "brujula",
  "catalejo",
  "sello",
  "llave",
  "mapa",
  "bambu",
] as const;
export type PropName = (typeof PROPS)[number];

export type CastMember = {
  who: CharacterId;
  pose?: Pose;
  mood?: Mood;
  /** Posición horizontal del centro del personaje, en % del ancho de la viñeta. */
  x: number;
  /** 1 = tamaño normal. */
  scale?: number;
  /** Mira hacia la izquierda (por defecto mira a la derecha). */
  flip?: boolean;
};

export type Balloon = {
  /** Quién habla. Si no está en la viñeta, el globo apunta al borde (voz en off). */
  who: CharacterId;
  text: string;
  kind?: "say" | "think" | "shout";
};

export type Panel = {
  /** Ancho en la página: fila completa, media o un tercio. Por defecto "half". */
  layout?: "wide" | "half" | "third";
  bg: BackgroundName;
  camera?: "zoom" | "pan" | "shake";
  cast?: CastMember[];
  /** Objeto destacado en la escena (x, y en %). */
  prop?: { name: PropName; x: number; y: number; scale?: number };
  /** Caja del narrador. */
  narration?: string;
  balloons?: Balloon[];
  /** Onomatopeya (x, y en %). */
  sfx?: { text: string; x: number; y: number; rotate?: number };
};

export type Scene = {
  /** "prologo" o "capitulo-N" (N = número global del reto que la desbloquea). */
  id: string;
  title: string;
  /** null: el prólogo (siempre disponible). Si no, el reto que hay que completar. */
  after: string | null;
  panels: Panel[];
};

export type UnlockKind = "hints" | "perk" | "lesson" | "item";

export type PerkId = "autocompletar" | "ver-datos" | "comparar" | "pegar";

export type Unlock = {
  id: string;
  kind: UnlockKind;
  name: string;
  description: string;
  /** Icono de lucide-react registrado en story/icons.ts. */
  icon: UnlockIconName;
  /** Reto tras el cual se obtiene (null = desde el prólogo). */
  after: string | null;
  /** Para kind "hints": pistas por reto que permite. */
  hints?: number;
  perk?: PerkId;
  /** Para kind "lesson": slug de la lección. */
  lesson?: string;
};
