"use client";

import Link from "next/link";
import { LEVELS, challengeHref } from "@/content/challenges";
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
            <span className={`font-display mr-0.5 text-sm font-extrabold ${theme.text}`}>{theme.kanji}</span>
            {level.challenges.map((c) => {
              const done = !!completed[c.id];
              const unlocked = isChallengeUnlocked(c.id, completed);
              const active = c.id === activeId;
              const dot = `block transition-all ${
                active
                  ? "h-3 w-3 rounded-full border-2 border-seal bg-paper-3"
                  : done
                    ? "h-2 w-2 rounded-[2px] bg-seal"
                    : unlocked
                      ? "h-2 w-2 rounded-full bg-ink"
                      : "h-2 w-2 rounded-full border border-ink-3/50"
              }`;
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
