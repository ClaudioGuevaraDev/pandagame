import { expect, test } from "@playwright/test";
import { ALL_CHALLENGES, challengeHref, firstIds, seedProgress } from "./helpers";

test.describe("Inicio @mobile", () => {
  test("ocupa toda la pantalla sin scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "PandaGame" })).toBeVisible();
    const { sh, ih, sw, iw } = await page.evaluate(() => ({
      sh: document.documentElement.scrollHeight,
      ih: innerHeight,
      sw: document.documentElement.scrollWidth,
      iw: innerWidth,
    }));
    expect(sh).toBeLessThanOrEqual(ih);
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test("sin progreso, Jugar lleva al primer reto", async ({ page }) => {
    await page.goto("/");
    const jugar = page.getByRole("link", { name: "Jugar" });
    await expect(jugar).toBeVisible();
    // La barra existe pero oculta (opacity 0 + aria-hidden) hasta que haya progreso.
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    await jugar.click();
    await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[0]));
  });

  test("con progreso, Continuar lleva al reto actual y muestra el camino", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(12) });
    await page.goto("/");
    const current = ALL_CHALLENGES[12];
    await expect(page.getByText(`Reto 13 · ${current.title}`)).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12");
    await expect(page.getByText("12/30", { exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: "Continuar" }).click();
    await expect(page).toHaveURL(challengeHref(current));
  });

  test("los botones Mapa y Tutorial navegan", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Mapa" }).click();
    await expect(page).toHaveURL("/jugar");
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Tutorial" }).click();
    await expect(page).toHaveURL("/tutorial");
  });

  test("con los 30 retos completados muestra el estado final", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(30) });
    await page.goto("/");
    await expect(page.getByText("Has completado todos los retos. Maestro Panda.")).toBeVisible();
    await page.getByRole("link", { name: "Ver mapa" }).click();
    await expect(page).toHaveURL("/jugar");
  });
});
