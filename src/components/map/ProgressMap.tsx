"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Lock, Play } from "lucide-react";
import { LEVELS, challengeHref } from "@/content/challenges";
import type { Challenge, Level } from "@/content/types";
import { ChallengeIcon } from "@/components/icons/ChallengeIcon";
import { Hanko, LevelLogo, PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber, currentChallenge, firstOpenIndex } from "@/lib/progress/unlock";
import { LEVEL_THEME, PALETTE } from "@/lib/theme";

const ROW = 136; // alto de cada fila del camino (px)
const WIDTH = 320; // ancho del camino (px)
const AMP = 80; // desplazamiento horizontal máximo (px)
const WAVE = [0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6, 0, 0.6];
const EMPTY: Record<string, never> = {};

type NodeState = "done" | "current" | "locked";

const STATE_LABEL: Record<NodeState, string> = {
  done: "completado",
  current: "disponible",
  locked: "bloqueado",
};

export function ProgressMap() {
  const hydrated = useHasHydrated();
  const stored = useProgress((s) => s.completed);
  const completed = hydrated ? stored : EMPTY;
  // Se calcula una vez por render; cada nodo solo compara su posición.
  const firstOpen = hydrated ? firstOpenIndex(completed) : -1;
  const current = hydrated ? currentChallenge(completed) : undefined;
  const currentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    currentRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [hydrated]);

  const stateOf = (c: Challenge): NodeState => {
    const idx = challengeNumber(c.id) - 1;
    return completed[c.id] ? "done" : idx <= firstOpen ? "current" : "locked";
  };

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-32 pt-6">
        <h1 className="sr-only">Mapa de retos</h1>
        {LEVELS.map((level) => (
          <LevelSection
            key={level.id}
            level={level}
            states={level.challenges.map(stateOf)}
            done={level.challenges.filter((c) => completed[c.id]).length}
            currentRef={currentRef}
          />
        ))}
        <p className="font-display mt-2 text-center text-ink-3">
          <span className="text-3xl text-ink" aria-hidden="true">
            頂
          </span>
          <br />
          La cumbre te espera.
        </p>
      </div>

      {current && (
        <Link
          href={challengeHref(current)}
          className="btn btn-seal fixed bottom-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap px-6 py-3 text-base"
        >
          <Play className="h-4 w-4 fill-current" />
          Continuar · Reto {challengeNumber(current.id)}
        </Link>
      )}
    </div>
  );
}

