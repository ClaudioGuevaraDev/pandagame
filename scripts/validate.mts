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
import { SCENES } from "../src/content/story/scenes/index.ts";
import { UNLOCKS } from "../src/content/story/unlocks.ts";
import { UNLOCK_ICONS } from "../src/content/story/icons.ts";
import { BACKGROUNDS, CHARACTER_IDS, MOODS, POSES, PROPS } from "../src/content/story/types.ts";
import { mergeProgress, type SyncedProgress } from "../src/lib/cloud/merge.ts";
import { safeNext } from "../src/lib/cloud/safe-next.ts";

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

// Historia: una escena por reto, personajes/fondos válidos y recompensas alcanzables
{
  const has = <T,>(list: readonly T[], v: unknown) => list.includes(v as T);
  const sceneIds = new Set<string>();
  if (SCENES.filter((s) => s.after === null).length !== 1) problems.push("historia: debe haber exactamente un prólogo");
  for (const c of ALL_CHALLENGES) {
    if (!c.mision?.trim()) problems.push(`${c.id}: falta la misión (texto de la historia)`);
    const n = SCENES.filter((s) => s.after === c.id).length;
    if (n !== 1) problems.push(`${c.id}: tiene ${n} escenas después (se espera 1)`);
  }
  for (const s of SCENES) {
    if (sceneIds.has(s.id)) problems.push(`escena ${s.id}: id duplicado`);
    sceneIds.add(s.id);
    const expectedId = s.after === null ? "prologo" : `capitulo-${ALL_CHALLENGES.findIndex((c) => c.id === s.after) + 1}`;
    if (s.id !== expectedId) problems.push(`escena ${s.id}: debería llamarse ${expectedId}`);
    if (s.after !== null && !ids.has(s.after)) problems.push(`escena ${s.id}: reto "${s.after}" no existe`);
    if (!s.panels.length) problems.push(`escena ${s.id}: no tiene viñetas`);
    s.panels.forEach((p, i) => {
      const where = `escena ${s.id} viñeta ${i + 1}`;
      if (!has(BACKGROUNDS, p.bg)) problems.push(`${where}: fondo "${p.bg}" no existe`);
      if (p.prop && !has(PROPS, p.prop.name)) problems.push(`${where}: objeto "${p.prop.name}" no existe`);
      for (const m of p.cast ?? []) {
        if (!has(CHARACTER_IDS, m.who)) problems.push(`${where}: personaje "${m.who}" no existe`);
        if (m.pose && !has(POSES, m.pose)) problems.push(`${where}: pose "${m.pose}" no existe`);
        if (m.mood && !has(MOODS, m.mood)) problems.push(`${where}: expresión "${m.mood}" no existe`);
        if (m.x < 0 || m.x > 100) problems.push(`${where}: x=${m.x} fuera de 0..100`);
      }
      const balloons = p.balloons ?? [];
      if (balloons.length > 2) problems.push(`${where}: más de 2 globos`);
      for (const b of balloons) {
        if (!has(CHARACTER_IDS, b.who)) problems.push(`${where}: globo de "${b.who}" no existe`);
        if (b.text.length > 120) problems.push(`${where}: globo demasiado largo (${b.text.length} > 120)`);
      }
      if ((p.narration?.length ?? 0) > 140) problems.push(`${where}: narración demasiado larga`);
      if (!p.narration && !balloons.length && !p.sfx && !p.cast?.length) problems.push(`${where}: viñeta vacía`);
    });
  }
  const unlockIds = new Set<string>();
  for (const u of UNLOCKS) {
    if (unlockIds.has(u.id)) problems.push(`recompensa ${u.id}: id duplicado`);
    unlockIds.add(u.id);
    if (u.after !== null && !ids.has(u.after)) problems.push(`recompensa ${u.id}: reto "${u.after}" no existe`);
    if (!(u.icon in UNLOCK_ICONS)) problems.push(`recompensa ${u.id}: icono "${u.icon}" no registrado`);
  }
  for (const l of LESSONS)
    if (!UNLOCKS.some((u) => u.lesson === l.slug)) problems.push(`lección ${l.slug}: ninguna recompensa la desbloquea`);
  // Una lección debe estar abierta antes del primer reto que la enlaza.
  for (const c of ALL_CHALLENGES) {
    const u = UNLOCKS.find((x) => x.lesson === c.tutorialLink);
    const idx = (id: string | null) => (id === null ? -1 : ALL_CHALLENGES.findIndex((x) => x.id === id));
    if (u && idx(u.after) >= ALL_CHALLENGES.indexOf(c)) problems.push(`${c.id}: su lección "${c.tutorialLink}" se abre después del reto`);
  }
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
const inputs = py.globals.get("_pg_inputs");

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
  const vars = JSON.parse(inputs(c.setup));
  if (!vars.length) problems.push(`${c.id}: la Lupa («Ver datos») no encuentra datos de entrada`);
  const ran = JSON.parse(run(c.setup, c.solution));
  if (!ran.ok) problems.push(`${c.id}: la solución falla al ejecutarse: ${ran.error}`);
  console.log(`${good.error || failed.length ? "✗" : "✓"} ${c.id} ${c.title}`);
}

// Sincronización con la nube: la fusión no pierde progreso de ningún lado
{
  const empty: SyncedProgress = {
    completed: {}, attempts: {}, code: {}, tutorialRead: {}, scenesSeen: {}, hintsUsed: {}, journalSeen: 0, comicAutoplay: true,
  };
  const local: SyncedProgress = {
    ...empty,
    completed: { a: { at: "2026-02-01T00:00:00Z", attempts: 3 }, b: { at: "2026-01-01T00:00:00Z", attempts: 1 } },
    attempts: { a: 3, b: 1 },
    code: { a: "local" },
    tutorialRead: { x: true },
    hintsUsed: { a: 1 },
    journalSeen: 2,
    comicAutoplay: false,
  };
  const remote: Partial<SyncedProgress> = {
    completed: { a: { at: "2026-01-15T00:00:00Z", attempts: 2 }, c: { at: "2026-01-20T00:00:00Z", attempts: 4 } },
    attempts: { a: 2, c: 5 },
    code: { a: "remoto", c: "remoto-c" },
    scenesSeen: { prologo: true },
    hintsUsed: { a: 2 },
    journalSeen: 5,
    comicAutoplay: true,
  };
  const m = mergeProgress(local, remote);
  const check = (ok: boolean, what: string) => ok || problems.push(`mergeProgress: ${what}`);
  check(Object.keys(m.completed).sort().join() === "a,b,c", "unión de retos completados");
  check(m.completed.a.at === "2026-01-15T00:00:00Z", "gana la fecha más antigua");
  check(m.attempts.a === 3 && m.attempts.c === 5, "intentos: el máximo");
  check(m.code.a === "local" && m.code.c === "remoto-c", "código: el local tiene prioridad");
  check(m.tutorialRead.x === true && m.scenesSeen.prologo === true, "unión de lecciones y escenas");
  check(m.hintsUsed.a === 2 && m.journalSeen === 5, "pistas y diario: el máximo");
  check(m.comicAutoplay === false, "preferencias locales");
  check(mergeProgress(local, null) === local, "sin datos en la nube queda el local");
  check(safeNext("/jugar?x=1") === "/jugar?x=1", "safeNext acepta rutas internas");
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", null]) check(safeNext(bad) === "/", `safeNext rechaza ${bad}`);
  console.log("· sincronización");
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
