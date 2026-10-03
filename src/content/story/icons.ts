import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Brush,
  Compass,
  FileWarning,
  FileX,
  Flashlight,
  Footprints,
  Key,
  MapPinned,
  Moon,
  PenTool,
  Scroll,
  ScrollText,
  Search,
  Telescope,
} from "lucide-react";

/** Iconos de recompensas (importados uno a uno para no cargar toda la librería). */
export const UNLOCK_ICONS = {
  Award,
  BookOpen,
  Brush,
  Compass,
  FileWarning,
  FileX,
  Flashlight,
  Footprints,
  Key,
  MapPinned,
  Moon,
  PenTool,
  Scroll,
  ScrollText,
  Search,
  Telescope,
} satisfies Record<string, LucideIcon>;

export type UnlockIconName = keyof typeof UNLOCK_ICONS;
