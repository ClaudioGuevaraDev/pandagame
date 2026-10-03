/* Web Worker (tipo módulo) que ejecuta Python (Pyodide + pandas) fuera del hilo principal. */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

let ready = null;

async function init(harness) {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage(["pandas"]);
  pyodide.runPython(harness);
  return pyodide;
}

self.onmessage = async (event) => {
  const { id, type } = event.data;
  try {
    if (type === "init") {
      ready = ready || init(event.data.harness);
      await ready;
      self.postMessage({ id, ok: true });
      return;
    }
    const pyodide = await ready;
    if (type === "run") {
      const out = pyodide.globals.get("_pg_run")(event.data.setup, event.data.code);
      self.postMessage({ id, ok: true, data: JSON.parse(out) });
    } else if (type === "test") {
      const out = pyodide.globals.get("_pg_test")(
        event.data.setup,
        event.data.code,
        JSON.stringify(event.data.tests),
      );
      self.postMessage({ id, ok: true, data: JSON.parse(out) });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
