"use client";

import Link from "next/link";
import { BookOpen, Map, Play } from "lucide-react";
import { ALL_CHALLENGES, challengeHref } from "@/content/challenges";
import { Enso, Hanko, PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { currentChallenge } from "@/lib/progress/unlock";

export default function Home() {
  const hydrated = useHasHydrated();
  const completed = useProgress((s) => s.completed);
  const done = Object.keys(completed).length;
  const total = ALL_CHALLENGES.length;
  const current = currentChallenge(completed);
  const started = hydrated && done > 0;
  const pct = (done / Math.max(total, 1)) * 100;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      {/* Manchas de tinta difusas */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-ink/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-seal/[0.08] blur-3xl" />
      {/* Caligrafía vertical decorativa */}
      <p
        className="font-display pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-7xl font-extrabold leading-none text-ink/[0.07] lg:block"
        style={{ writingMode: "vertical-rl" }}
        aria-hidden="true"
      >
        熊猫の道
      </p>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="ink-in relative grid h-48 w-48 place-items-center" style={{ ["--d" as string]: 0 }}>
          <Enso animated className="absolute inset-0 h-full w-full" />
          <PandaLogo className="animate-float relative h-28 w-28" />
          <Hanko char="熊" className="stamp-in absolute bottom-5 right-3 h-9 w-9 text-lg [animation-delay:1.3s]" />
        </div>

        <h1
          className="ink-in font-display mt-3 text-6xl font-extrabold tracking-tight text-ink"
          style={{ ["--d" as string]: 2 }}
        >
          PandaGame
        </h1>
        <div className="ink-in mt-2 flex items-center gap-3 text-ink-2" style={{ ["--d" as string]: 3 }}>
          <span className="h-px w-8 bg-ink-3" />
          <p>Aprende pandas, reto a reto.</p>
          <span className="h-px w-8 bg-ink-3" />
        </div>

        <div className="ink-in mt-9 w-full" style={{ ["--d" as string]: 4 }}>
          <Link href={current ? challengeHref(current) : "/jugar"} className="btn btn-seal w-full px-6 py-4 text-xl">
            <Play className="h-5 w-5 fill-current" />
            {!started ? "Jugar" : current ? "Continuar" : "Ver mapa"}
          </Link>
          <p className="mt-2.5 h-5 truncate text-sm text-ink-3">
            {started && current ? `Reto ${ALL_CHALLENGES.indexOf(current) + 1} · ${current.title}` : ""}
            {hydrated && !current ? "Has completado todos los retos. Maestro Panda." : ""}
          </p>
        </div>

        <div className="ink-in mt-3 grid w-full grid-cols-2 gap-3" style={{ ["--d" as string]: 5 }}>
          <Link href="/jugar" className="btn btn-paper px-4 py-3">
            <Map className="h-4 w-4" /> Mapa
          </Link>
          <Link href="/tutorial" className="btn btn-paper px-4 py-3">
            <BookOpen className="h-4 w-4" /> Tutorial
          </Link>
        </div>

        <div
          className={`mt-9 w-full transition-opacity duration-500 ${started ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!started}
        >
          <div className="mb-1.5 flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
            <span>Camino</span>
            <span className="tabular-nums">
              {done}/{total}
            </span>
          </div>
          <svg viewBox="0 0 300 14" className="h-3.5 w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M3 7C80 5 200 9 297 6" stroke="#d6c7a6" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#brush-soft)" />
            <clipPath id="home-progress">
              <rect x="0" y="0" width={(pct / 100) * 300} height="14" />
            </clipPath>
            {started && (
              <g clipPath="url(#home-progress)">
                <g className="brush-fill">
                  <path d="M3 7C80 5 200 9 297 6" stroke="#1d1b18" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#brush-soft)" />
                </g>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
