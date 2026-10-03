"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpenText, Lock, Play } from "lucide-react";
import { LEVELS, challengeHref } from "@/content/challenges";
import { sceneAfter, sceneHref } from "@/content/story/scenes";
import type { Scene } from "@/content/story/types";
import type { Challenge, Level, LevelId } from "@/content/types";
import { ChallengeIcon } from "@/components/icons/ChallengeIcon";
import { Hanko, LevelLogo, PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber, currentChallenge, firstOpenIndex } from "@/lib/progress/unlock";
import { nextStop } from "@/lib/story/unlocks";
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

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProgressMap() {
  const hydrated = useHasHydrated();
  const stored = useProgress((s) => s.completed);
  const storedSeen = useProgress((s) => s.scenesSeen);
  const completed = hydrated ? stored : EMPTY;
  const scenesSeen = hydrated ? storedSeen : EMPTY;
  const stop = hydrated ? nextStop(completed, scenesSeen) : undefined;
  // Se calcula una vez por render; cada nodo solo compara su posición.
  const firstOpen = hydrated ? firstOpenIndex(completed) : -1;
  const current = hydrated ? currentChallenge(completed) : undefined;
  const currentRef = useRef<HTMLLIElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<LevelId, HTMLElement | null>>>({});

  // Nivel que muestra la cabecera fija: el que se está viendo al hacer scroll
  // (o, al cargar, el del reto actual).
  const [viewedLevel, setViewedLevel] = useState<LevelId | null>(null);
  const activeLevel: LevelId = viewedLevel ?? current?.level ?? "facil";

  useEffect(() => {
    if (!hydrated) return;
    currentRef.current?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [hydrated]);

  // Detecta qué nivel ocupa la franja superior del área con scroll.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setViewedLevel(visible[0].target.getAttribute("data-level") as LevelId);
      },
      { root, rootMargin: "0px 0px -75% 0px" },
    );
    for (const el of Object.values(sectionRefs.current)) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stateOf = (c: Challenge): NodeState => {
    const idx = challengeNumber(c.id) - 1;
    return completed[c.id] ? "done" : idx <= firstOpen ? "current" : "locked";
  };
  const states = Object.fromEntries(LEVELS.map((l) => [l.id, l.challenges.map(stateOf)])) as Record<
    LevelId,
    NodeState[]
  >;
  const doneOf = (l: Level) => l.challenges.filter((c) => completed[c.id]).length;

  const goToLevel = (id: LevelId) => {
    setViewedLevel(id);
    sectionRefs.current[id]?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const level = LEVELS.find((l) => l.id === activeLevel) ?? LEVELS[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Mapa de retos</h1>

      {/* Cabecera fija del nivel: queda fuera del área con scroll, así los retos nunca pasan por debajo. */}
      <div className="shrink-0 border-b border-rule bg-paper/80 px-4 pb-3 pt-3 sm:pt-4">
        <div className="mx-auto max-w-xl">
          <LevelCard key={level.id} level={level} done={doneOf(level)} locked={states[level.id][0] === "locked"} />
          <div className="mt-3 flex items-center justify-center gap-2" role="group" aria-label="Ir a un nivel">
            {LEVELS.map((l) => {
              const theme = LEVEL_THEME[l.id];
              const locked = states[l.id][0] === "locked";
              const active = l.id === activeLevel;
              return (
                <button
                  key={l.id}
                  onClick={() => goToLevel(l.id)}
                  aria-label={`Ir al nivel ${l.difficulty}: ${l.name}${locked ? " (bloqueado)" : ""}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-0.5 text-xs font-bold transition-colors ${
                    active ? "border-ink bg-ink text-paper-3" : "border-rule bg-paper-3/70 text-ink-2 hover:border-ink"
                  }`}
                >
                  <span className={`font-display text-sm ${active ? "" : theme.text}`}>{theme.kanji}</span>
                  {l.difficulty}
                  {locked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <span className="tabular-nums opacity-80">
                      {doneOf(l)}/{l.challenges.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Solo esta zona hace scroll */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-32">
          {LEVELS.map((l) => (
            <LevelSection
              key={l.id}
              level={l}
              states={states[l.id]}
              scenesSeen={scenesSeen}
              currentRef={currentRef}
              sectionRef={(el) => {
                sectionRefs.current[l.id] = el;
              }}
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
      </div>

      {stop && (
        <Link
          href={stop.type === "scene" ? sceneHref(stop.scene) : challengeHref(stop.challenge)}
          className="btn btn-seal fixed bottom-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap px-6 py-3 text-base"
        >
          {stop.type === "scene" ? (
            <>
              <BookOpenText className="h-4 w-4" />
              Continuar · {stop.scene.after ? "Historia" : "Prólogo"}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Continuar · Reto {challengeNumber(stop.challenge.id)}
            </>
          )}
        </Link>
      )}
    </div>
  );
}

/** Tarjeta del nivel visible (logo, nombre, descripción y progreso). */
function LevelCard({ level, done, locked }: { level: Level; done: number; locked: boolean }) {
  const theme = LEVEL_THEME[level.id];
  const total = level.challenges.length;
  return (
    <div className={`paper-card ink-in relative flex items-center gap-3 p-3 sm:gap-4 sm:p-4 ${locked ? "grayscale-[0.7]" : ""}`}>
      <LevelLogo level={level.id} className="h-11 w-11 shrink-0 sm:h-16 sm:w-16" />
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className={`kicker ${theme.text}`}>
          Nivel {theme.kanji} · {level.difficulty}
        </p>
        <p className="font-display truncate text-xl font-extrabold leading-tight text-ink sm:text-2xl">{level.name}</p>
        <p className="hidden truncate text-sm text-ink-3 sm:block">{level.description}</p>
      </div>
      <div className="shrink-0 text-right">
        {locked ? (
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
  );
}

function LevelSection({
  level,
  states,
  scenesSeen,
  currentRef,
  sectionRef,
}: {
  level: Level;
  states: NodeState[];
  scenesSeen: Record<string, boolean>;
  currentRef: React.RefObject<HTMLLIElement | null>;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  const theme = LEVEL_THEME[level.id];
  const headingId = `nivel-${level.id}`;

  const points = level.challenges.map((_, i) => ({
    x: WIDTH / 2 + WAVE[i % WAVE.length] * AMP,
    y: i * ROW + ROW / 2,
  }));

  return (
    <section ref={sectionRef} data-level={level.id} className="w-full scroll-mt-2 pb-10 pt-8" aria-labelledby={headingId}>
      {/* Separador ligero entre niveles */}
      <div className="flex items-center gap-3">
        <span className={`font-display text-2xl font-extrabold leading-none ${theme.text}`} aria-hidden="true">
          {theme.kanji}
        </span>
        <h2 id={headingId} className={`kicker ${theme.text}`}>
          {level.difficulty} · {level.name}
        </h2>
        <span className="h-px flex-1 bg-rule" aria-hidden="true" />
      </div>

      {/* mt-14: deja sitio a la viñeta del prólogo sobre el primer reto */}
      <div className="relative mx-auto mt-14" style={{ width: WIDTH, height: points.length * ROW }}>
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

        {/* Escenas de la historia: entre reto y reto (y el prólogo antes del primero) */}
        <ul className="pointer-events-none absolute inset-0" aria-label={`Escenas de ${level.name}`}>
          {level.id === "facil" && (
            <SceneNode
              scene={sceneAfter(null)}
              open
              seen={!!scenesSeen.prologo}
              x={points[0].x - 74}
              y={points[0].y - 34}
            />
          )}
          {level.challenges.map((c, i) => {
            const a = points[i];
            const b = points[i + 1] ?? { x: a.x, y: a.y + ROW * 0.62 };
            const scene = sceneAfter(c.id);
            return (
              <SceneNode
                key={c.id}
                scene={scene}
                open={states[i] === "done"}
                seen={!!(scene && scenesSeen[scene.id])}
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 + 8}
              />
            );
          })}
        </ul>

        {/* Las capas no capturan clics: solo los nodos (así ninguna tapa a la otra) */}
        <ol className="pointer-events-none absolute inset-0">
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

/** Mini nodo de escena: una viñeta para volver a ver la historia. */
function SceneNode({ scene, open, seen, x, y }: { scene?: Scene; open: boolean; seen: boolean; x: number; y: number }) {
  if (!scene) return null;
  const label = `${scene.after ? "Escena" : "Prólogo"}: ${scene.title}`;
  return (
    <li className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 list-none" style={{ left: x, top: y }}>
      {open ? (
        <Link
          href={sceneHref(scene)}
          title={label}
          className={`relative grid h-8 w-8 place-items-center rounded-md border-2 border-ink shadow-hand-sm transition-transform motion-safe:hover:-rotate-6 ${
            seen ? "bg-paper-3 text-ink" : "bg-[#f6d77a] text-ink"
          }`}
        >
          <ComicIcon />
          {!seen && <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-seal" />}
          <span className="sr-only">
            {label} ({seen ? "vista" : "nueva"})
          </span>
        </Link>
      ) : (
        <span className="block h-3 w-3 rotate-45 border-2 border-ink-3/50 bg-paper-2" title="Escena bloqueada" aria-hidden="true" />
      )}
    </li>
  );
}

/** Icono de viñetas (cuatro paneles inclinados). */
function ComicIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M2 2.5h7.5l-1 6.5H2Z M11 2.5h7v6.5h-8Z M2 11h8v6.5H2Z M11.5 11H18v6.5h-7.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
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
      className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 list-none"
      style={{ left: x, top: y }}
    >
      {state === "current" && (
        // Al costado (hacia el centro del camino): arriba y abajo quedan las escenas.
        <div
          className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-[10px_14px_10px_12px] border-2 border-ink bg-paper-3 px-2.5 py-1 text-xs font-black text-ink shadow-hand-sm ${
            side === "left" ? "right-full mr-4" : "left-full ml-4"
          }`}
          aria-hidden="true"
        >
          <PandaLogo className="h-5 w-5" /> ¡Estás aquí!
          <span
            className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-paper-3 ${
              side === "left" ? "-right-[7px] border-r-2 border-t-2 border-ink" : "-left-[7px] border-b-2 border-l-2 border-ink"
            }`}
          />
        </div>
      )}

      {state === "locked" ? (
        body
      ) : (
        <Link
          href={challengeHref(challenge)}
          aria-describedby={tooltipId}
          aria-current={state === "current" ? "step" : undefined}
          className="block scroll-mb-24 scroll-mt-20 rounded-full"
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
