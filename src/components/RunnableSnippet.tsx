"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ensureRunner, runCode, type RunResult } from "@/lib/pyodide/runner";

export function RunnableSnippet({ code: initial, title }: { code: string; title?: string }) {
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureRunner().catch(() => {});
  }, []);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await runCode(code));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="paper-card my-6 overflow-hidden !rounded-[6px_12px_8px_10px] !shadow-[4px_5px_0_0_#1d1b18]">
      <div className="flex items-center gap-2 border-b-2 border-ink bg-paper-2/70 px-3 py-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-seal" aria-hidden="true" />
        <span className="truncate text-xs font-bold tracking-wide text-ink-2">{title ?? "Pruébalo"}</span>
        {code !== initial && (
          <button onClick={() => setCode(initial)} className="btn-ghost ml-auto p-1" title="Restaurar" aria-label="Restaurar">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={run}
          disabled={busy}
          className={`${code !== initial ? "" : "ml-auto"} btn btn-ink !border-[1.5px] px-2.5 py-0.5 text-xs !shadow-[2px_2px_0_0_#c23a22]`}
          title="Ctrl+Enter"
        >
          <Play className="h-3 w-3 fill-current" /> {busy ? "Ejecutando…" : "Ejecutar"}
        </button>
      </div>
      <CodeEditor value={code} onChange={setCode} onRun={run} autoHeight />
      {(result || error) && (
        <div className="max-h-96 overflow-auto border-t-2 border-dashed border-rule bg-paper p-3 scrollbar-thin">
          <OutputPanel result={result} error={error} />
        </div>
      )}
    </div>
  );
}
