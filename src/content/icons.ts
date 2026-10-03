import type { LucideIcon } from "lucide-react";
import { AppWindow, ArrowDownWideNarrow, Binary, Calculator, CalendarClock, CalendarDays, ChartColumn, CircleDashed, Columns3, Copy, Crown, Droplets, Eye, Filter, GitBranchPlus, Group, Layers, Link, ListFilter, Merge, Network, PencilLine, Scissors, Shuffle, Sigma, Sprout, Table2, Trophy, Type, Wand } from "lucide-react";

/** Iconos de los retos (importados uno a uno para no cargar toda la librería). */
export const CHALLENGE_ICONS = {
  AppWindow,
  ArrowDownWideNarrow,
  Binary,
  Calculator,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  CircleDashed,
  Columns3,
  Copy,
  Crown,
  Droplets,
  Eye,
  Filter,
  GitBranchPlus,
  Group,
  Layers,
  Link,
  ListFilter,
  Merge,
  Network,
  PencilLine,
  Scissors,
  Shuffle,
  Sigma,
  Sprout,
  Table2,
  Trophy,
  Type,
  Wand,
} satisfies Record<string, LucideIcon>;

export type ChallengeIconName = keyof typeof CHALLENGE_ICONS;
