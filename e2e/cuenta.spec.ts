import { expect, test, type Page } from "@playwright/test";
import {
  ALL_CHALLENGES,
  challengeHref,
  firstIds,
  runCode,
  runTests,
  seedProgress,
  setEditorCode,
  solveChallenge,
  successDialog,
  waitForPython,
} from "./helpers";

// Sin sesión real de Google: se comprueba la invitación, la redirección a Supabase
// y la cola local de respuestas (que se sube al iniciar sesión).
const loginButton = (page: Page) => page.getByRole("button", { name: /Guardar avance/ });

type Queued = { kind: string; challenge_id?: string; lesson_slug?: string; snippet?: number; code?: string; passed?: boolean; tests_passed?: number; tests_total?: number; attempt?: number; hint?: number; client_at: string };
const readAnswers = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("pandagame-answers") ?? "[]")) as Promise<Queued[]>;

test.describe("Cuenta @mobile", () => {
  test("«Guardar avance» abre el diálogo y lleva a Google vía Supabase", async ({ page }) => {
    let authorize: URL | null = null;
    await page.route("**/auth/v1/authorize**", (route) => {
      authorize = new URL(route.request().url());
      return route.fulfill({ status: 200, contentType: "text/html", body: "<title>Google</title>" });
    });
    await page.goto("/jugar");
    await loginButton(page).click();
    const dialog = page.getByRole("dialog", { name: "Guarda tu avance" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("tus respuestas");
    await dialog.getByRole("button", { name: "Ahora no" }).click();
    await expect(dialog).toBeHidden();

    await loginButton(page).click();
    await page.getByRole("button", { name: "Continuar con Google" }).click();
    await expect.poll(() => authorize?.searchParams.get("provider")).toBe("google");
    const back = new URL(authorize!.searchParams.get("redirect_to")!);
    expect(back.pathname).toBe("/auth/callback");
    expect(back.searchParams.get("next")).toBe("/jugar");
  });

  test("el callback sin código vuelve al inicio con error", async ({ page }) => {
    await page.goto("/auth/callback?next=//evil.com");
    await expect(page).toHaveURL("/?auth=error");
  });

  test("el mapa invita a guardar el avance y se puede descartar", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(2), scenesSeen: ["prologo", "capitulo-1", "capitulo-2"] });
    await page.goto("/jugar");
    await expect(page.getByText("Llevas 2 retos. Guarda tu avance para no perderlo.")).toBeVisible();
    await page.getByRole("button", { name: "Descartar aviso" }).click();
    await expect(page.getByText(/Llevas 2 retos/)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("link", { name: /Continuar/ })).toBeVisible();
    await expect(page.getByText(/Llevas 2 retos/)).toHaveCount(0);
  });
});

test("las respuestas de un reto quedan registradas", async ({ page }) => {
  test.setTimeout(180_000);
  const c = ALL_CHALLENGES[0];
  await seedProgress(page, { scenesSeen: ["prologo"] });
  await page.goto(challengeHref(c));
  await waitForPython(page);
  await setEditorCode(page, "print('hola')");
  await runCode(page);
  await runTests(page);
  await solveChallenge(page, c, { navigate: false });
  await expect(successDialog(page).getByText("No pierdas tu avance")).toBeVisible();

  const answers = await readAnswers(page);
  expect(answers.map((a) => a.kind)).toEqual(["challenge_run", "challenge_test", "challenge_test"]);
  expect(answers[0]).toMatchObject({ challenge_id: c.id, code: "print('hola')" });
  expect(answers[1]).toMatchObject({ passed: false, attempt: 1 });
  expect(answers[2]).toMatchObject({ passed: true, attempt: 2, code: c.solution });
  expect(answers[2].tests_passed).toBe(answers[2].tests_total);
  expect(Date.parse(answers[2].client_at)).not.toBeNaN();
});

test("las pistas y los ejemplos del tutorial quedan registrados", async ({ page }) => {
  test.setTimeout(180_000);
  await seedProgress(page, { completed: firstIds(3), scenesSeen: ["prologo", "capitulo-1", "capitulo-2", "capitulo-3"] });
  await page.goto(challengeHref(ALL_CHALLENGES[3]));
  await page.getByRole("button", { name: "Ver pista" }).click();
  await expect.poll(async () => (await readAnswers(page)).at(-1)).toMatchObject({
    kind: "hint",
    challenge_id: ALL_CHALLENGES[3].id,
    hint: 1,
  });

  await page.goto("/tutorial/fundamentos");
  await page.getByRole("button", { name: "Ejecutar" }).first().click();
  await expect
    .poll(async () => (await readAnswers(page)).at(-1), { timeout: 150_000 })
    .toMatchObject({ kind: "tutorial_run", lesson_slug: "fundamentos", error: null });
});
