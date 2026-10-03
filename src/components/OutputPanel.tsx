import type { RunResult } from "@/lib/pyodide/runner";

export function OutputPanel({ result, error }: { result: RunResult | null; error?: string | null }) {
  if (error) {
    return <pre className="whitespace-pre-wrap font-mono text-sm text-red-400">{error}</pre>;
  }
  if (!result) {
    return (
      <p className="text-sm text-zinc-500">
        Pulsa <b>Ejecutar</b> (Ctrl+Enter) para ver la salida. Si la última línea es un DataFrame o una
        Series, se mostrará como tabla.
      </p>
    );
  }
  const empty = !result.stdout && !result.error && !result.html && !result.repr;
  return (
    <div className="space-y-3">
      {result.stdout && (
        <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-200">{result.stdout}</pre>
      )}
      {result.html && (
        <div
          className="df-output overflow-x-auto scrollbar-thin"
          dangerouslySetInnerHTML={{ __html: result.html }}
        />
      )}
      {result.repr && <pre className="whitespace-pre-wrap font-mono text-sm text-amber-200">{result.repr}</pre>}
      {result.error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-500/30 bg-red-500/10 p-3 font-mono text-sm text-red-300">
          {result.error}
        </pre>
      )}
      {empty && <p className="text-sm text-zinc-500">El código se ejecutó sin salida.</p>}
    </div>
  );
}
