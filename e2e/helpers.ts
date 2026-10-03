import { expect, type Locator, type Page } from "@playwright/test";
import { ALL_CHALLENGES, LEVELS, challengeHref, getChallengeById } from "../src/content/challenges/index.ts";
import type { Challenge } from "../src/content/types.ts";

export { ALL_CHALLENGES, LEVELS, challengeHref, getChallengeById };
export type { Challenge };

export const STORAGE_KEY = "pandagame-progress";

export type Progress = {
  completed?: string[];
  attempts?: Record<string, number>;
  code?: Record<string, string>;
  tutorialRead?: string[];
  scenesSeen?: string[];
  hintsUsed?: Record<string, number>;
  version?: number;
};

/** Ids de los primeros `n` retos en orden de juego. */
export const firstIds = (n: number) => ALL_CHALLENGES.slice(0, n).map((c) => c.id);

export const challenge = (id: string): Challenge => {
  const c = getChallengeById(id);
  if (!c) throw new Error(`Reto inexistente: ${id}`);
  return c;
};

/**
 * Escribe el progreso en localStorage antes de que cargue la app (para cada
 * navegación de la página). Úsalo antes del primer page.goto.
 */
export async function seedProgress(page: Page, p: Progress) {
  const value = JSON.stringify({
    state: {
      completed: Object.fromEntries((p.completed ?? []).map((id) => [id, { at: "2026-01-01T00:00:00.000Z", attempts: 1 }])),
      attempts: p.attempts ?? {},
      code: p.code ?? {},
      tutorialRead: Object.fromEntries((p.tutorialRead ?? []).map((s) => [s, true])),
      scenesSeen: Object.fromEntries((p.scenesSeen ?? []).map((s) => [s, true])),
      hintsUsed: p.hintsUsed ?? {},
      journalSeen: 0,
    },
    // Sin escenas explícitas se siembra como v2: la migración a v3 marca como vistas
    // las escenas de lo completado (así los tests de retos no pasan por la historia).
    version: p.version ?? (p.scenesSeen ? 3 : 2),
  });
  await page.addInitScript(
    ([key, v]) => {
      // Solo la primera vez en esta pestaña: así los cambios del propio test sobreviven a recargas.
      if (!sessionStorage.getItem("__seeded")) {
        localStorage.setItem(key, v);
        sessionStorage.setItem("__seeded", "1");
      }
    },
    [STORAGE_KEY, value] as const,
  );
}

type StoredProgress = {
  state: {
    completed: Record<string, unknown>;
    attempts: Record<string, number>;
    code: Record<string, string>;
    tutorialRead: Record<string, boolean>;
    scenesSeen: Record<string, boolean>;
    hintsUsed: Record<string, number>;
    journalSeen: number;
  };
  version: number;
} | null;

export async function readProgress(page: Page): Promise<StoredProgress> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

/** Espera a que Pyodide + pandas estén listos en la página del reto. */
export async function waitForPython(page: Page) {
  // Se lee el texto del indicador aunque esté oculto (en móvil no se muestra).
  await page.waitForFunction(
    () => [...document.querySelectorAll("[role=status]")].some((el) => el.textContent?.includes("Python listo")),
    undefined,
    { timeout: 150_000 },
  );
}

/** Espera a que Monaco esté montado y su modelo disponible. */
export async function waitForEditor(page: Page) {
  await page.locator(".monaco-editor .view-lines").first().waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => {
    const m = (window as unknown as { monaco?: { editor: { getModels(): { isDisposed(): boolean }[] } } }).monaco;
    return !!m && m.editor.getModels().some((x) => !x.isDisposed());
  });
}

type MonacoWindow = {
  monaco: { editor: { getModels(): { isDisposed(): boolean; getValue(): string; setValue(v: string): void }[] } };
};

