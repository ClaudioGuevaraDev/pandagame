import { expect, test } from "@playwright/test";
import { challengeHref, challenge, firstIds, headerCount, readProgress, seedProgress, STORAGE_KEY } from "./helpers";

test.describe("Borrar todo el progreso @mobile", () => {
  test.beforeEach(async ({ page }) => {
    await seedProgress(page, {
      completed: firstIds(5),
      code: { "facil-6": "# mi código", "facil-2": "# otro" },
      tutorialRead: ["fundamentos", "seleccion"],
    });
    await page.goto("/jugar");
  });

  const trash = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Borrar todo el progreso" });

  test("el diálogo muestra el resumen y exige escribir BORRAR", async ({ page }) => {
    await trash(page).click();
    const dialog = page.getByRole("dialog", { name: "Borrar todo el progreso" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Retos completados5/30");
    await expect(dialog).toContainText("Retos con código guardado2");
    await expect(dialog).toContainText(/Lecciones leídas2\/\d+/);

    const confirm = dialog.getByRole("button", { name: "Borrar todo" });
    await expect(confirm).toBeDisabled();
    await dialog.getByRole("textbox").fill("borr");
    await expect(confirm).toBeDisabled();
    await dialog.getByRole("textbox").fill("borrar");
    await expect(confirm).toBeEnabled();
  });

  test("Cancelar y Escape cierran sin borrar y devuelven el foco", async ({ page }) => {
    await trash(page).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trash(page)).toBeFocused();

    await trash(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trash(page)).toBeFocused();
    expect(Object.keys((await readProgress(page))!.state.completed)).toHaveLength(5);
  });

  test("el foco queda dentro del diálogo", async ({ page }) => {
    await trash(page).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("textbox")).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("dialog") || document.activeElement === document.body);
      expect(inside).toBe(true);
    }
  });

  test("confirmar borra todo y vuelve al inicio", async ({ page }) => {
    await trash(page).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("BORRAR");
    await dialog.getByRole("button", { name: "Borrar todo" }).click();

    await expect(page).toHaveURL("/");
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBeNull();
    await expect.poll(() => headerCount(page)).toBe("0/30");
    await expect(page.getByRole("link", { name: "Jugar" })).toBeVisible();

    // Los retos vuelven a estar bloqueados y sin código guardado
    await page.goto(challengeHref(challenge("facil-3")));
    await expect(page).toHaveURL("/jugar");
    await expect(page.getByRole("link", { name: /^Reto \d+: / })).toHaveCount(1);
  });

  test("Enter en el campo confirma el borrado", async ({ page }) => {
    await trash(page).click();
    await page.getByRole("dialog").getByRole("textbox").fill("BORRAR");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBeNull();
  });
});
