import { expect, test } from "@playwright/test";
import { firstIds, headerCount, seedProgress } from "./helpers";

test.describe("Navegación general @mobile", () => {
  test("los enlaces del header marcan la página actual", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await nav.getByRole("link", { name: "Mapa" }).click();
    await expect(page).toHaveURL("/jugar");
    await expect(nav.getByRole("link", { name: "Mapa" })).toHaveAttribute("aria-current", "page");
    await nav.getByRole("link", { name: "Tutorial" }).click();
    await expect(page).toHaveURL("/tutorial");
    await expect(nav.getByRole("link", { name: "Tutorial" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Mapa" })).not.toHaveAttribute("aria-current", "page");
  });

  test("el logo vuelve al inicio", async ({ page }) => {
    await page.goto("/tutorial");
    await page.getByRole("link", { name: "PandaGame, inicio" }).click();
    await expect(page).toHaveURL("/");
  });

  test("el contador del header refleja el progreso", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(7) });
    await page.goto("/jugar");
    await expect.poll(() => headerCount(page)).toBe("7/30");
  });

  test("404 en español con enlaces al mapa y al inicio", async ({ page }) => {
    const res = await page.goto("/no-existe-esta-pagina");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Este sendero no existe" })).toBeVisible();
    await page.getByRole("link", { name: "Ir al mapa" }).click();
    await expect(page).toHaveURL("/jugar");
  });

  test("retos o lecciones inexistentes dan 404", async ({ page }) => {
    expect((await page.goto("/jugar/facil/99"))?.status()).toBe(404);
    expect((await page.goto("/jugar/imposible/1"))?.status()).toBe(404);
    expect((await page.goto("/tutorial/no-existe"))?.status()).toBe(404);
  });
});

test("el enlace 'Saltar al contenido' aparece con Tab y lleva al main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("main#main")).toBeFocused();
});
