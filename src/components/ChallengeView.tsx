"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  KeyRound,
  Lightbulb,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { LEVELS, challengeHref, getChallengeById } from "@/content/challenges";
import { CodeEditor } from "@/components/CodeEditor";
import { Markdown } from "@/components/Markdown";
import { OutputPanel } from "@/components/OutputPanel";
import { PyodideStatus } from "@/components/PyodideStatus";
import { ChallengeIcon } from "@/components/icons/ChallengeIcon";
import { Enso, Hanko, LevelLogo } from "@/components/icons/Logos";
import { MiniMap } from "@/components/map/MiniMap";
import { ensureRunner, runCode, runTests, type RunResult, type TestRun } from "@/lib/pyodide/runner";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { isChallengeUnlocked, nextChallenge } from "@/lib/progress/unlock";
import { LEVEL_THEME } from "@/lib/theme";

const SOLUTION_AFTER_ATTEMPTS = 3;

type MobileTab = "reto" | "codigo" | "resultado";
type OutputTab = "salida" | "tests";

export function ChallengeView({ challengeId }: { challengeId: string }) {
  const challenge = getChallengeById(challengeId)!;
  const level = LEVELS.find((l) => l.id === challenge.level)!;
  const theme = LEVEL_THEME[challenge.level];
  const router = useRouter();

  const hydrated = useHasHydrated();
  const completed = useProgress((s) => s.completed);
  const savedCode = useProgress((s) => s.code[challengeId]);
  const attempts = useProgress((s) => s.attempts[challengeId] ?? 0);
  const { saveCode, resetCode, recordAttempt } = useProgress.getState();

  const unlocked = isChallengeUnlocked(challengeId, completed);
  const isDone = !!completed[challengeId];

  // Código en edición; hasta que el usuario escriba, se usa el guardado o el inicial.
  const [draft, setDraft] = useState<string | null>(null);
  const code = draft ?? savedCode ?? challenge.starterCode;
  const [busy, setBusy] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>("salida");
  const [mobileTab, setMobileTab] = useState<MobileTab>("reto");
  const [hintsShown, setHintsShown] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  // Bloqueo: no se puede entrar a un reto sin completar los anteriores.
  useEffect(() => {
    if (hydrated && !unlocked) router.replace("/jugar");
  }, [hydrated, unlocked, router]);

  useEffect(() => {
    ensureRunner().catch(() => {});
  }, []);

  // Autoguardado con debounce.
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChange = (value: string) => {
    setDraft(value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCode(challengeId, value), 500);
  };
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setOutputTab("salida");
    setMobileTab("resultado");
    setExecError(null);
    try {
      setRunResult(await runCode(code, challenge.setup));
    } catch (e) {
      setExecError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [code, busy, challenge.setup]);

  const test = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setOutputTab("tests");
    setMobileTab("resultado");
    setExecError(null);
    saveCode(challengeId, code);
    try {
      const res = await runTests(code, challenge.setup, challenge.tests);
      setTestRun(res);
      const passed = !res.error && res.results.every((r) => r.passed);
      const wasDone = !!useProgress.getState().completed[challengeId];
      recordAttempt(challengeId, passed);
      if (passed && !wasDone) setCelebrate(true);
    } catch (e) {
      setExecError((e as Error).message);
      setTestRun(null);
    } finally {
      setBusy(false);
    }
  }, [code, busy, challenge, challengeId, recordAttempt, saveCode]);

  const restore = () => {
    if (!confirm("¿Restaurar el código inicial? Perderás tu código actual de este reto.")) return;
    resetCode(challengeId);
    setDraft(challenge.starterCode);
  };

  const showSolution = () => {
    if (!confirm("¿Ver la solución? Se reemplazará tu código en el editor.")) return;
    onChange(challenge.solution);
  };

  const next = nextChallenge(challengeId);
  const passedCount = testRun?.results.filter((r) => r.passed).length ?? 0;
  const canSeeSolution = isDone || attempts >= SOLUTION_AFTER_ATTEMPTS;

  if (!hydrated || !unlocked) {
    return (
      <div className="font-display flex flex-1 items-center justify-center text-lg text-ink-3">Preparando la tinta…</div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Barra superior */}
      <div className="flex shrink-0 items-center gap-3 border-b border-rule bg-paper-3/50 px-3 py-2">
        <Link href="/jugar" className="btn-ghost p-1.5" title="Volver al mapa" aria-label="Volver al mapa">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <LevelLogo level={challenge.level} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className={`truncate text-[11px] font-black uppercase tracking-[0.2em] ${theme.text}`}>
            {level.name} · Reto {challenge.number}/{level.challenges.length}
          </p>
          <h1 className="font-display flex items-center gap-2 truncate text-xl font-extrabold leading-tight text-ink">
            {challenge.title}
            {isDone && <Hanko className="h-6 w-6 shrink-0 rotate-[-8deg] text-xs" />}
          </h1>
        </div>
        <div className="ml-auto hidden xl:block">
          <MiniMap activeId={challengeId} />
        </div>
        <div className="ml-auto hidden sm:block xl:ml-5">
          <PyodideStatus />
        </div>
      </div>

      {/* Pestañas móvil */}
      <div className="flex shrink-0 border-b border-rule lg:hidden">
        {(["reto", "codigo", "resultado"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-sm font-bold capitalize ${
              mobileTab === t ? "border-b-[3px] border-seal text-ink" : "text-ink-3"
            }`}
          >
            {t === "codigo" ? "Código" : t}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,2fr)_3fr]">
        {/* Enunciado */}
        <aside
          className={`${mobileTab === "reto" ? "flex" : "hidden"} min-h-0 flex-col overflow-y-auto border-rule px-6 py-5 scrollbar-thin lg:flex lg:border-r-2 lg:border-r-ink`}
        >
          <span className={`tag mb-4 w-fit ${theme.text}`}>
            <ChallengeIcon name={challenge.icon} className="h-3.5 w-3.5" />
            {challenge.topic}
          </span>
          <Markdown>{challenge.description}</Markdown>

          <div className="mt-7">
            <h3 className="font-display mb-2 flex items-center gap-2 text-base font-extrabold text-ink">
              <FlaskConical className="h-4 w-4" /> Tests a superar
              <span className="text-ink-3">({challenge.tests.length})</span>
            </h3>
            <ul className="divide-y divide-rule border-y border-rule text-sm text-ink-2">
              {challenge.tests.map((t, i) => {
                const r = testRun?.results[i];
                return (
                  <li key={t.name} className="flex items-start gap-2.5 py-1.5">
                    {!r ? (
                      <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                    ) : r.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
                    )}
                    {t.name}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-7 space-y-3">
            {challenge.hints.slice(0, hintsShown).map((h, i) => (
              <div
                key={i}
                className="ink-in relative border-l-[3px] border-seal bg-paper-3/70 py-2 pl-4 pr-3 text-sm"
              >
                <Markdown>{`**Pista ${i + 1}.** ${h}`}</Markdown>
              </div>
            ))}
            <div className="flex flex-wrap gap-2.5">
              {hintsShown < challenge.hints.length && (
                <button onClick={() => setHintsShown((n) => n + 1)} className="btn btn-paper px-3 py-1.5 text-sm">
                  <Lightbulb className="h-4 w-4" /> {hintsShown ? "Otra pista" : "Ver pista"}
                </button>
              )}
              {challenge.tutorialLink && (
                <Link
                  href={`/tutorial/${challenge.tutorialLink}`}
                  target="_blank"
                  className="btn btn-paper px-3 py-1.5 text-sm"
                >
                  <BookOpen className="h-4 w-4" /> Repasar en el tutorial
                </Link>
              )}
              {canSeeSolution && (
                <button onClick={showSolution} className="btn btn-paper px-3 py-1.5 text-sm">
                  <KeyRound className="h-4 w-4" /> Ver solución
                </button>
              )}
            </div>
            {!canSeeSolution && attempts > 0 && (
              <p className="text-xs text-ink-3">
                La solución se desbloquea tras {SOLUTION_AFTER_ATTEMPTS} intentos ({attempts}/
                {SOLUTION_AFTER_ATTEMPTS}).
              </p>
            )}
          </div>
        </aside>

        {/* Editor + resultados */}
        <section className={`${mobileTab === "reto" ? "hidden" : "flex"} min-h-0 flex-col lg:flex`}>
          <div className={`${mobileTab === "codigo" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}>
            <div className="min-h-0 flex-1 bg-paper-3">
              <CodeEditor value={code} onChange={onChange} onRun={run} onTest={test} />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-y-2 border-ink bg-paper-2/70 px-3 py-2.5">
              <button onClick={run} disabled={busy} className="btn btn-ink px-4 py-1.5 text-sm" title="Ctrl+Enter">
                <Play className="h-4 w-4 fill-current" /> Ejecutar
              </button>
              <button onClick={test} disabled={busy} className="btn btn-seal px-4 py-1.5 text-sm" title="Ctrl+Shift+Enter">
                <FlaskConical className="h-4 w-4" /> Correr tests
              </button>
              <span className="hidden text-xs text-ink-3 md:inline">
                <kbd className="font-mono">Ctrl+Enter</kbd> ejecutar · <kbd className="font-mono">Ctrl+Shift+Enter</kbd> tests
              </span>
              <button onClick={restore} className="btn-ghost ml-auto px-3 py-1.5 text-sm" title="Restaurar código inicial">
                <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Restaurar</span>
              </button>
            </div>
          </div>

          <div
            className={`${mobileTab === "resultado" ? "flex" : "hidden"} min-h-0 flex-1 flex-col bg-paper lg:flex lg:h-[40%] lg:flex-none`}
          >
            <div className="flex shrink-0 gap-4 border-b border-rule px-4 pt-2">
              {(["salida", "tests"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOutputTab(t)}
                  className={`-mb-px border-b-[3px] px-1 pb-1.5 text-sm font-bold capitalize transition-colors ${
                    outputTab === t ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"
                  }`}
                >
                  {t}
                  {t === "tests" && testRun && (
                    <span
                      className={`ml-1.5 tabular-nums ${passedCount === challenge.tests.length ? "text-bamboo" : "text-seal"}`}
                    >
                      {passedCount}/{challenge.tests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 scrollbar-thin">
              {outputTab === "salida" ? (
                <OutputPanel result={runResult} error={execError} />
              ) : (
                <TestResults run={testRun} error={execError} total={challenge.tests.length} />
              )}
            </div>
          </div>
        </section>
      </div>

      {celebrate && (
        <SuccessModal
          challengeId={challengeId}
          onClose={() => setCelebrate(false)}
          nextHref={next ? challengeHref(next) : null}
          nextTitle={next?.title}
        />
      )}
    </div>
  );
}

function TestResults({ run, error, total }: { run: TestRun | null; error: string | null; total: number }) {
  if (error) return <pre className="whitespace-pre-wrap font-mono text-sm text-seal">{error}</pre>;
  if (!run)
    return (
      <p className="text-sm text-ink-3">
        Pulsa <b className="text-ink">Correr tests</b> para comprobar tu solución. Debes pasar los {total} tests para
        ganar el sello de este reto.
      </p>
    );
  return (
    <div className="space-y-2.5">
      {run.error && (
        <pre className="whitespace-pre-wrap border-l-[3px] border-seal bg-seal/5 p-3 font-mono text-sm text-seal-dark">
          {run.error}
        </pre>
      )}
      {run.results.map((r, i) => (
        <div
          key={r.name}
          className={`ink-in border-l-[3px] bg-paper-3/80 px-3 py-2 ${r.passed ? "border-bamboo" : "border-seal"}`}
          style={{ ["--d" as string]: i * 0.6 }}
        >
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            {r.passed ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-bamboo" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-seal" />
            )}
            {r.name}
          </p>
          {r.message && (
            <pre className="mt-1.5 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-2 scrollbar-thin">
              {r.message}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function SuccessModal({
  challengeId,
  onClose,
  nextHref,
  nextTitle,
}: {
  challengeId: string;
  onClose: () => void;
  nextHref: string | null;
  nextTitle?: string;
}) {
  const challenge = getChallengeById(challengeId)!;
  const level = LEVELS.find((l) => l.id === challenge.level)!;
  const levelDone = challenge.number === level.challenges.length;
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]">
      <div className="paper-card ink-in w-full max-w-sm p-7 text-center">
        <div className="relative mx-auto grid h-32 w-32 place-items-center">
          {levelDone ? (
            <LevelLogo level={challenge.level} className="h-24 w-24" />
          ) : (
            <Enso animated className="absolute inset-0 h-full w-full" />
          )}
          <Hanko className="stamp-in relative h-16 w-16 text-4xl [animation-delay:350ms]" />
        </div>
        <h2 className="font-display mt-4 text-3xl font-extrabold text-ink">
          {levelDone ? `${level.name}, completado` : "¡Reto superado!"}
        </h2>
        <p className="mt-2 text-ink-2">
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
      </div>
    </div>
  );
}
