"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  CircleDashed,
  FlaskConical,
  KeyRound,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { LEVELS, challengeHref } from "@/content/challenges";
import type { Challenge, Level } from "@/content/types";
import { CodeEditor } from "@/components/CodeEditor";
import { Dialog } from "@/components/Dialog";
import { OutputPanel } from "@/components/OutputPanel";
import { PyodideStatus } from "@/components/PyodideStatus";
import { Tabs, tabPanelProps } from "@/components/Tabs";
import { ChallengeIcon } from "@/components/icons/ChallengeIcon";
import { Enso, Hanko, LevelLogo } from "@/components/icons/Logos";
import { MiniMap } from "@/components/map/MiniMap";
import { ensureRunner, runCode, runTests, type RunResult, type TestRun } from "@/lib/pyodide/runner";
import { FEATURES } from "@/lib/features";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { isChallengeUnlocked, nextChallenge } from "@/lib/progress/unlock";
import { LEVEL_THEME } from "@/lib/theme";

const SOLUTION_AFTER_ATTEMPTS = 3;
const SAVE_DELAY_MS = 500;
const PASTE_NOTICE_MS = 2500;

type MobileTab = "reto" | "codigo" | "resultado";
type OutputTab = "salida" | "tests";

const MOBILE_TABS = [
  { id: "reto", label: "Reto" },
  { id: "codigo", label: "Código" },
  { id: "resultado", label: "Resultado" },
] as const;

type Props = {
  challenge: Challenge;
  level: Level;
  /** Enunciado ya renderizado en el servidor (Markdown). */
  description: ReactNode;
  /** Pistas ya renderizadas en el servidor (Markdown). */
  hints: ReactNode[];
};

