"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Lock, Play } from "lucide-react";
import { ALL_CHALLENGES, LEVELS, challengeHref } from "@/content/challenges";
import type { Challenge, Level } from "@/content/types";
import { ChallengeIcon } from "@/components/icons/ChallengeIcon";
import { LevelLogo, PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { currentChallenge, isChallengeUnlocked, levelProgress } from "@/lib/progress/unlock";
import { LEVEL_THEME } from "@/lib/theme";

const ROW = 136; // alto de cada fila del camino (px)
const WIDTH = 320; // ancho del camino (px)
const AMP = 80; // desplazamiento horizontal máximo (px)
const WAVE = [0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6, 0, 0.6];

type NodeState = "done" | "current" | "locked";

export function ProgressMap() {
  const hydrated = useHasHydrated();
  const completed = useProgress((s) => s.completed);
  const current = hydrated ? currentChallenge(completed) : undefined;
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated) currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [hydrated]);

  const stateOf = (c: Challenge): NodeState =>
    !hydrated
      ? "locked"
      : completed[c.id]
        ? "done"
        : isChallengeUnlocked(c.id, completed)
          ? "current"
          : "locked";

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-32 pt-6">
        {LEVELS.map((level) => (
          <LevelSection
            key={level.id}
            level={level}
            stateOf={stateOf}
            currentId={current?.id}
            currentRef={currentRef}
            hydrated={hydrated}
          />
        ))}
      </div>

      {current && (
        <Link
          href={challengeHref(current)}
          className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-emerald-500 px-6 py-3 font-black text-emerald-950 shadow-[0_6px_0_0_#047857] transition hover:bg-emerald-400 active:translate-y-1 active:shadow-[0_2px_0_0_#047857]"
        >
          <Play className="h-4 w-4 fill-current" />
          Continuar · Reto {ALL_CHALLENGES.indexOf(current) + 1}
        </Link>
      )}
    </div>
  );
}

function LevelSection({
  level,
  stateOf,
  currentId,
  currentRef,
  hydrated,
}: {
  level: Level;
  stateOf: (c: Challenge) => NodeState;
  currentId?: string;
  currentRef: React.RefObject<HTMLDivElement | null>;
  hydrated: boolean;
}) {
  const theme = LEVEL_THEME[level.id];
  const completed = useProgress((s) => s.completed);
  const { done, total } = levelProgress(level.id, hydrated ? completed : {});
  const levelLocked = level.challenges[0] && stateOf(level.challenges[0]) === "locked";

  const points = level.challenges.map((_, i) => ({
    x: WIDTH / 2 + WAVE[i % WAVE.length] * AMP,
    y: i * ROW + ROW / 2,
  }));

  return (
    <section className="mb-10 w-full">
      <div
        className={`sticky top-0 z-10 mb-6 flex items-center gap-4 rounded-2xl border ${theme.border} bg-zinc-950/95 p-4 backdrop-blur ${levelLocked ? "opacity-70" : ""}`}
      >
        <LevelLogo level={level.id} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>
            Nivel {LEVELS.indexOf(level) + 1} · {level.difficulty}
          </p>
          <h2 className="truncate text-xl font-black text-zinc-50">{level.name}</h2>
          <p className="truncate text-sm text-zinc-400">{level.description}</p>
        </div>
        <div className="shrink-0 text-right">
          {levelLocked ? (
            <Lock className="ml-auto h-5 w-5 text-zinc-500" />
          ) : (
            <span className={`text-lg font-black tabular-nums ${theme.text}`}>
              {done}/{total}
            </span>
          )}
          <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
            <div className={`h-full ${theme.bg}`} style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: WIDTH, height: points.length * ROW }}>
        <svg className="absolute inset-0" width={WIDTH} height={points.length * ROW} aria-hidden="true">
          {points.slice(1).map((p, i) => {
            const a = points[i];
            const doneSeg = stateOf(level.challenges[i]) === "done";
            return (
              <path
                key={i}
                d={`M${a.x},${a.y} C${a.x},${a.y + ROW / 2} ${p.x},${p.y - ROW / 2} ${p.x},${p.y}`}
                fill="none"
                strokeWidth={8}
                strokeLinecap="round"
                className={doneSeg ? theme.stroke : "stroke-zinc-800"}
                strokeDasharray={doneSeg ? undefined : "2 14"}
              />
            );
          })}
        </svg>

        {level.challenges.map((c, i) => (
          <MapNode
            key={c.id}
            challenge={c}
            index={ALL_CHALLENGES.indexOf(c) + 1}
            state={c.id === currentId ? "current" : stateOf(c)}
            x={points[i].x}
            y={points[i].y}
            side={WAVE[i % WAVE.length] > 0 ? "left" : "right"}
            nodeRef={c.id === currentId ? currentRef : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function MapNode({
  challenge,
  index,
  state,
  x,
  y,
  side,
  nodeRef,
}: {
  challenge: Challenge;
  index: number;
  state: NodeState;
  x: number;
  y: number;
  side: "left" | "right";
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const theme = LEVEL_THEME[challenge.level];
  const size = state === "current" ? 76 : 64;

  const circle =
    state === "locked"
      ? "bg-zinc-800 text-zinc-500 shadow-[0_6px_0_0_#18181b]"
      : `${theme.bg} text-white ${theme.shadow} hover:brightness-110 active:translate-y-1 active:shadow-none`;

  const body = (
    <span
      className={`relative flex items-center justify-center rounded-full transition ${circle}`}
      style={{ width: size, height: size }}
    >
      {state === "current" && (
        <span className={`absolute -inset-2 animate-ping rounded-full ring-4 ${theme.ring} opacity-30`} />
      )}
      {state === "locked" ? (
        <Lock className="h-6 w-6" />
      ) : (
        <ChallengeIcon name={challenge.icon} className={state === "current" ? "h-8 w-8" : "h-7 w-7"} />
      )}
      {state === "done" && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-amber-400 text-amber-950">
          <Check className="h-3.5 w-3.5" strokeWidth={4} />
        </span>
      )}
    </span>
  );

  return (
    <div
      ref={nodeRef}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      {state === "current" && (
        <div className="absolute -top-14 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-black text-zinc-100 shadow-lg">
          <PandaLogo className="h-5 w-5" /> ¡Estás aquí!
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-zinc-700 bg-zinc-900" />
        </div>
      )}

      {state === "locked" ? (
        <div aria-label={`Reto ${index} bloqueado`}>{body}</div>
      ) : (
        <Link href={challengeHref(challenge)} aria-label={`Reto ${index}: ${challenge.title}`}>
          {body}
        </Link>
      )}

      <div
        className={`pointer-events-none absolute top-1/2 z-10 w-48 -translate-y-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-3 opacity-0 shadow-xl transition group-hover:opacity-100 ${
          side === "left" ? "right-full mr-4" : "left-full ml-4"
        }`}
      >
        <p className={`text-[11px] font-black uppercase tracking-wider ${theme.text}`}>Reto {index}</p>
        <p className="font-black text-zinc-50">{challenge.title}</p>
        <p className="text-sm text-zinc-400">{challenge.topic}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {challenge.tests.length} tests ·{" "}
          {state === "done" ? "Completado ✓" : state === "current" ? "Disponible" : "Bloqueado 🔒"}
        </p>
      </div>
    </div>
  );
}
