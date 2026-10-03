import { expect, test } from "@playwright/test";
import { LESSONS } from "../src/content/tutorial/index.ts";
import { challengeHref, firstIds, getChallengeById, getEditorCode, readProgress, seedProgress, waitForEditor } from "./helpers";

const lessonNav = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "Módulos del tutorial" });

test.describe("Tutorial @mobile", () => {
  test("el índice lista las 10 lecciones con la introducción primero", async ({ page }) => {
    await page.goto("/tutorial");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tutorial");
    await expect(page.locator("main ol > li")).toHaveCount(LESSONS.length);
    // Al empezar solo están abiertas la introducción y Fundamentos; el resto llega con la historia.
    const items = page.locator("main ol li a");
    await expect(items).toHaveCount(2);
    await expect(page.locator("main ol > li", { hasText: "(bloqueada" })).toHaveCount(LESSONS.length - 2);
    await expect(items.first()).toContainText("〇");
    await expect(items.first()).toContainText("Cómo funcionan los retos");
    await page.getByRole("link", { name: /Empezar por el principio/ }).click();
    await expect(page).toHaveURL("/tutorial/como-funcionan-los-retos");
  });

  test("se puede recorrer con anterior / siguiente", async ({ page }) => {
    await page.goto(`/tutorial/${LESSONS[1].slug}`);
    const pager = page.getByRole("navigation", { name: "Lección anterior y siguiente" });
    await pager.getByRole("link", { name: LESSONS[2].title }).click();
    await expect(page).toHaveURL(`/tutorial/${LESSONS[2].slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LESSONS[2].title);
    await page.getByRole("navigation", { name: "Lección anterior y siguiente" }).getByRole("link", { name: LESSONS[1].title }).click();
    await expect(page).toHaveURL(`/tutorial/${LESSONS[1].slug}`);
  });

  test("los retos relacionados enlazan al juego", async ({ page }) => {
    const lesson = LESSONS.find((l) => l.relatedChallenges?.length)!;
    await page.goto(`/tutorial/${lesson.slug}`);
    const first = getChallengeById(lesson.relatedChallenges![0])!;
    await expect(page.getByRole("link", { name: first.title, exact: true })).toHaveAttribute("href", challengeHref(first));
  });
});

test.describe("Ejemplos ejecutables", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("muestran código resaltado sin montar Monaco hasta editar", async ({ page }) => {
    await page.goto("/tutorial/fundamentos");
    await expect(page.locator(".snippet-preview").first()).toBeVisible();
    await expect(page.locator(".monaco-editor")).toHaveCount(0);
    await page.getByRole("button", { name: "Editar" }).first().click();
    await waitForEditor(page);
    await expect(page.locator(".monaco-editor")).toHaveCount(1);
  });

  test("Ejecutar muestra la salida", async ({ page }) => {
    await page.goto("/tutorial/fundamentos");
    await page.getByRole("button", { name: "Ejecutar" }).first().click();
    const card = page.locator(".paper-card").filter({ has: page.getByRole("button", { name: "Ejecutar" }) }).first();
    await expect(card.locator(".df-output, pre").last()).toBeVisible({ timeout: 150_000 });
    await expect(card.getByText(/Error/)).toHaveCount(0);
  });

  test("en el tutorial sí se puede pegar", async ({ page }) => {
    await page.goto("/tutorial/fundamentos");
    await page.getByRole("button", { name: "Editar" }).first().click();
    await waitForEditor(page);
    await page.evaluate(() => navigator.clipboard.writeText("\nPEGADO_EN_TUTORIAL = 1"));
    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Control+V");
    await expect.poll(() => getEditorCode(page)).toContain("PEGADO_EN_TUTORIAL");
    await expect(page.getByText(/Pegar está desactivado/)).toHaveCount(0);
  });
});

test("la lección se marca como leída al llegar al final", async ({ page }) => {
  await seedProgress(page, { completed: firstIds(2) });
  await page.goto("/tutorial/seleccion");
  await expect(lessonNav(page).locator(".hanko")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Lección anterior y siguiente" }).scrollIntoViewIfNeeded();
  await expect.poll(async () => (await readProgress(page))?.state.tutorialRead.seleccion).toBe(true);
  await expect(lessonNav(page).getByRole("link", { name: /Selección/ }).locator(".hanko")).toHaveCount(1);
  await page.reload();
  await expect(lessonNav(page).getByRole("link", { name: /Selección/ }).locator(".hanko")).toHaveCount(1);
});

test("la lección 〇 explica todos los controles y no menciona Ver solución", async ({ page }) => {
  await page.goto("/tutorial/como-funcionan-los-retos");
  await expect(page.getByText("Introducción", { exact: true })).toBeVisible();
  const guide = page.locator("article dl");
  for (const name of [
    "Ejecutar",
    "Correr tests",
    "Restaurar",
    "Ver pista",
    "Repasar en el tutorial",
    "Volver al mapa",
    "Pestañas Salida y Tests",
    "Estado de Python",
    "Mini-mapa",
    "Ver datos",
    "Misión",
    "Continuar la historia",
    "Catalejo",
    "Diario de Bao",
    "Borrar todo el progreso",
  ]) {
    await expect(guide.locator("dt .sr-only", { hasText: new RegExp(`^${name}$`) })).toHaveCount(1);
  }
  await expect(page.getByText("Ver solución")).toHaveCount(0);
  await expect(guide.locator("kbd", { hasText: "Ctrl + Enter" })).toBeVisible();
});
