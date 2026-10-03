"use client";

import Link from "next/link";
import { LESSONS } from "@/content/tutorial";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { moduleNumeral } from "@/lib/theme";
import { isLessonUnlocked, lessonUnlock, unlockSource } from "@/lib/story/unlocks";
import { Lock } from "lucide-react";
import { Hanko } from "./icons/Logos";

export function TutorialNav({ active }: { active?: string }) {
  const hydrated = useHasHydrated();
  const read = useProgress((s) => s.tutorialRead);
  const completed = useProgress((s) => s.completed);
  return (
    <ol className="space-y-0.5">
      {LESSONS.map((l) => {
        const isActive = active === l.slug;
        if (hydrated && !isLessonUnlocked(l.slug, completed)) {
          const u = lessonUnlock(l.slug);
          return (
            <li
              key={l.slug}
              className="flex items-center gap-3 border-l-[3px] border-transparent px-3 py-2 text-sm font-bold text-ink-3"
              title={u ? `Se desbloquea tras ${unlockSource(u)}` : undefined}
            >
              <span className="font-display w-6 shrink-0 text-center text-lg leading-none">
                {moduleNumeral(l.module)}
              </span>
              <span className="flex-1 truncate font-medium">{l.title}</span>
              <Lock className="h-4 w-4 shrink-0" />
              <span className="sr-only">(bloqueada{u ? `: se desbloquea tras ${unlockSource(u)}` : ""})</span>
            </li>
          );
        }
        return (
          <li key={l.slug}>
            <Link
              href={`/tutorial/${l.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 border-l-[3px] px-3 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? "border-seal bg-paper-3/80 text-ink"
                  : "border-transparent text-ink-2 hover:border-rule hover:text-ink"
              }`}
            >
              <span
                className={`font-display w-6 shrink-0 text-center text-lg leading-none ${isActive ? "text-seal" : "text-ink-3"}`}
              >
                {moduleNumeral(l.module)}
              </span>
              <span className="flex-1 truncate">{l.title}</span>
              {hydrated && read[l.slug] && <Hanko className="h-5 w-5 shrink-0 text-[10px]" />}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
