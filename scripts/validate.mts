/**
 * Valida los retos: la solución de referencia debe pasar todos los tests y el
 * código inicial debe fallar al menos uno. Uso:
 *   pnpm validate            # todos los retos
 *   pnpm validate medio      # solo ids que empiecen por "medio"
 */
import { loadPyodide } from "pyodide";
import * as icons from "lucide-react";
import { LEVELS, ALL_CHALLENGES } from "../src/content/challenges/index.ts";
import { LESSONS } from "../src/content/tutorial/index.ts";
import { HARNESS } from "../src/lib/pyodide/harness.ts";

type TestOutput = {
  error: string | null;
  results: { name: string; passed: boolean; message: string | null }[];
};

const filter = process.argv[2] ?? "";
const problems: string[] = [];

// Estructura
const ids = new Set<string>();
for (const level of LEVELS) {
  level.challenges.forEach((c, i) => {
    if (ids.has(c.id)) problems.push(`${c.id}: id duplicado`);
    ids.add(c.id);
    if (c.level !== level.id) problems.push(`${c.id}: level "${c.level}" no coincide con "${level.id}"`);
    if (c.number !== i + 1) problems.push(`${c.id}: number ${c.number}, se esperaba ${i + 1}`);
    if (c.id !== `${level.id}-${c.number}`) problems.push(`${c.id}: id debería ser ${level.id}-${c.number}`);
    if (!(c.icon in icons)) problems.push(`${c.id}: icono "${c.icon}" no existe en lucide-react`);
    if (c.tests.length < 3) problems.push(`${c.id}: tiene menos de 3 tests`);
    if (!filter && c.tutorialLink && !LESSONS.some((l) => l.slug === c.tutorialLink))
      problems.push(`${c.id}: tutorialLink "${c.tutorialLink}" no existe`);
  });
}

const py = await loadPyodide();
await py.loadPackage(["pandas"]);
py.runPython(HARNESS);
const runTests = py.globals.get("_pg_test");
const run = py.globals.get("_pg_run");

function test(setup: string, code: string, tests: unknown): TestOutput {
  return JSON.parse(runTests(setup, code, JSON.stringify(tests)));
}

const selected = ALL_CHALLENGES.filter((c) => c.id.startsWith(filter));
for (const c of selected) {
  const good = test(c.setup, c.solution, c.tests);
  const failed = good.results.filter((r) => !r.passed);
  if (good.error || failed.length) {
    problems.push(
      `${c.id}: la solución NO pasa los tests\n` +
        (good.error ? `    error: ${good.error}\n` : "") +
        failed.map((r) => `    ✗ ${r.name}: ${r.message}`).join("\n"),
    );
  }
  const bad = test(c.setup, c.starterCode, c.tests);
  if (!bad.error && bad.results.every((r) => r.passed)) {
    problems.push(`${c.id}: el código inicial pasa todos los tests`);
  }
  const ran = JSON.parse(run(c.setup, c.solution));
  if (!ran.ok) problems.push(`${c.id}: la solución falla al ejecutarse: ${ran.error}`);
  console.log(`${good.error || failed.length ? "✗" : "✓"} ${c.id} ${c.title}`);
}

// Snippets del tutorial: deben ejecutarse sin error
for (const lesson of LESSONS.filter((l) => !filter || l.slug.startsWith(filter) || filter === "tutorial")) {
  lesson.blocks.forEach((b, i) => {
    if (b.type !== "code") return;
    const ran = JSON.parse(run("", b.code));
    if (!ran.ok) problems.push(`tutorial/${lesson.slug} bloque ${i}: ${ran.error}`);
  });
  console.log(`· tutorial/${lesson.slug}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n` + problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log(`\nTodo OK: ${selected.length} retos validados.`);
