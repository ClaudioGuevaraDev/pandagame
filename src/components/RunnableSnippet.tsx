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
    <div className="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-3 py-1.5">
        <span className="truncate text-xs font-bold text-zinc-400">{title ?? "Pruébalo"}</span>
        {code !== initial && (
          <button
            onClick={() => setCode(initial)}
            className="ml-auto rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            title="Restaurar"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={run}
          disabled={busy}
          className={`${code !== initial ? "" : "ml-auto"} flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-black text-emerald-950 hover:bg-emerald-400 disabled:opacity-50`}
          title="Ctrl+Enter"
        >
          <Play className="h-3 w-3 fill-current" /> {busy ? "Ejecutando…" : "Ejecutar"}
        </button>
      </div>
      <CodeEditor value={code} onChange={setCode} onRun={run} autoHeight />
      {(result || error) && (
        <div className="max-h-96 overflow-auto border-t border-zinc-800 bg-[#0f1115] p-3 scrollbar-thin">
          <OutputPanel result={result} error={error} />
        </div>
      )}
    </div>
  );
}
