import type { LucideIcon, LucideProps } from "lucide-react";
import { Circle, AppWindow, ArrowDownWideNarrow, Binary, Calculator, CalendarClock, CalendarDays, ChartColumn, CircleDashed, Columns3, Copy, Crown, Droplets, Eye, Filter, GitBranchPlus, Group, Layers, Link, ListFilter, Merge, Network, PencilLine, Scissors, Shuffle, Sigma, Sprout, Table2, Trophy, Type, Wand } from "lucide-react";

/** Iconos usados por los retos (importados uno a uno para no cargar toda la librería). */
const ICONS: Record<string, LucideIcon> = {
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
};

export function ChallengeIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Circle;
  return <Icon {...props} />;
}
