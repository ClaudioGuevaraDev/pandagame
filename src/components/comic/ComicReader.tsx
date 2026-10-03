"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, BookMarked, FastForward, Lock, Map as MapIcon, Pause, Play, X } from "lucide-react";
import { ALL_CHALLENGES, challengeHref } from "@/content/challenges";
import type { Panel, Scene, Unlock } from "@/content/story/types";
import { UNLOCK_ICONS } from "@/content/story/icons";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber, nextChallenge } from "@/lib/progress/unlock";
import { isSceneUnlocked, unlocksAfter } from "@/lib/story/unlocks";
import { Hanko } from "@/components/icons/Logos";
import { openLogin, useAuth } from "@/lib/cloud/auth";
import { ComicPanel, panelText } from "./ComicPanel";

/**
 * Avance automático: cada viñeta se queda en pantalla un tiempo según cuánto
 * texto tiene (se empieza a contar cuando termina de escribirse la narración).
 */
export const AUTO_ADVANCE = {
  baseMs: 2500,
  perCharMs: 45,
  minMs: 3500,
  maxMs: 10_000,
} as const;

function panelDuration(p: Panel): number {
  const chars = (p.narration?.length ?? 0) + (p.balloons ?? []).reduce((n, b) => n + b.text.length, 0);
  const ms = AUTO_ADVANCE.baseMs + chars * AUTO_ADVANCE.perCharMs;
  return Math.min(AUTO_ADVANCE.maxMs, Math.max(AUTO_ADVANCE.minMs, ms));
}

const UNITS = { wide: 6, half: 3, third: 2 } as const;
const ROW_UNITS = 6;
const ROWS_PER_PAGE = 2;

/** Agrupa las viñetas en filas (6 unidades) y las filas en páginas. */
function paginate(panels: Panel[]): number[][][] {
  const rows: number[][] = [];
  let row: number[] = [];
  let used = 0;
  panels.forEach((p, i) => {
    const u = UNITS[p.layout ?? "half"];
    if (used + u > ROW_UNITS && row.length) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(i);
    used += u;
  });
  if (row.length) rows.push(row);
  const pages: number[][][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) pages.push(rows.slice(i, i + ROWS_PER_PAGE));
  return pages;
}

function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

const KIND_LABEL: Record<Unlock["kind"], string> = {
  hints: "Pistas",
  perk: "Ventaja",
  lesson: "Lección",
  item: "Objeto",
};

/** Ligera inclinación de cada viñeta, como dibujada a mano. */
const tilt = (i: number) => `${[-0.5, 0.4, -0.3, 0.6, -0.4, 0.3][i % 6]}deg`;

