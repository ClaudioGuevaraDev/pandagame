import { expect, test } from "@playwright/test";
import { firstIds, readProgress, seedProgress } from "./helpers";

const diarioLink = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: /Diario/ });

test.describe("Diario de Bao @mobile", () => {
  test("avisa de recompensas nuevas hasta que se abre", async ({ page }) => {
    await page.goto("/");
    await expect(diarioLink(page)).toContainText("hay recompensas nuevas");
    await diarioLink(page).click();
    await expect(page).toHaveURL("/diario");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diario de Bao");
    await expect(diarioLink(page)).not.toContainText("hay recompensas nuevas");
    await expect.poll(async () => (await readProgress(page))?.state.journalSeen).toBe(1);
  });

  test("lista los objetos obtenidos y los que faltan", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(12) });
    await page.goto("/diario");
    const objetos = page.locator("#diario-panel-objetos");
    await expect(page.getByRole("tab", { name: /^Objetos 9\// })).toHaveAttribute("aria-selected", "true");
    await expect(objetos.getByText("Lupa de Bao")).toBeVisible();
    await expect(objetos.getByText("Catalejo")).toHaveCount(0);
    await expect(objetos.getByText("Se obtiene tras el reto 15 · Transformar.")).toBeVisible();
  });

  test("logros y escenas", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(10) });
    await page.goto("/diario");
    await page.getByRole("tab", { name: /^Logros/ }).click();
    const logros = page.locator("#diario-panel-logros");
    await expect(logros.getByText("Guardián del bosque")).toBeVisible();
    await expect(logros.locator("li", { hasText: "Guardián del bosque" })).toContainText("(conseguido)");
    await expect(logros.locator("li", { hasText: "Maestro Panda" })).toContainText("(pendiente)");

    await page.getByRole("tab", { name: /^Escenas/ }).click();
    const escenas = page.locator("#diario-panel-escenas");
    // Prólogo + 10 capítulos desbloqueados; el resto con candado.
    await expect(escenas.getByRole("link")).toHaveCount(11);
    await escenas.getByRole("link", { name: /Capítulo 10/ }).click();
    await expect(page).toHaveURL("/historia/capitulo-10");
  });
});
