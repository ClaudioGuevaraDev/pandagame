"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Pencil, Play, RotateCcw } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ensureRunner, runCode, type RunResult } from "@/lib/pyodide/runner";

/**
 * Ejemplo ejecutable del tutorial. Muestra el código como texto y solo monta
 * Monaco cuando el usuario quiere editarlo: una lección tiene 7–13 ejemplos y
 * montar todos los editores a la vez es costoso en memoria.
 */
export function RunnableSnippet({
  code: initial,
  title,
  preview,
}: {
  code: string;
  title?: string;
  /** Código ya resaltado en el servidor, mostrado hasta que el usuario edite. */
  preview?: ReactNode;
}) {
  const [code, setCode] = useState(initial);
  const [editing, setEditing] = useState(false);
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

  const lines = code.split("\n");


  return (
    <div className="paper-card my-6 overflow-hidden rounded-[6px_12px_8px_10px] shadow-[4px_5px_0_0_var(--ink)]">
      <div className="flex items-center gap-2 border-b-2 border-ink bg-paper-2/70 px-3 py-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-seal" aria-hidden="true" />
        <span className="truncate text-xs font-bold tracking-wide text-ink-2">{title ?? "Pruébalo"}</span>
        <div className="ml-auto flex items-center gap-1">
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost px-2 py-0.5 text-xs">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
          )}
          {code !== initial && (
            <button onClick={() => setCode(initial)} className="btn-ghost p-1" title="Restaurar" aria-label="Restaurar ejemplo">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={run}
            disabled={busy}
            className="btn btn-ink border-[1.5px] px-2.5 py-0.5 text-xs shadow-hand-seal"
            aria-keyshortcuts="Control+Enter"
          >
            <Play className="h-3 w-3 fill-current" /> {busy ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
      </div>

      {editing ? (
        <CodeEditor value={code} onChange={setCode} onRun={run} autoHeight ariaLabel={`Editor: ${title ?? "ejemplo"}`} />
      ) : preview ? (
        <div onDoubleClick={() => setEditing(true)} className="cursor-text">
          {preview}
        </div>
      ) : (
        <pre
          className="cursor-text overflow-x-auto bg-editor py-3 font-mono text-[15px] font-medium leading-[22px] text-editor-fg scrollbar-thin"
          onDoubleClick={() => setEditing(true)}
        >
          <code>
            {lines.map((line, i) => (
              <span key={i} className="flex">
                <span className="w-10 shrink-0 select-none pr-4 text-right text-editor-fg/45" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      )}

      <div aria-live="polite">
        {(result || error) && (
          <div className="max-h-96 overflow-auto border-t-2 border-dashed border-rule bg-paper p-3 scrollbar-thin">
            <OutputPanel result={result} error={error} />
          </div>
        )}
      </div>
    </div>
  );
}
