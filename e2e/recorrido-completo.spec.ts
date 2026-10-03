import { expect, test } from "@playwright/test";
import { ALL_CHALLENGES, challengeHref, headerCount, runTests, setEditorCode, successDialog, waitForPython } from "./helpers";

// Recorrido completo: los 30 retos en orden desde la interfaz. Se corre con pnpm test:e2e:full.
test("resuelve los 30 retos en orden desde el inicio @full", async ({ page }) => {
  test.setTimeout(30 * 60_000);
  await page.goto("/");
  await page.getByRole("link", { name: "Jugar" }).click();

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

      if (isLast) {
        await expect(dialog).toContainText("Eres un Maestro Panda");
        await dialog.getByRole("link", { name: "Ver mapa" }).click();
      } else {
        await dialog.getByRole("link", { name: /^Siguiente:/ }).click();
      }
    });
  }

  await expect(page).toHaveURL("/jugar");
  await expect.poll(() => headerCount(page)).toBe("30/30");
  await expect(page.getByRole("link", { name: /\(completado\)/ })).toHaveCount(30);
  await page.goto("/");
  await expect(page.getByText("Has completado todos los retos. Maestro Panda.")).toBeVisible();
});
