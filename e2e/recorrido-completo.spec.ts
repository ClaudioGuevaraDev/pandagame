import { expect, test, type Page } from "@playwright/test";
import { getScene } from "../src/content/story/scenes/index.ts";
import { ALL_CHALLENGES, challengeHref, headerCount, runTests, setEditorCode, successDialog, waitForPython } from "./helpers";

/** Lee una escena entera con "Siguiente" (sin saltarla) y vuelve al juego. */
async function readScene(page: Page, id: string) {
  await expect(page).toHaveURL(`/historia/${id}`);
  const scene = getScene(id)!;
  for (let i = 0; i < scene.panels.length; i++) {
    await expect(page.locator(".comic-panel").last()).toBeVisible();
    await page.getByRole("button", { name: /^(Siguiente viñeta|Terminar escena)$/ }).click();
  }
  await expect(page.getByText("Fin de la escena.")).toBeAttached();
}

// Recorrido completo: el prólogo, los 30 retos y sus 30 escenas en orden desde
// la interfaz. Se corre con pnpm test:e2e:full.
test("resuelve los 30 retos y toda la historia desde el inicio @full", async ({ page }) => {
  test.setTimeout(30 * 60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("link", { name: "Jugar" }).click();
  await readScene(page, "prologo");
  await page.getByRole("link", { name: /^Reto 1 · / }).click();

  for (const [i, c] of ALL_CHALLENGES.entries()) {
    await test.step(`${i + 1}. ${c.id} ${c.title}`, async () => {
      await expect(page).toHaveURL(challengeHref(c));
      await waitForPython(page);

      // Primero falla con el código inicial…
      const fail = await runTests(page);
      expect(fail.passed, `${c.id}: el código inicial no debe pasar todo`).toBeLessThan(fail.total);

      // …y luego pasa con la solución.
      await setEditorCode(page, c.solution);
      const ok = await runTests(page);
      expect(ok.passed, `${c.id}: la solución debe pasar todo`).toBe(ok.total);

      const dialog = successDialog(page);
      await expect(dialog).toBeVisible();
      const isLast = i === ALL_CHALLENGES.length - 1;
      const levelEnd = ALL_CHALLENGES[i + 1]?.level !== c.level;
      if (levelEnd) await expect(dialog.getByRole("heading")).toContainText("completado");
      else await expect(dialog.getByRole("heading")).toHaveText("¡Reto superado!");

      if (isLast) await expect(dialog).toContainText("Eres un Maestro Panda");
      await dialog.getByRole("link", { name: "Continuar la historia" }).click();
      await readScene(page, `capitulo-${i + 1}`);
      if (isLast) {
        await expect(page.getByText("Has completado la historia.")).toBeVisible();
        await page.locator("#main").getByRole("link", { name: "Mapa", exact: true }).click();
      } else {
        await page.getByRole("link", { name: `Reto ${i + 2} · ${ALL_CHALLENGES[i + 1].title}` }).click();
      }
    });
  }

  await expect(page).toHaveURL("/jugar");
  await expect.poll(() => headerCount(page)).toBe("30/30");
  await expect(page.getByRole("link", { name: /\(completado\)/ })).toHaveCount(30);
  await page.goto("/");
  await expect(page.getByText("Has completado todos los retos. Maestro Panda.")).toBeVisible();

  // Diario: todos los objetos, las 31 escenas vistas y los logros de la historia.
  await page.goto("/diario");
  await expect(page.getByRole("tab", { name: /^Objetos (\d+)\/\1$/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /^Escenas 31\/31$/ })).toBeVisible();
  await page.getByRole("tab", { name: /^Logros/ }).click();
  for (const name of ["Maestro Panda", "Lector de cómics", "Coleccionista", "Sin pergaminos"])
    await expect(page.locator("#diario-panel-logros li", { hasText: name })).toContainText("(conseguido)");
});
