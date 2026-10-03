"use client";

import Link from "next/link";
import { BookOpen, Map, Play } from "lucide-react";
import { ALL_CHALLENGES, challengeHref } from "@/content/challenges";
import { PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { currentChallenge } from "@/lib/progress/unlock";

export default function Home() {
  const hydrated = useHasHydrated();
  const completed = useProgress((s) => s.completed);
  const done = Object.keys(completed).length;
  const total = ALL_CHALLENGES.length;
  const current = currentChallenge(completed);
  const started = hydrated && done > 0;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <PandaLogo className="animate-float h-28 w-28 drop-shadow-[0_10px_30px_rgba(16,185,129,0.35)]" />
        <h1 className="mt-5 text-5xl font-black tracking-tight text-zinc-50">PandaGame</h1>
        <p className="mt-2 text-zinc-400">Aprende pandas resolviendo retos.</p>

        <Link
          href={current ? challengeHref(current) : "/jugar"}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-emerald-950 shadow-[0_6px_0_0_#047857] transition hover:bg-emerald-400 active:translate-y-1 active:shadow-[0_2px_0_0_#047857]"
        >
          <Play className="h-5 w-5 fill-current" />
          {!started ? "Jugar" : current ? "Continuar" : "Ver mapa"}
        </Link>
        <p className="mt-2 h-5 truncate text-sm text-zinc-500">
          {started && current ? `Reto ${ALL_CHALLENGES.indexOf(current) + 1}: ${current.title}` : ""}
          {hydrated && !current ? "¡Completaste todos los retos! 🐼" : ""}
        </p>

        <div className="mt-4 grid w-full grid-cols-2 gap-3">
          <Link
            href="/jugar"
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-bold text-zinc-200 shadow-[0_4px_0_0_#27272a] transition hover:bg-zinc-800 active:translate-y-1 active:shadow-none"
          >
            <Map className="h-4 w-4" /> Mapa
          </Link>
          <Link
            href="/tutorial"
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-bold text-zinc-200 shadow-[0_4px_0_0_#27272a] transition hover:bg-zinc-800 active:translate-y-1 active:shadow-none"
          >
            <BookOpen className="h-4 w-4" /> Tutorial
          </Link>
        </div>

        <div className={`mt-8 w-full transition-opacity ${started ? "opacity-100" : "opacity-0"}`}>
          <div className="mb-1 flex justify-between text-xs font-bold text-zinc-500">
            <span>Progreso</span>
            <span className="tabular-nums">
              {done}/{total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 transition-all"
              style={{ width: `${(done / Math.max(total, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
