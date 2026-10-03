"use client";

import Link from "next/link";
import { LEVELS, challengeHref } from "@/content/challenges";
import { LevelLogo } from "@/components/icons/Logos";
import { useProgress } from "@/lib/progress/store";
import { isChallengeUnlocked } from "@/lib/progress/unlock";
import { LEVEL_THEME } from "@/lib/theme";

/** Barra compacta con los 30 retos agrupados por nivel. */
export function MiniMap({ activeId }: { activeId: string }) {
  const completed = useProgress((s) => s.completed);

  return (
    <div className="flex items-center gap-3">
      {LEVELS.map((level) => {
        const theme = LEVEL_THEME[level.id];
        return (
          <div key={level.id} className="flex items-center gap-1" title={level.name}>
            <LevelLogo level={level.id} className="h-4 w-4" />
            {level.challenges.map((c) => {
              const done = !!completed[c.id];
              const unlocked = isChallengeUnlocked(c.id, completed);
              const active = c.id === activeId;
              const dot = `block h-2 rounded-full transition-all ${active ? "w-5" : "w-2"} ${
                done ? theme.bg : unlocked ? `${theme.bg} opacity-50` : "bg-zinc-700"
              } ${active ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${theme.ring}` : ""}`;
              return unlocked ? (
                <Link key={c.id} href={challengeHref(c)} title={c.title} className={dot} />
              ) : (
                <span key={c.id} title={`${c.title} (bloqueado)`} className={dot} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