export function ChallengeView({ challenge, level, description, hints }: Props) {
  const challengeId = challenge.id;
  const theme = LEVEL_THEME[challenge.level];
  const router = useRouter();

  // Antes de hidratar se asume "desbloqueado y sin progreso" para que el HTML
  // del servidor (con el enunciado, útil para buscadores) coincida con el del cliente.
  const hydrated = useHasHydrated();
  const unlockedStored = useProgress((s) => isChallengeUnlocked(challengeId, s.completed));
  const doneStored = useProgress((s) => !!s.completed[challengeId]);
  const attemptsStored = useProgress((s) => s.attempts[challengeId] ?? 0);
  const savedCode = useProgress((s) => s.code[challengeId]);
  const unlocked = !hydrated || unlockedStored;
  const isDone = hydrated && doneStored;
  const attempts = hydrated ? attemptsStored : 0;
  const { saveCode, resetCode, recordAttempt } = useProgress.getState();

  // Código en edición; hasta que el usuario escriba, se usa el guardado o el inicial.
  const [draft, setDraft] = useState<string | null>(null);
  const code = draft ?? (hydrated ? savedCode : undefined) ?? challenge.starterCode;
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>("salida");
  const [mobileTab, setMobileTab] = useState<MobileTab>("reto");
  const [hintsShown, setHintsShown] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pasteNotice, setPasteNotice] = useState(false);
  const pasteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onPasteBlocked = () => {
    setPasteNotice(true);
    setAnnouncement("Pegar está desactivado en los retos.");
    clearTimeout(pasteTimer.current);
    pasteTimer.current = setTimeout(() => setPasteNotice(false), PASTE_NOTICE_MS);
  };
  useEffect(() => () => clearTimeout(pasteTimer.current), []);

  // Bloqueo: no se puede entrar a un reto sin completar los anteriores.
  useEffect(() => {
    if (!unlocked) router.replace("/jugar");
  }, [unlocked, router]);

  useEffect(() => {
    ensureRunner().catch(() => {});
  }, []);

  // Autoguardado con debounce. El texto pendiente vive en un ref para poder
  // guardarlo al salir de la página o descartarlo al restaurar.
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pending = useRef<string | null>(null);
  const flushSave = () => {
    clearTimeout(saveTimer.current);
    if (pending.current !== null) {
      useProgress.getState().saveCode(challengeId, pending.current);
      pending.current = null;
    }
  };
  const onChange = (value: string) => {
    setDraft(value);
    pending.current = value;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, SAVE_DELAY_MS);
  };
  useEffect(
    () => () => {
      // Al desmontar se guarda lo pendiente en vez de perderlo.
      clearTimeout(saveTimer.current);
      if (pending.current !== null) useProgress.getState().saveCode(challengeId, pending.current);
    },
    [challengeId],
  );

  // Guardia con ref: dos Ctrl+Enter seguidos no deben lanzar dos ejecuciones.
  const startBusy = () => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setExecError(null);
    setAnnouncement("Ejecutando…");
    return true;
  };
  const endBusy = () => {
    busyRef.current = false;
    setBusy(false);
  };

  const run = async () => {
    if (!startBusy()) return;
    setOutputTab("salida");
    setMobileTab("resultado");
    try {
      const res = await runCode(code, challenge.setup);
      setRunResult(res);
      setAnnouncement(res.ok ? "Ejecución terminada." : "La ejecución terminó con un error.");
    } catch (e) {
      setExecError((e as Error).message);
      setAnnouncement((e as Error).message);
    } finally {
      endBusy();
    }
  };

  const test = async () => {
    if (!startBusy()) return;
    setOutputTab("tests");
    setMobileTab("resultado");
    flushSave();
    saveCode(challengeId, code);
    try {
      const res = await runTests(code, challenge.setup, challenge.tests);
      setTestRun(res);
      const passedN = res.results.filter((r) => r.passed).length;
      const passed = !res.error && passedN === res.results.length;
      setAnnouncement(`${passedN} de ${res.results.length} tests superados.`);
      const wasDone = !!useProgress.getState().completed[challengeId];
      recordAttempt(challengeId, passed);
      if (passed && !wasDone) setCelebrate(true);
    } catch (e) {
      setExecError((e as Error).message);
      setAnnouncement((e as Error).message);
      setTestRun(null);
    } finally {
      endBusy();
    }
  };

  const restore = () => {
    if (!confirm("¿Restaurar el código inicial? Perderás tu código actual de este reto.")) return;
    // Se descarta el guardado pendiente para que no reviva el código anterior.
    clearTimeout(saveTimer.current);
    pending.current = null;
    resetCode(challengeId);
    setDraft(challenge.starterCode);
  };

  const showSolution = () => {
    if (!confirm("¿Ver la solución? Se reemplazará tu código en el editor.")) return;
    onChange(challenge.solution);
  };

  const next = nextChallenge(challengeId);
  const passedCount = testRun?.results.filter((r) => r.passed).length ?? 0;
  // La solución está oculta mientras FEATURES.showSolution sea false.
  const canSeeSolution = FEATURES.showSolution && (isDone || attempts >= SOLUTION_AFTER_ATTEMPTS);
  const testState = (i: number) => {
    const r = testRun?.results[i];
    return !r ? "pending" : r.passed ? "passed" : "failed";
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {!unlocked && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-paper/95 text-ink-2">
          <Lock className="h-8 w-8" />
          <p className="font-display text-lg">Este reto está bloqueado. Volviendo al mapa…</p>
        </div>
      )}

      {/* Barra superior */}
      <div className="flex shrink-0 items-center gap-3 border-b border-rule bg-paper-3/50 px-3 py-2">
        <Link href="/jugar" className="btn-ghost p-1.5" title="Volver al mapa" aria-label="Volver al mapa">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <LevelLogo level={challenge.level} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className={`kicker truncate tracking-[0.2em] ${theme.text}`}>
            {level.name} · Reto {challenge.number}/{level.challenges.length}
          </p>
          <h1 className="font-display flex items-center gap-2 truncate text-xl font-extrabold leading-tight text-ink">
            {challenge.title}
            {isDone && (
              <>
                <Hanko className="h-6 w-6 shrink-0 rotate-[-8deg] text-xs" />
                <span className="sr-only">(completado)</span>
              </>
            )}
          </h1>
        </div>
        <div className="ml-auto hidden xl:block">{hydrated && <MiniMap activeId={challengeId} />}</div>
        <div className="ml-auto flex items-center gap-3 xl:ml-5">
          <Link
            href="/tutorial/como-funcionan-los-retos"
            className="btn-ghost px-2 py-1 text-xs"
            title="Cómo funcionan los retos"
          >
            <CircleHelp className="h-4 w-4" />
            <span className="sr-only lg:not-sr-only">¿Cómo funciona?</span>
          </Link>
          <span className="hidden sm:block">
            <PyodideStatus />
          </span>
        </div>
      </div>

      {/* Anuncios para lectores de pantalla */}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {/* Pestañas móvil */}
      <Tabs
        idPrefix="m"
        label="Secciones del reto"
        tabs={MOBILE_TABS}
        value={mobileTab}
        onChange={setMobileTab}
        className="flex shrink-0 border-b border-rule lg:hidden"
        tabClassName={(selected) =>
          `flex-1 py-2 text-sm font-bold ${selected ? "border-b-[3px] border-seal text-ink" : "text-ink-3"}`
        }
      />

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,2fr)_3fr]">
        {/* Enunciado */}
        <section
          {...tabPanelProps("m", "reto")}
          aria-label="Enunciado"
          className={`${mobileTab === "reto" ? "flex" : "hidden"} min-h-0 flex-col overflow-y-auto border-rule px-6 py-5 scrollbar-thin lg:flex lg:border-r-2 lg:border-r-ink`}
        >
          <span className={`tag mb-4 w-fit ${theme.text}`}>
            <ChallengeIcon name={challenge.icon} className="h-3.5 w-3.5" />
            {challenge.topic}
          </span>
          {description}

          <div className="mt-7">
            <h2 className="font-display mb-2 flex items-center gap-2 text-base font-extrabold text-ink">
              <FlaskConical className="h-4 w-4" /> Tests a superar
              <span className="text-ink-3">({challenge.tests.length})</span>
            </h2>
            <ul className="divide-y divide-rule border-y border-rule text-sm text-ink-2">
              {challenge.tests.map((t, i) => {
                const st = testState(i);
                return (
                  <li key={t.name} className="flex items-start gap-2.5 py-1.5">
                    {st === "pending" ? (
                      <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                    ) : st === "passed" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bamboo-ink" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-seal-ink" />
                    )}
                    <span>
                      {t.name}
                      <span className="sr-only">
                        {" "}
                        ({st === "pending" ? "pendiente" : st === "passed" ? "superado" : "fallido"})
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-7 space-y-3">
            {hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="ink-in relative border-l-[3px] border-seal bg-paper-3/70 py-2 pl-4 pr-3 text-sm">
                <p className="mb-1 text-xs font-bold text-ink">Pista {i + 1}</p>
                {h}
              </div>
            ))}
            <div className="flex flex-wrap gap-2.5">
              {hintsShown < hints.length && (
                <button onClick={() => setHintsShown((n) => n + 1)} className="btn btn-paper px-3 py-1.5 text-sm">
                  <Lightbulb className="h-4 w-4" /> {hintsShown ? "Otra pista" : "Ver pista"}
                </button>
              )}
              {challenge.tutorialLink && (
                <Link href={`/tutorial/${challenge.tutorialLink}`} className="btn btn-paper px-3 py-1.5 text-sm">
                  <BookOpen className="h-4 w-4" /> Repasar en el tutorial
                </Link>
              )}
              {canSeeSolution && (
                <button onClick={showSolution} className="btn btn-paper px-3 py-1.5 text-sm">
                  <KeyRound className="h-4 w-4" /> Ver solución
                </button>
              )}
            </div>
            {FEATURES.showSolution && !canSeeSolution && attempts > 0 && (
              <p className="text-xs text-ink-3">
                La solución se desbloquea tras {SOLUTION_AFTER_ATTEMPTS} intentos ({attempts}/
                {SOLUTION_AFTER_ATTEMPTS}).
              </p>
            )}
          </div>
        </section>

        {/* Editor + resultados */}
        <div className={`${mobileTab === "reto" ? "hidden" : "flex"} min-h-0 flex-col lg:flex`}>
          <div
            {...tabPanelProps("m", "codigo")}
            tabIndex={-1}
            className={`${mobileTab === "codigo" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}
          >
            <div className="relative min-h-0 flex-1 bg-editor">
              <CodeEditor
                value={code}
                onChange={onChange}
                onRun={run}
                onTest={test}
                allowPaste={false}
                onPasteBlocked={onPasteBlocked}
              />
              {pasteNotice && (
                <p
                  className="ink-in pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px_12px_8px_10px] border-2 border-seal bg-paper-3 px-3 py-1.5 text-sm font-bold text-ink shadow-hand-sm"
                  aria-hidden="true"
                >
                  Pegar está desactivado en los retos: escribe tu propio código ✍️
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-y-2 border-ink bg-paper-2/70 px-3 py-2.5">
              <button onClick={run} disabled={busy} className="btn btn-ink px-4 py-1.5 text-sm" aria-keyshortcuts="Control+Enter">
                <Play className="h-4 w-4 fill-current" /> Ejecutar
              </button>
              <button
                onClick={test}
                disabled={busy}
                className="btn btn-seal px-4 py-1.5 text-sm"
                aria-keyshortcuts="Control+Shift+Enter"
              >
                <FlaskConical className="h-4 w-4" /> Correr tests
              </button>
              <span className="hidden text-xs text-ink-3 md:inline">
                <kbd className="font-mono">Ctrl+Enter</kbd> ejecutar · <kbd className="font-mono">Ctrl+Shift+Enter</kbd> tests
              </span>
              <button onClick={restore} className="btn-ghost ml-auto px-3 py-1.5 text-sm" title="Restaurar código inicial">
                <RotateCcw className="h-4 w-4" /> <span className="sr-only sm:not-sr-only">Restaurar</span>
              </button>
            </div>
          </div>

          <div
            {...tabPanelProps("m", "resultado")}
            tabIndex={-1}
            className={`${mobileTab === "resultado" ? "flex" : "hidden"} min-h-0 flex-1 flex-col bg-paper lg:flex lg:h-[40%] lg:flex-none`}
          >
            <Tabs
              idPrefix="out"
              label="Resultados"
              tabs={[
                { id: "salida", label: "Salida" },
                {
                  id: "tests",
                  label: (
                    <>
                      Tests
                      {testRun && (
                        <span
                          className={`ml-1.5 tabular-nums ${passedCount === challenge.tests.length ? "text-bamboo-ink" : "text-seal-ink"}`}
                        >
                          {passedCount}/{challenge.tests.length}
                        </span>
                      )}
                    </>
                  ),
                },
              ]}
              value={outputTab}
              onChange={setOutputTab}
              className="flex shrink-0 gap-4 border-b border-rule px-4 pt-2"
              tabClassName={(selected) =>
                `-mb-px border-b-[3px] px-1 pb-1.5 text-sm font-bold transition-colors ${
                  selected ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"
                }`
              }
            />
            <div
              {...tabPanelProps("out", "salida")}
              hidden={outputTab !== "salida"}
              className="min-h-0 flex-1 overflow-auto p-4 scrollbar-thin"
            >
              <OutputPanel result={runResult} error={execError} />
            </div>
            <div
              {...tabPanelProps("out", "tests")}
              hidden={outputTab !== "tests"}
              className="min-h-0 flex-1 overflow-auto p-4 scrollbar-thin"
            >
              <TestResults run={testRun} error={execError} total={challenge.tests.length} />
            </div>
          </div>
        </div>
      </div>

      {celebrate && (
        <SuccessModal
          challenge={challenge}
          level={level}
          onClose={() => setCelebrate(false)}
          nextHref={next ? challengeHref(next) : null}
          nextTitle={next?.title}
        />
      )}
    </div>
  );
}

function TestResults({ run, error, total }: { run: TestRun | null; error: string | null; total: number }) {
  if (error) return <pre className="whitespace-pre-wrap font-mono text-sm text-seal-ink">{error}</pre>;
  if (!run)
    return (
      <p className="text-sm text-ink-3">
        Pulsa <b className="text-ink">Correr tests</b> para comprobar tu solución. Debes pasar los {total} tests para
        ganar el sello de este reto.
      </p>
    );
  return (
    <ul className="space-y-2.5">
      {run.error && (
        <li>
          <pre className="whitespace-pre-wrap border-l-[3px] border-seal bg-seal/5 p-3 font-mono text-sm text-seal-dark">
            {run.error}
          </pre>
        </li>
      )}
      {run.results.map((r, i) => (
        <li
          key={r.name}
          className={`ink-in border-l-[3px] bg-paper-3/80 px-3 py-2 ${r.passed ? "border-bamboo" : "border-seal"}`}
          style={{ "--d": i * 0.6 }}
        >
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            {r.passed ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-bamboo-ink" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-seal-ink" />
            )}
            {r.name}
            <span className="sr-only">({r.passed ? "superado" : "fallido"})</span>
          </p>
          {r.message && (
            <pre className="mt-1.5 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-2 scrollbar-thin">
              {r.message}
            </pre>
          )}
        </li>
      ))}
    </ul>
  );
}

function SuccessModal({
  challenge,
  level,
  onClose,
  nextHref,
  nextTitle,
}: {
  challenge: Challenge;
  level: Level;
  onClose: () => void;
  nextHref: Route | null;
  nextTitle?: string;
}) {
  const levelDone = challenge.number === level.challenges.length;
  const nextLevel = LEVELS[LEVELS.findIndex((l) => l.id === level.id) + 1];

  return (
    <Dialog onClose={onClose} labelledBy="success-title" describedBy="success-desc" className="p-7 text-center">
      <div className="relative mx-auto grid h-32 w-32 place-items-center">
        {levelDone ? (
          <LevelLogo level={challenge.level} className="h-24 w-24" />
        ) : (
          <Enso animated className="absolute inset-0 h-full w-full" />
        )}
        <Hanko className="stamp-in relative h-16 w-16 text-4xl [animation-delay:350ms]" />
      </div>
      <h2 id="success-title" className="font-display mt-4 text-3xl font-extrabold text-ink">
        {levelDone ? `${level.name}, completado` : "¡Reto superado!"}
      </h2>
      <p id="success-desc" className="mt-2 text-ink-2">
        {levelDone && nextLevel
          ? `Desbloqueaste el nivel ${nextLevel.difficulty}: ${nextLevel.name}.`
          : levelDone
            ? "Completaste todos los retos. Eres un Maestro Panda."
            : `Pasaste todos los tests de “${challenge.title}”.`}
      </p>
      <div className="mt-7 flex flex-col gap-3">
        {nextHref && (
          <Link href={nextHref} className="btn btn-seal px-5 py-3">
            Siguiente: {nextTitle}
          </Link>
        )}
        <Link href="/jugar" className="btn btn-paper px-5 py-2.5">
          Ver mapa
        </Link>
        <button onClick={onClose} className="mt-1 text-sm font-bold text-ink-3 hover:text-ink">
          Quedarme aquí
        </button>
      </div>
    </Dialog>
  );
}
