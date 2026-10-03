"use client";

import Link from "next/link";
import { memo } from "react";
import { LEVELS, challengeHref } from "@/content/challenges";
import { useProgress } from "@/lib/progress/store";
import { challengeNumber, firstOpenIndex } from "@/lib/progress/unlock";
import { LEVEL_THEME } from "@/lib/theme";

/**
 * Barra compacta con los 30 retos agrupados por nivel. Memoizada: el padre
 * (ChallengeView) se re-renderiza en cada tecla y esto no necesita hacerlo.
 */
export const MiniMap = memo(function MiniMap({ activeId }: { activeId: string }) {
  const completed = useProgress((s) => s.completed);
  const firstOpen = firstOpenIndex(completed);

  return (
    <nav aria-label="Progreso de retos" className="flex items-center gap-3">
      {LEVELS.map((level) => {
        const theme = LEVEL_THEME[level.id];
        return (
          <div key={level.id} className="flex items-center">
            <span className={`font-display mr-1 text-sm font-extrabold ${theme.text}`} title={level.name} aria-hidden="true">
              {theme.kanji}
            </span>
            {level.challenges.map((c) => {
              const n = challengeNumber(c.id);
              const done = !!completed[c.id];
              const unlocked = n - 1 <= firstOpen;
              const active = c.id === activeId;
              const dot = `block transition-all ${
                active
                  ? "h-3 w-3 rounded-full border-2 border-seal bg-paper-3"
                  : done
                    ? "h-2 w-2 rounded-[2px] bg-seal"
                    : unlocked
                      ? "h-2 w-2 rounded-full bg-ink"
                      : "h-2 w-2 rounded-full border border-ink-3/60"
              }`;
              const label = `Reto ${n}: ${c.title}${done ? " (completado)" : unlocked ? "" : " (bloqueado)"}`;
              // El área clicable mide 24px aunque el punto se vea pequeño (WCAG 2.5.8).
              return unlocked ? (
                <Link
                  key={c.id}
                  href={challengeHref(c)}
                  title={c.title}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="grid h-6 w-3.5 place-items-center rounded-sm"
                >
                  <span className={dot} />
                </Link>
              ) : (
                <span key={c.id} title={label} className="grid h-6 w-3.5 place-items-center">
                  <span className={dot} />
                </span>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
});
