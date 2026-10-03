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
import { LevelLogo } from "@/components/icons/Logos";
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
    return <div className="flex flex-1 items-center justify-center text-zinc-500">Cargando reto…</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Barra superior */}
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800/80 px-3 py-2">
        <Link
          href="/jugar"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          title="Volver al mapa"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <LevelLogo level={challenge.level} className="h-8 w-8 shrink-0" />
        <div className="min-w-0">
          <p className={`truncate text-[11px] font-black uppercase tracking-wider ${theme.text}`}>
            {level.name} · Reto {challenge.number}/{level.challenges.length}
          </p>
          <h1 className="flex items-center gap-1.5 truncate font-black text-zinc-50">
            <ChallengeIcon name={challenge.icon} className={`h-4 w-4 shrink-0 ${theme.text}`} />
            {challenge.title}
            {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />}
          </h1>
        </div>
        <div className="ml-auto hidden xl:block">
          <MiniMap activeId={challengeId} />
        </div>
        <div className="ml-auto hidden sm:block xl:ml-4">
          <PyodideStatus />
        </div>
      </div>

      {/* Pestañas móvil */}
      <div className="flex shrink-0 border-b border-zinc-800 lg:hidden">
        {(["reto", "codigo", "resultado"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-sm font-bold capitalize ${
              mobileTab === t ? `border-b-2 ${theme.border} text-zinc-50` : "text-zinc-500"
            }`}
          >
            {t === "codigo" ? "Código" : t}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,2fr)_3fr]">
        {/* Enunciado */}
        <aside
          className={`${mobileTab === "reto" ? "flex" : "hidden"} min-h-0 flex-col overflow-y-auto border-zinc-800 p-5 scrollbar-thin lg:flex lg:border-r`}
        >
          <span
            className={`mb-3 w-fit rounded-full ${theme.bgSoft} px-2.5 py-0.5 text-xs font-bold ${theme.text}`}
          >
            {challenge.topic}
          </span>
          <Markdown>{challenge.description}</Markdown>

          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-zinc-300">
              <FlaskConical className="h-4 w-4" /> Tests a superar ({challenge.tests.length})
            </h3>
            <ul className="space-y-1 text-sm text-zinc-400">
              {challenge.tests.map((t, i) => {
                const r = testRun?.results[i];
                return (
                  <li key={t.name} className="flex items-start gap-2">
                    {!r ? (
                      <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                    ) : r.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    )}
                    {t.name}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            {challenge.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <Markdown className="text-amber-100">{`**Pista ${i + 1}:** ${h}`}</Markdown>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {hintsShown < challenge.hints.length && (
                <button
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 px-3 py-1.5 text-sm font-bold text-amber-300 hover:bg-amber-500/10"
                >
                  <Lightbulb className="h-4 w-4" /> {hintsShown ? "Otra pista" : "Ver pista"}
                </button>
              )}
              {challenge.tutorialLink && (
                <Link
                  href={`/tutorial/${challenge.tutorialLink}`}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-800"
                >
                  <BookOpen className="h-4 w-4" /> Repasar en el tutorial
                </Link>
              )}
              {canSeeSolution && (
                <button
                  onClick={showSolution}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-800"
                >
                  <KeyRound className="h-4 w-4" /> Ver solución
                </button>
              )}
            </div>
            {!canSeeSolution && attempts > 0 && (
              <p className="text-xs text-zinc-500">
                La solución se desbloquea tras {SOLUTION_AFTER_ATTEMPTS} intentos ({attempts}/
                {SOLUTION_AFTER_ATTEMPTS}).
              </p>
            )}
          </div>
        </aside>

        {/* Editor + resultados */}
        <section
          className={`${mobileTab === "reto" ? "hidden" : "flex"} min-h-0 flex-col lg:flex`}
        >
          <div className={`${mobileTab === "codigo" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}>
            <div className="min-h-0 flex-1">
              <CodeEditor value={code} onChange={onChange} onRun={run} onTest={test} />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-y border-zinc-800 bg-zinc-950 px-3 py-2">
              <button
                onClick={run}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-900 shadow-[0_4px_0_0_#71717a] transition hover:bg-white active:translate-y-1 active:shadow-none disabled:opacity-50"
                title="Ctrl+Enter"
              >
                <Play className="h-4 w-4 fill-current" /> Ejecutar
              </button>
              <button
                onClick={test}
                disabled={busy}
                className={`flex items-center gap-1.5 rounded-xl ${theme.bg} px-4 py-2 text-sm font-black text-white ${theme.shadow} transition hover:brightness-110 active:translate-y-1 active:shadow-none disabled:opacity-50`}
                title="Ctrl+Shift+Enter"
              >
                <FlaskConical className="h-4 w-4" /> Correr tests
              </button>
              <button
                onClick={restore}
                className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                title="Restaurar código inicial"
              >
                <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Restaurar</span>
              </button>
            </div>
          </div>

          <div
            className={`${mobileTab === "resultado" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex lg:h-[40%] lg:flex-none`}
          >
            <div className="flex shrink-0 gap-1 px-3 pt-2">
              {(["salida", "tests"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOutputTab(t)}
                  className={`rounded-lg px-3 py-1 text-sm font-bold capitalize ${
                    outputTab === t ? "bg-zinc-800 text-zinc-50" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {t}
                  {t === "tests" && testRun && (
                    <span
                      className={`ml-1.5 tabular-nums ${passedCount === challenge.tests.length ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {passedCount}/{challenge.tests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3 scrollbar-thin">
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
  if (error) return <pre className="whitespace-pre-wrap font-mono text-sm text-red-400">{error}</pre>;
  if (!run)
    return (
      <p className="text-sm text-zinc-500">
        Pulsa <b>Correr tests</b> (Ctrl+Shift+Enter) para comprobar tu solución. Debes pasar los {total}{" "}
        tests para completar el reto.
      </p>
    );
  return (
    <div className="space-y-2">
      {run.error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-500/30 bg-red-500/10 p-3 font-mono text-sm text-red-300">
          {run.error}
        </pre>
      )}
      {run.results.map((r) => (
        <div
          key={r.name}
          className={`rounded-xl border p-3 ${r.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}
        >
          <p className="flex items-center gap-2 text-sm font-bold">
            {r.passed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            {r.name}
          </p>
          {r.message && (
            <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs text-zinc-300 scrollbar-thin">
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
  const theme = LEVEL_THEME[challenge.level];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-700 bg-zinc-900 p-6 text-center shadow-2xl">
        {levelDone ? (
          <LevelLogo level={challenge.level} className="animate-float mx-auto h-24 w-24" />
        ) : (
          <div
            className={`animate-float mx-auto flex h-20 w-20 items-center justify-center rounded-full ${theme.bg} ${theme.shadow}`}
          >
            <ChallengeIcon name={challenge.icon} className="h-10 w-10 text-white" />
          </div>
        )}
        <h2 className="mt-5 text-2xl font-black text-zinc-50">
          {levelDone ? `¡${level.name} completado!` : "¡Reto superado!"}
        </h2>
        <p className="mt-1 text-zinc-400">
          {levelDone && nextLevel
            ? `Desbloqueaste el nivel ${nextLevel.difficulty}: ${nextLevel.name}.`
            : levelDone
              ? "¡Eres un Maestro Panda! Completaste todos los retos. 🐼"
              : `Pasaste todos los tests de “${challenge.title}”.`}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {nextHref && (
            <Link
              href={nextHref}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-emerald-950 shadow-[0_6px_0_0_#047857] transition hover:bg-emerald-400 active:translate-y-1 active:shadow-none"
            >
              Siguiente: {nextTitle}
            </Link>
          )}
          <Link href="/jugar" className="rounded-2xl px-5 py-2.5 font-bold text-zinc-300 hover:bg-zinc-800">
            Ver mapa
          </Link>
          <button onClick={onClose} className="text-sm font-bold text-zinc-500 hover:text-zinc-300">
            Quedarme aquí
          </button>
        </div>
      </div>
    </div>
  );
}