function LevelSection({
  level,
  states,
  done,
  currentRef,
}: {
  level: Level;
  states: NodeState[];
  done: number;
  currentRef: React.RefObject<HTMLLIElement | null>;
}) {
  const theme = LEVEL_THEME[level.id];
  const total = level.challenges.length;
  const levelLocked = states[0] === "locked";
  const headingId = `nivel-${level.id}`;

  const points = level.challenges.map((_, i) => ({
    x: WIDTH / 2 + WAVE[i % WAVE.length] * AMP,
    y: i * ROW + ROW / 2,
  }));

  return (
    <section className="mb-12 w-full" aria-labelledby={headingId}>
      {/* Cabecera tipo pergamino colgante (kakejiku) */}
      <div className="sticky top-0 z-10 -mx-1 mb-8 pt-2">
        <div className={`paper-card relative flex items-center gap-4 p-4 ${levelLocked ? "grayscale-[0.7]" : ""}`}>
          <LevelLogo level={level.id} className="h-16 w-16 shrink-0" />
          <div className="relative min-w-0 flex-1">
            <p className={`kicker ${theme.text}`}>
              Nivel {theme.kanji} · {level.difficulty}
            </p>
            <h2 id={headingId} className="font-display truncate text-2xl font-extrabold leading-tight text-ink">
              {level.name}
            </h2>
            <p className="truncate text-sm text-ink-3">{level.description}</p>
          </div>
          <div className="relative shrink-0 text-right">
            {levelLocked ? (
              <>
                <Lock className="ml-auto h-5 w-5 text-ink-3" />
                <span className="sr-only">Nivel bloqueado</span>
              </>
            ) : (
              <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
                {done}
                <span className="text-base text-ink-3">/{total}</span>
                <span className="sr-only"> retos completados</span>
              </span>
            )}
            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
              <div className={`h-full ${theme.bg}`} style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: WIDTH, height: points.length * ROW }}>
        <svg className="absolute inset-0 overflow-visible" width={WIDTH} height={points.length * ROW} aria-hidden="true">
          {points.slice(1).map((p, i) => {
            const a = points[i];
            const d = `M${a.x},${a.y} C${a.x},${a.y + ROW / 2} ${p.x},${p.y - ROW / 2} ${p.x},${p.y}`;
            return states[i] === "done" ? (
              <path key={i} d={d} fill="none" stroke={PALETTE.ink} strokeWidth={10} strokeLinecap="round" filter="url(#brush)" opacity={0.9} />
            ) : (
              <path key={i} d={d} fill="none" stroke={PALETTE.ruleDark} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 12" />
            );
          })}
        </svg>

        <ol className="absolute inset-0">
        {level.challenges.map((c, i) => (
          <MapNode
            key={c.id}
            challenge={c}
            index={challengeNumber(c.id)}
            state={states[i]}
            x={points[i].x}
            y={points[i].y}
            side={WAVE[i % WAVE.length] > 0 ? "left" : "right"}
            nodeRef={states[i] === "current" ? currentRef : undefined}
          />
        ))}
        </ol>
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
  nodeRef?: React.RefObject<HTMLLIElement | null>;
}) {
  const theme = LEVEL_THEME[challenge.level];
  const size = state === "current" ? 78 : 64;
  const tooltipId = `tip-${challenge.id}`;

  const body = (
    <span
      className="relative block transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5"
      style={{ width: size, height: size }}
    >
      {state === "current" && (
        <span className="seal-pulse absolute inset-0 rounded-full border-[3px] border-seal" aria-hidden="true" />
      )}
      {state === "locked" ? (
        <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-ink-3/60 bg-paper-2/60 text-ink-3">
          <Lock className="h-5 w-5" />
        </span>
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full border-[2.5px] border-ink shadow-hand ${
            state === "current" ? "bg-paper-3 text-ink" : `${theme.bg} text-paper-3`
          }`}
        >
          <ChallengeIcon name={challenge.icon} className={state === "current" ? "h-8 w-8" : "h-7 w-7"} strokeWidth={2.2} />
        </span>
      )}
      {state === "done" && <Hanko className="absolute -right-3 -top-2 h-7 w-7 rotate-[-10deg] text-sm" />}
      <span
        className="font-display absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold tabular-nums text-ink-3"
        aria-hidden="true"
      >
        {index}
      </span>
      <span className="sr-only">
        Reto {index}: {challenge.title} ({STATE_LABEL[state]})
      </span>
    </span>
  );

  return (
    <li
      ref={nodeRef}
      className="group absolute -translate-x-1/2 -translate-y-1/2 list-none"
      style={{ left: x, top: y }}
    >
      {state === "current" && (
        <div
          className="absolute -top-[3.4rem] left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-[10px_14px_10px_12px] border-2 border-ink bg-paper-3 px-2.5 py-1 text-xs font-black text-ink shadow-hand-sm"
          aria-hidden="true"
        >
          <PandaLogo className="h-5 w-5" /> ¡Estás aquí!
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink bg-paper-3" />
        </div>
      )}

      {state === "locked" ? (
        body
      ) : (
        <Link
          href={challengeHref(challenge)}
          aria-describedby={tooltipId}
          aria-current={state === "current" ? "step" : undefined}
          className="block scroll-mb-24 scroll-mt-40 rounded-full"
        >
          {body}
        </Link>
      )}

      <div
        id={tooltipId}
        role="tooltip"
        className={`paper-card pointer-events-none absolute top-1/2 z-10 w-52 -translate-y-1/2 p-3 opacity-0 transition duration-200 group-focus-within:opacity-100 group-hover:opacity-100 ${
          side === "left" ? "right-full mr-5" : "left-full ml-5"
        }`}
      >
        <p className={`kicker ${theme.text}`}>Reto {index}</p>
        <p className="font-display text-lg font-extrabold leading-tight text-ink">{challenge.title}</p>
        <p className="text-sm text-ink-2">{challenge.topic}</p>
        <p className="mt-1.5 border-t border-rule pt-1.5 text-xs text-ink-3">
          {challenge.tests.length} tests · {STATE_LABEL[state][0].toUpperCase() + STATE_LABEL[state].slice(1)}
        </p>
      </div>
    </li>
  );
}
