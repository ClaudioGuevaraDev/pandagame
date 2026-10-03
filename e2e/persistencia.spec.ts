import { expect, test } from "@playwright/test";
import { challenge, challengeHref, firstIds, headerCount, readProgress, seedProgress, solveChallenge, STORAGE_KEY } from "./helpers";

test("el progreso sobrevive a recargas y a la navegación", async ({ page }) => {
  await solveChallenge(page, challenge("facil-1"));
  await page.reload();
  await expect.poll(() => headerCount(page)).toBe("1/30");
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Continuar" })).toBeVisible();
  await page.goto(challengeHref(challenge("facil-2")));
  await expect(page).toHaveURL(challengeHref(challenge("facil-2")));
});

test("migra el progreso v1: conserva lo completado y descarta el código", async ({ page }) => {
  await seedProgress(page, {
    version: 1,
    completed: firstIds(3),
    attempts: { "facil-4": 2 },
    code: { "facil-4": "# código de un enunciado viejo" },
    tutorialRead: ["fundamentos"],
  });
  await page.goto("/jugar");
  await expect.poll(async () => (await readProgress(page))?.version).toBe(3);
  const p = (await readProgress(page))!;
  expect(Object.keys(p.state.completed)).toEqual(firstIds(3));
  expect(p.state.code).toEqual({});
  // v3: las escenas de lo ya completado cuentan como vistas
  expect(Object.keys(p.state.scenesSeen).sort()).toEqual(["capitulo-1", "capitulo-2", "capitulo-3", "prologo"]);
  expect(p.state.attempts["facil-4"]).toBe(2);
  expect(p.state.tutorialRead.fundamentos).toBe(true);
  await expect.poll(() => headerCount(page)).toBe("3/30");
});

test("datos guardados corruptos no rompen la app", async ({ page }) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("__seeded")) {
      localStorage.setItem(key, "{esto no es json");
      sessionStorage.setItem("__seeded", "1");
    }
  }, STORAGE_KEY);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "PandaGame" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Jugar|Continuar/ })).toBeVisible();
  await page.goto("/jugar");
  await expect(page.getByRole("link", { name: /^Reto 1: / })).toBeVisible();
  expect(errors).toEqual([]);
});
