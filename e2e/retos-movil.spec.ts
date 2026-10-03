import { expect, test } from "@playwright/test";
import { challenge, challengeHref, outputPanel, setEditorCode, successDialog, testButton, waitForPython } from "./helpers";

// Solo en el proyecto móvil: pestañas Reto / Código / Resultado.
test.describe("Reto en móvil @mobile-only @mobile", () => {
  const FACIL_1 = challenge("facil-1");

  test("las pestañas muestran una sección a la vez", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    const tabs = page.getByRole("tablist", { name: "Secciones del reto" });
    await expect(tabs.getByRole("tab", { name: "Reto" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#m-panel-reto")).toBeVisible();
    await expect(page.locator("#m-panel-codigo")).toBeHidden();

    await tabs.getByRole("tab", { name: "Código" }).click();
    await expect(page.locator("#m-panel-codigo")).toBeVisible();
    await expect(page.locator("#m-panel-reto")).toBeHidden();

    await tabs.getByRole("tab", { name: "Resultado" }).click();
    await expect(page.locator("#m-panel-resultado")).toBeVisible();
  });

  test("ejecutar cambia a Resultado y se puede superar el reto", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await page.getByRole("tab", { name: "Código" }).click();
    await setEditorCode(page, FACIL_1.solution);
    // En móvil, al ejecutar se pasa a "Resultado" y el botón queda oculto: se espera el resultado.
    await page.getByRole("button", { name: "Ejecutar", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Resultado" })).toHaveAttribute("aria-selected", "true");
    await expect(outputPanel(page).locator("table.df")).toBeVisible({ timeout: 120_000 });

    await page.getByRole("tab", { name: "Código" }).click();
    await testButton(page).click();
    await expect(successDialog(page)).toBeVisible({ timeout: 60_000 });
  });
});
