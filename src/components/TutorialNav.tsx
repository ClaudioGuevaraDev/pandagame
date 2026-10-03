"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LESSONS } from "@/content/tutorial";
import { useHasHydrated, useProgress } from "@/lib/progress/store";

export function TutorialNav({ active }: { active?: string }) {
  const hydrated = useHasHydrated();
  const read = useProgress((s) => s.tutorialRead);
  return (
    <ol className="space-y-1">
      {LESSONS.map((l) => (
        <li key={l.slug}>
          <Link
            href={`/tutorial/${l.slug}`}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
              active === l.slug ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {hydrated && read[l.slug] ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-zinc-600" />
            )}
            <span className="w-5 shrink-0 tabular-nums text-zinc-500">{l.module}.</span>
            <span className="truncate">{l.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
