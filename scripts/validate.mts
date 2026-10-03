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

// Solapes con el tutorial: ningún reto debe resolverse copiando un ejemplo.
const squash = (t: string) => t.replace(/\s+/g, "");
const tutorialBlocks = LESSONS.flatMap((l) =>
  l.blocks.flatMap((b, i) => {
    const codes =
      b.type === "code"
        ? [b.code]
        : b.type === "markdown"
          ? [...b.content.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1])
          : [];
    return codes.map((code) => ({ where: `${l.slug}#${i}`, code, squashed: squash(code) }));
  }),
);
/** Valores literales de cadena (no claves de diccionario ni nombres genéricos) de un código Python. */
const stringValues = (code: string) =>
  new Set(
    [...code.matchAll(/"([^"\\\n]*)"(\s*:)?|'([^'\\\n]*)'(\s*:)?/g)]
      .filter((m) => !m[2] && !m[4]) // descarta claves: "col": ...
      .map((m) => m[1] ?? m[3])
      .filter((v) => v.length >= 2 && !/^[a-z_]+$/.test(v)), // descarta nombres de columna/parámetros
  );
for (const c of ALL_CHALLENGES) {
  if (filter && !c.id.startsWith(filter)) continue;
  for (const raw of c.solution.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim().replace(/^return\s+/, "");
    if (/^(import|from|def)\b/.test(line) || /^resolver\(/.test(line)) continue;
    const sq = squash(line);
    // Solo líneas con datos propios (un literal de cadena) y de cierto tamaño:
    // expresiones genéricas como .reset_index(drop=True) no cuentan como copia.
    if (sq.length < 26 || !/["']/.test(line)) continue;
    const hit = tutorialBlocks.find((b) => b.squashed.includes(sq));
    if (hit) problems.push(`${c.id}: la línea de la solución «${line}» aparece en el tutorial (${hit.where})`);
  }
  const values = stringValues(c.setup);
  for (const b of tutorialBlocks) {
    const shared = [...stringValues(b.code)].filter((v) => values.has(v));
    if (shared.length >= 3)
      problems.push(`${c.id}: los datos comparten ${shared.length} valores con el tutorial (${b.where}): ${shared.slice(0, 5).join(", ")}`);
  }
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
