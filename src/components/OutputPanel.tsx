import type { RunResult } from "@/lib/pyodide/runner";

export function OutputPanel({ result, error }: { result: RunResult | null; error?: string | null }) {
  if (error) {
    return <pre className="whitespace-pre-wrap font-mono text-sm text-seal-ink">{error}</pre>;
  }
  if (!result) {
    return (
      <p className="text-sm text-ink-3">
        Pulsa <b className="text-ink">Ejecutar</b> para ver la salida. Si la última línea es un DataFrame o una Series,
        se mostrará como tabla.
      </p>
    );
  }
  const empty = !result.stdout && !result.error && !result.html && !result.repr;
  return (
    <div className="space-y-3">
      {result.stdout && <pre className="whitespace-pre-wrap font-mono text-sm text-ink">{result.stdout}</pre>}
      {result.html && (
        <div className="df-output overflow-x-auto scrollbar-thin" dangerouslySetInnerHTML={{ __html: result.html }} />
      )}
      {result.repr && <pre className="whitespace-pre-wrap font-mono text-sm text-river">{result.repr}</pre>}
      {result.error && (
        <pre className="whitespace-pre-wrap border-l-[3px] border-seal bg-seal/5 p-3 font-mono text-sm text-seal-dark">
          {result.error}
        </pre>
      )}
      {empty && <p className="text-sm text-ink-3">El código se ejecutó sin salida.</p>}
    </div>
  );
}
