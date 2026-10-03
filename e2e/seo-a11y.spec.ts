import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ALL_CHALLENGES, challenge, challengeHref, firstIds, seedProgress, waitForAnimations, waitForPython } from "./helpers";
import { LESSONS } from "../src/content/tutorial/index.ts";

test.describe("SEO", () => {
  test("robots.txt y sitemap.xml", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toMatch(/Sitemap: .*\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap.match(/<url>/g)?.length).toBe(3 + LESSONS.length + ALL_CHALLENGES.length);
  });

  test("íconos e imagen para redes", async ({ request }) => {
    for (const [path, type] of [
      ["/icon.svg", "image/svg+xml"],
      ["/apple-icon", "image/png"],
      ["/opengraph-image", "image/png"],
    ] as const) {
      const res = await request.get(path);
      expect(res.ok(), path).toBe(true);
      expect(res.headers()["content-type"]).toContain(type);
    }
  });

  test("el HTML del reto (sin JavaScript) incluye título, descripción y enunciado", async ({ request }) => {
    const c = challenge("facil-1");
    const html = await (await request.get(challengeHref(c))).text();
    expect(html).toContain(`<title>${c.title}`);
    expect(html).toMatch(/<meta name="description" content="[^"]{40,}/);
    expect(html).toContain('rel="canonical"');
    expect(html).toContain("Tests a superar");
  });

  test("el tutorial publica datos estructurados", async ({ request }) => {
    const index = await (await request.get("/tutorial")).text();
    expect(index).toContain('"@type":"Course"');
    const lesson = await (await request.get("/tutorial/agregacion")).text();
    expect(lesson).toContain('"@type":"LearningResource"');
  });
});

test.describe("Accesibilidad (axe) @mobile", () => {
  const pages: [string, string][] = [
    ["inicio", "/"],
    ["mapa", "/jugar"],
    ["reto", challengeHref(ALL_CHALLENGES[5])],
    ["tutorial", "/tutorial"],
    ["lección", "/tutorial/como-funcionan-los-retos"],
    ["404", "/no-existe"],
  ];
  for (const [name, path] of pages) {
    test(`sin violaciones graves: ${name}`, async ({ page }) => {
      await seedProgress(page, { completed: firstIds(5) });
      await page.goto(path);
      if (name === "reto") await waitForPython(page);
      // Medir el contraste a mitad de un fundido de entrada daría falsos positivos.
      await waitForAnimations(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude(".monaco-editor") // editor de terceros
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")})`),
      ).toEqual([]);
    });
  }
});
