import { expect, test, type Page } from "@playwright/test";
import { ALL_CHALLENGES, challengeHref, firstIds, seedProgress } from "./helpers";

const scroller = (page: Page) => page.locator("main .overflow-y-auto").first();
const levelCard = (page: Page) => page.locator("main .paper-card.ink-in").first();
/** Contenedor fijo de la cabecera (la tarjeta dentro se anima al cambiar de nivel). */
const fixedHeader = (page: Page) => page.locator("main .shrink-0").first();
const nodeLink = (page: Page, n: number) => page.getByRole("link", { name: new RegExp(`^Reto ${n}: `) });

test.describe("Mapa @mobile", () => {
  test.beforeEach(async ({ page }) => {
    // 12 completados: el actual es el reto 13 (medio-3).
    await seedProgress(page, { completed: firstIds(12) });
    await page.goto("/jugar");
  });

  test("muestra los estados de cada reto", async ({ page }) => {
    // Completado: enlace con "(completado)"
    await expect(nodeLink(page, 1)).toContainText("(completado)");
    // Actual: "disponible" y globo "¡Estás aquí!"
    await expect(nodeLink(page, 13)).toContainText("(disponible)");
    await expect(nodeLink(page, 13)).toHaveAttribute("aria-current", "step");
    await expect(page.getByText("¡Estás aquí!")).toBeVisible();
    // Bloqueado: no es un enlace
    await expect(nodeLink(page, 14)).toHaveCount(0);
    await expect(page.getByText(/Reto 14: .*\(bloqueado\)/)).toHaveCount(1);
    // Hay 12 sellos de completado en los nodos
    await expect(page.locator("main ol .hanko")).toHaveCount(12);
  });

  test("hace scroll automático hasta el reto actual", async ({ page }) => {
    await expect(nodeLink(page, 13)).toBeInViewport();
    await expect(levelCard(page)).toContainText("Río de Datos");
  });

  test("la cabecera del nivel queda fija y cambia al hacer scroll", async ({ page }) => {
    const card = levelCard(page);
    await expect(card).toContainText("Río de Datos");
    const before = await fixedHeader(page).boundingBox();

    // La tarjeta no está dentro del área con scroll
    expect(await scroller(page).locator(".paper-card.ink-in").count()).toBe(0);

    await scroller(page).evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    await expect(card).toContainText("Cumbre del Maestro Panda");
    const after = await fixedHeader(page).boundingBox();
    expect(after?.y).toBe(before?.y);
    expect(after?.height).toBeCloseTo(before?.height ?? 0, 0);

    await scroller(page).evaluate((el) => el.scrollTo({ top: 0 }));
    await expect(levelCard(page)).toContainText("Bosque de Bambú");
  });

  test("ningún reto queda encima de la cabecera", async ({ page }) => {
    // En cada posición de scroll, el elemento visible en varios puntos de la tarjeta
    // debe pertenecer a la propia tarjeta (ningún nodo, sello o globo la tapa).
    for (const top of [0, 400, 1200, 2000, 3000, 99999]) {
      await scroller(page).evaluate((el, t) => el.scrollTo({ top: t }), top);
      // poll: si el scroll cambia de nivel, la tarjeta se reemplaza; se mide cuando ya está estable.
      await expect
        .poll(
          () =>
            levelCard(page).evaluate((card) => {
              const r = card.getBoundingClientRect();
              const points = [0.1, 0.5, 0.9].flatMap((fx) =>
                [0.2, 0.8].map((fy) => [r.left + r.width * fx, r.top + r.height * fy]),
              );
              return points.filter(([x, y]) => {
                const hit = document.elementFromPoint(x, y);
                return !hit || !card.contains(hit);
              }).length;
            }),
          { message: `scrollTop=${top}` },
        )
        .toBe(0);
    }
  });

  test("los chips saltan a cada nivel", async ({ page }) => {
    await page.getByRole("button", { name: /^Ir al nivel Fácil/ }).click();
    await expect(levelCard(page)).toContainText("Bosque de Bambú");
    await expect(nodeLink(page, 1)).toBeInViewport();

    const dificil = page.getByRole("button", { name: /^Ir al nivel Difícil/ });
    await expect(dificil).toHaveAccessibleName(/\(bloqueado\)/);
    await dificil.click();
    await expect(levelCard(page)).toContainText("Cumbre del Maestro Panda");
    await expect(dificil).toHaveAttribute("aria-current", "true");
  });

  test("Continuar lleva al reto actual", async ({ page }) => {
    await page.getByRole("link", { name: /Continuar · Reto 13/ }).click();
    await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[12]));
  });

  test("un reto completado se puede volver a abrir y desde ahí volver al mapa", async ({ page }) => {
    await page.getByRole("button", { name: /^Ir al nivel Fácil/ }).click();
    await nodeLink(page, 3).click();
    await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[2]));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(ALL_CHALLENGES[2].title);
    await page.getByRole("link", { name: "Volver al mapa" }).click();
    await expect(page).toHaveURL("/jugar");
  });
});

test("el tooltip aparece con hover y con foco de teclado", async ({ page }) => {
  await seedProgress(page, { completed: firstIds(2) });
  await page.goto("/jugar");
  const link = nodeLink(page, 1);
  const tip = page.locator(`#${await link.getAttribute("aria-describedby")}`);
  await expect(tip).toHaveCSS("opacity", "0");
  await link.hover();
  await expect(tip).toHaveCSS("opacity", "1");
  await expect(tip).toContainText(ALL_CHALLENGES[0].title);
  await page.mouse.move(0, 0);
  await link.focus();
  await expect(tip).toHaveCSS("opacity", "1");
});

test("sin progreso solo el primer reto está disponible", async ({ page }) => {
  await page.goto("/jugar");
  await expect(nodeLink(page, 1)).toContainText("(disponible)");
  await expect(page.getByRole("link", { name: /^Reto \d+: / })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Ir al nivel Medio.*\(bloqueado\)/ })).toBeVisible();
});
