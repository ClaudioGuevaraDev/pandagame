import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../src/content/story/scenes/index.ts";
import {
  ALL_CHALLENGES,
  challengeHref,
  firstIds,
  readProgress,
  seedProgress,
  solveChallenge,
  successDialog,
} from "./helpers";

const PROLOGO = SCENES[0];
const live = (page: Page) => page.locator("p[aria-live]").filter({ hasText: /Viñeta|Fin de la escena/ });
const nextButton = (page: Page) => page.getByRole("button", { name: /^(Siguiente viñeta|Terminar escena)$/ });

test.describe("Lector de cómic @mobile", () => {
  test.use({ reducedMotion: "reduce" });
  test.beforeEach(async ({ page }) => {
    // Sin avance automático: los tests controlan el ritmo.
    await seedProgress(page, {});
  });

  test("el prólogo se lee viñeta a viñeta y termina con recompensas", async ({ page }) => {
    await page.goto("/historia/prologo");
    await expect(page.getByText("Prólogo", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(PROLOGO.title);
    await expect(live(page)).toContainText(`Viñeta 1 de ${PROLOGO.panels.length}`);
    await expect(live(page)).toContainText(PROLOGO.panels[0].narration!);

    for (let i = 2; i <= PROLOGO.panels.length; i++) {
      await nextButton(page).click();
      await expect(live(page)).toContainText(`Viñeta ${i} de ${PROLOGO.panels.length}`);
    }
    await page.getByRole("button", { name: "Terminar escena" }).click();
    await expect(live(page)).toHaveText("Fin de la escena.");
    await expect(page.getByText("Pincel de datos")).toBeVisible();
    await expect.poll(async () => (await readProgress(page))?.state.scenesSeen.prologo).toBe(true);

    await page.getByRole("link", { name: `Reto 1 · ${ALL_CHALLENGES[0].title}` }).click();
    await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[0]));
  });

  test("se navega con el teclado y con los botones de vuelta atrás", async ({ page }) => {
    await page.goto("/historia/prologo");
    await expect(live(page)).toContainText("Viñeta 1");
    await page.keyboard.press("ArrowRight");
    await expect(live(page)).toContainText("Viñeta 2");
    await page.keyboard.press("Space");
    await expect(live(page)).toContainText("Viñeta 3");
    await page.keyboard.press("ArrowLeft");
    await expect(live(page)).toContainText("Viñeta 2");
    await page.getByRole("button", { name: "Viñeta anterior" }).click();
    await expect(live(page)).toContainText("Viñeta 1");
    await expect(page.getByRole("button", { name: "Viñeta anterior" })).toBeDisabled();
  });

  test("Saltar escena va directo al final y la marca como vista", async ({ page }) => {
    await page.goto("/historia/prologo");
    await page.getByRole("button", { name: "Saltar escena" }).click();
    await expect(live(page)).toHaveText("Fin de la escena.");
    await expect.poll(async () => (await readProgress(page))?.state.scenesSeen.prologo).toBe(true);
  });

  test("las escenas bloqueadas redirigen al mapa y las inexistentes dan 404", async ({ page }) => {
    await page.goto("/historia/capitulo-5");
    await expect(page).toHaveURL("/jugar");
    const res = await page.goto("/historia/no-existe");
    expect(res?.status()).toBe(404);
  });
});

test("la escena final cierra la historia y abre el Diario", async ({ page }) => {
  await seedProgress(page, { completed: firstIds(30) });
  await page.goto("/historia/capitulo-30");
  await expect(page.getByText("Capítulo 30")).toBeVisible();
  await page.getByRole("button", { name: "Saltar escena" }).click();
  await expect(page.getByText("Has completado la historia.")).toBeVisible();
  await expect(page.getByText("Sello del Maestro Panda")).toBeVisible();
  await page.getByRole("link", { name: "Abrir el Diario de Bao" }).click();
  await expect(page).toHaveURL("/diario");
});

test.describe("Avance automático @mobile", () => {
  test.use({ reducedMotion: "reduce" });

  test("las viñetas avanzan solas y se puede pausar", async ({ page }) => {
    await seedProgress(page, { comicAutoplay: true });
    await page.goto("/historia/prologo");
    const toggle = page.getByRole("button", { name: "Avance automático" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(live(page)).toContainText("Viñeta 2", { timeout: 15_000 });

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(11_000); // más que la viñeta más larga
    await expect(live(page)).toContainText("Viñeta 2");
    await expect.poll(async () => (await readProgress(page))?.state.comicAutoplay).toBe(false);
  });
});

test("la narración se escribe sola y el primer clic la completa", async ({ page }) => {
  await seedProgress(page, {});
  await page.goto("/historia/prologo");
  const caption = page.locator(".comic-caption").first();
  await expect(caption).toBeVisible();
  const full = PROLOGO.panels[0].narration!;
  // A mitad de escritura, lo visible es más corto que el texto completo.
  await expect.poll(async () => (await caption.locator("span").first().innerText()).length).toBeLessThan(full.length);
  await page.getByRole("button", { name: "Siguiente viñeta" }).click();
  await expect(caption.locator("span").first()).toHaveText(full);
  await expect(live(page)).toContainText("Viñeta 1");
  await page.getByRole("button", { name: "Siguiente viñeta" }).click();
  await expect(live(page)).toContainText("Viñeta 2");
});

test.describe("La historia en el mapa", () => {
  test("pasa por la escena pendiente y permite volver a ver las vistas", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(3), scenesSeen: ["prologo", "capitulo-1", "capitulo-2"] });
    await page.goto("/jugar");
    await expect(page.getByRole("link", { name: /^Escena: .*\(nueva\)$/ })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /\(vista\)$/ })).toHaveCount(3);

    await page.getByRole("link", { name: "Continuar · Historia" }).click();
    await expect(page).toHaveURL("/historia/capitulo-3");
    await page.getByRole("button", { name: "Saltar escena" }).click();
    await expect(page.getByText("Pergamino de pistas I", { exact: true })).toBeVisible();

    await page.goto("/jugar");
    await expect(page.getByRole("link", { name: /Continuar · Reto 4/ })).toBeVisible();
    await page.getByRole("link", { name: /^Prólogo: .*\(vista\)$/ }).click();
    await expect(page).toHaveURL("/historia/prologo");
  });
});

test("del reto superado a la historia y al siguiente reto", async ({ page }) => {
  test.setTimeout(180_000);
  await seedProgress(page, { scenesSeen: ["prologo"] });
  await solveChallenge(page, ALL_CHALLENGES[0]);
  await successDialog(page).getByRole("link", { name: "Continuar la historia" }).click();
  await expect(page).toHaveURL("/historia/capitulo-1");
  await page.getByRole("button", { name: "Saltar escena" }).click();
  await page.getByRole("link", { name: `Reto 2 · ${ALL_CHALLENGES[1].title}` }).click();
  await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[1]));
});