export function ComicReader({ scene }: { scene: Scene }) {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const unlocked = useProgress((s) => isSceneUnlocked(scene, s.completed));
  const markSceneSeen = useProgress((s) => s.markSceneSeen);
  const autoplayStored = useProgress((s) => s.comicAutoplay);
  const setComicAutoplay = useProgress((s) => s.setComicAutoplay);
  const autoplay = !hydrated || autoplayStored;
  const desktop = useMedia("(min-width: 1024px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");

  const n = scene.panels.length;
  const [step, setStep] = useState(0);
  const [typedStep, setTypedStep] = useState(-1);
  const [instantStep, setInstantStep] = useState(-1);
  const ended = step >= n;

  const pages = useMemo(() => paginate(scene.panels), [scene.panels]);
  const pageIndex = Math.max(0, pages.findIndex((rows) => rows.some((r) => r.includes(Math.min(step, n - 1)))));

  const rewards = unlocksAfter(scene.after);
  const next = scene.after ? nextChallenge(scene.after) : ALL_CHALLENGES[0];
  const chapter = scene.after ? challengeNumber(scene.after) : 0;

  useEffect(() => {
    if (hydrated && !unlocked) router.replace("/jugar");
  }, [hydrated, unlocked, router]);

  useEffect(() => {
    if (ended && hydrated && unlocked) markSceneSeen(scene.id);
  }, [ended, hydrated, unlocked, markSceneSeen, scene.id]);

  const typing = !ended && typedStep < step && !reduced;
  const advance = () => {
    if (ended) return;
    // Primer clic: completa la narración; el siguiente pasa de viñeta.
    if (typing) setInstantStep(step);
    else setStep((s) => Math.min(n, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Avance automático cuando la viñeta ya terminó de escribirse.
  const duration = ended ? 0 : panelDuration(scene.panels[step]);
  const counting = autoplay && hydrated && !ended && !typing;
  useEffect(() => {
    if (!counting) return;
    const t = setTimeout(() => setStep((s) => Math.min(n, s + 1)), duration);
    return () => clearTimeout(t);
  }, [counting, step, duration, n]);
  const skip = () => setStep(n);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea")) {
      if (e.key === "Enter" || e.key === " ") return; // el botón enfocado se encarga
    }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      advance();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    }
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);

  if (hydrated && !unlocked) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ink text-paper-3">
        <Lock className="h-8 w-8" />
        <p className="font-display text-lg">Esta escena aún está bloqueada. Volviendo al mapa…</p>
      </div>
    );
  }

  const current = scene.panels[Math.min(step, n - 1)];
  const renderPanel = (i: number, className: string) => {
    const revealed = i <= step;
    const p = scene.panels[i];
    return revealed ? (
      <ComicPanel
        key={i}
        panel={p}
        instant={reduced || instantStep >= i || i < step}
        onTyped={() => setTypedStep((s) => Math.max(s, i))}
        className={`panel-in ${className}`}
      />
    ) : (
      <div key={i} className={`border-[3px] border-dashed border-paper-3/15 ${className}`} aria-hidden="true" />
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-ink text-paper-3">
      {/* Cabecera */}
      <div className="flex shrink-0 items-center gap-3 px-4 py-2.5">
        <Link href="/jugar" className="btn-ghost p-1.5 text-paper-3 hover:bg-paper-3/10" aria-label="Salir al mapa" title="Salir al mapa">
          <X className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="kicker text-[#f6d77a]">{chapter === 0 ? "Prólogo" : `Capítulo ${chapter}`}</p>
          <h1 className="font-display truncate text-lg font-extrabold leading-tight sm:text-2xl">{scene.title}</h1>
        </div>
        {!ended && (
          <button
            onClick={skip}
            className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-paper-3/40 px-3 py-1 text-sm font-bold hover:border-paper-3"
            aria-label="Saltar escena"
          >
            <FastForward className="h-4 w-4" /> Saltar<span className="hidden sm:inline"> escena</span>
          </button>
        )}
      </div>

      {/* Lo que dice la viñeta actual, para lectores de pantalla */}
      <p className="sr-only" aria-live="polite">
        {ended ? "Fin de la escena." : `Viñeta ${step + 1} de ${n}. ${panelText(current)}`}
      </p>

      {ended ? (
        <SceneEnd rewards={rewards} next={next} final={!next} />
      ) : (
        <>
          <div
            ref={stageRef}
            onClick={advance}
            className="relative min-h-0 flex-1 cursor-pointer select-none px-3 pb-2 sm:px-6"
            data-testid="comic-stage"
          >
            {desktop ? (
              <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
                {pages[pageIndex].map((row, r) => (
                  <div key={`${pageIndex}-${r}`} className="flex min-h-0 flex-1 gap-4">
                    {row.map((i) => (
                      <div
                        key={i}
                        className="flex min-w-0"
                        style={{ flex: `${UNITS[scene.panels[i].layout ?? "half"]} 1 0`, "--tilt": tilt(i) } as React.CSSProperties}
                      >
                        {renderPanel(i, "flex-1")}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-auto flex h-full max-h-[140vw] max-w-xl" style={{ "--tilt": tilt(step) } as React.CSSProperties}>
                {renderPanel(step, "flex-1")}
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex shrink-0 items-center justify-center gap-4 px-4 pb-4 pt-2">
            <button
              onClick={back}
              disabled={step === 0}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper-3/40 hover:border-paper-3 disabled:opacity-30"
              aria-label="Viñeta anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <ol className="flex items-center gap-1.5" aria-label="Progreso de la escena">
              {scene.panels.map((_, i) => (
                <li
                  key={i}
                  className={`relative h-2 overflow-hidden rounded-full transition-all ${i === step ? "w-8 bg-[#f6d77a]/35" : i < step ? "w-2 bg-paper-3" : "w-2 bg-paper-3/25"}`}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i === step && (
                    // Se llena mientras corre el tiempo de la viñeta
                    <span
                      key={`${step}-${counting}`}
                      className={`absolute inset-y-0 left-0 bg-[#f6d77a] ${counting ? "comic-countdown" : "w-full"}`}
                      style={counting ? { animationDuration: `${duration}ms` } : undefined}
                    />
                  )}
                  <span className="sr-only">Viñeta {i + 1}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setComicAutoplay(!autoplay)}
              aria-pressed={autoplay}
              aria-label="Avance automático"
              title={autoplay ? "Pausar el avance automático" : "Activar el avance automático"}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper-3/40 hover:border-paper-3"
            >
              {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={advance}
              className="btn btn-seal h-10 px-4 text-sm"
              aria-label={step === n - 1 ? "Terminar escena" : "Siguiente viñeta"}
            >
              {step === n - 1 ? "Terminar" : "Siguiente"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="hidden pb-3 text-center text-xs text-paper-3/60 lg:block">
            Clic, <kbd className="font-mono">Espacio</kbd> o <kbd className="font-mono">→</kbd> para continuar ·{" "}
            <kbd className="font-mono">←</kbd> para volver ·{" "}
            {autoplay ? "avanza sola (pausa con ⏸)" : "avance automático en pausa"}
          </p>
        </>
      )}
    </div>
  );
}

function SceneEnd({ rewards, next, final }: { rewards: Unlock[]; next?: (typeof ALL_CHALLENGES)[number]; final: boolean }) {
  const focusRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    focusRef.current?.focus();
  }, []);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 scrollbar-thin">
      <div className="mx-auto flex max-w-2xl flex-col items-center pt-4 text-center">
        {rewards.length > 0 && (
          <>
            <p className="kicker text-[#f6d77a]">{rewards.length === 1 ? "Nueva recompensa" : "Nuevas recompensas"}</p>
            <h2 className="font-display mt-1 text-3xl font-extrabold">¡Bao obtuvo…!</h2>
            <ul className="mt-5 grid w-full gap-3 sm:grid-cols-2">
              {rewards.map((u, i) => {
                const Icon = UNLOCK_ICONS[u.icon];
                return (
                  <li
                    key={u.id}
                    className="paper-card ink-in relative flex items-start gap-3 p-4 text-left text-ink"
                    style={{ "--d": i * 2 }}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-[#f6d77a]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="kicker text-seal-ink">{KIND_LABEL[u.kind]}</span>
                      <span className="font-display block text-lg font-extrabold leading-tight">{u.name}</span>
                      <span className="mt-0.5 block text-sm text-ink-2">{u.description}</span>
                    </span>
                    <Hanko char="新" className="stamp-in absolute -right-2 -top-2 h-8 w-8 text-sm" />
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <div className={`flex w-full max-w-sm flex-col gap-3 ${rewards.length ? "mt-8" : "mt-16"}`}>
          {final && <p className="font-display text-2xl font-extrabold">Has completado la historia.</p>}
          {next ? (
            <Link ref={focusRef} href={challengeHref(next)} className="btn btn-seal px-5 py-3 text-lg">
              <Play className="h-5 w-5 fill-current" /> Reto {challengeNumber(next.id)} · {next.title}
            </Link>
          ) : (
            <Link ref={focusRef} href="/diario" className="btn btn-seal px-5 py-3 text-lg">
              <BookMarked className="h-5 w-5" /> Abrir el Diario de Bao
            </Link>
          )}
          <SaveRewardsLink />
          <div className="grid grid-cols-2 gap-3">
            <Link href="/jugar" className="btn btn-paper px-4 py-2.5">
              <MapIcon className="h-4 w-4" /> Mapa
            </Link>
            <Link href={next ? "/diario" : "/"} className="btn btn-paper px-4 py-2.5">
              {next ? (
                <>
                  <BookMarked className="h-4 w-4" /> Diario
                </>
              ) : (
                "Inicio"
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sin sesión, invita a guardar las recompensas con Google. */
function SaveRewardsLink() {
  const signedOut = useAuth((s) => s.status === "out");
  if (!signedOut) return null;
  return (
    <button onClick={openLogin} className="text-sm font-bold text-[#f6d77a] underline underline-offset-4 hover:text-paper-3" aria-haspopup="dialog">
      Guarda las recompensas de Bao con tu cuenta de Google
    </button>
  );
}