/** Reemplaza el código del editor (como si el usuario lo hubiera escrito). */
export async function setEditorCode(page: Page, code: string) {
  await waitForEditor(page);
  await page.evaluate((c) => {
    const models = (window as unknown as MonacoWindow).monaco.editor.getModels().filter((m) => !m.isDisposed());
    models[models.length - 1].setValue(c);
  }, code);
}

export async function getEditorCode(page: Page): Promise<string> {
  await waitForEditor(page);
  return page.evaluate(() => {
    const models = (window as unknown as MonacoWindow).monaco.editor.getModels().filter((m) => !m.isDisposed());
    return models[models.length - 1].getValue();
  });
}

/**
 * Escribe con el teclado real al final del código. Espera a que termine la carga
 * pesada (Python listo, si la página lo muestra) y verifica que el texto llegó.
 */
export async function typeInEditor(page: Page, text: string) {
  await waitForEditor(page);
  const onChallenge = await page.evaluate(() =>
    [...document.querySelectorAll("[role=status]")].some((el) => el.textContent?.includes("Python")),
  );
  if (onChallenge) await waitForPython(page);
  const before = await getEditorCode(page);
  await page.locator(".monaco-editor .view-lines").first().click();
  await expect(page.locator(".monaco-editor.focused").first()).toBeVisible();
  await page.keyboard.press("Control+End");
  await page.keyboard.type(text, { delay: 25 });
  const typed = text.trim().split("\n").pop() ?? text;
  await expect.poll(() => getEditorCode(page), { message: "el texto debe llegar al editor" }).not.toBe(before);
  await expect.poll(() => getEditorCode(page)).toContain(typed);
}

/** Panel del enunciado (en móvil es una pestaña). */
export const statementPanel = (page: Page) => page.locator("#m-panel-reto");

export const runButton = (page: Page) => page.getByRole("button", { name: "Ejecutar", exact: true });
export const testButton = (page: Page) => page.getByRole("button", { name: "Correr tests" });
export const outputTab = (page: Page) => page.getByRole("tab", { name: /^Salida/ });
export const testsTab = (page: Page) => page.getByRole("tab", { name: /^Tests/ });
export const outputPanel = (page: Page) => page.locator("#out-panel-salida");
export const testsPanel = (page: Page) => page.locator("#out-panel-tests");

/** Corre los tests y devuelve el contador "pasados/total". */
export async function runTests(page: Page): Promise<{ passed: number; total: number }> {
  await testButton(page).click();
  await expect(testButton(page)).toBeEnabled({ timeout: 60_000 });
  const text = await testsTab(page).innerText();
  const m = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) throw new Error(`Sin contador de tests: "${text}"`);
  return { passed: Number(m[1]), total: Number(m[2]) };
}

export async function runCode(page: Page) {
  await runButton(page).click();
  await expect(runButton(page)).toBeEnabled({ timeout: 60_000 });
}

export const successDialog = (page: Page): Locator => page.getByRole("dialog");

/** Abre un reto, escribe su solución, corre los tests y espera el modal de éxito. */
export async function solveChallenge(page: Page, c: Challenge, { navigate = true } = {}) {
  if (navigate) await page.goto(challengeHref(c));
  await waitForPython(page);
  await setEditorCode(page, c.solution);
  const r = await runTests(page);
  expect(r.passed, `${c.id}: tests superados`).toBe(r.total);
  await expect(successDialog(page)).toBeVisible();
}

/** Contador "X/30" del header. */
export async function headerCount(page: Page): Promise<string> {
  const text = await page.locator("header").getByText(/\d+\s*\/\s*30|–\s*\/\s*30/).first().innerText();
  return text.replace(/\s+/g, "");
}

export const levelOf = (id: string) => LEVELS.find((l) => l.challenges.some((c) => c.id === id))!;

/** Espera a que terminen las animaciones finitas (entradas con fundido, sellos…). */
export async function waitForAnimations(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.getTiming().iterations !== Infinity)
      .every((a) => a.playState !== "running" && !a.pending),
  );
}
