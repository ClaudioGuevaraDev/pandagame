import { expect, test } from "@playwright/test";
import {
  ALL_CHALLENGES,
  challenge,
  challengeHref,
  firstIds,
  getEditorCode,
  headerCount,
  outputPanel,
  outputTab,
  readProgress,
  runCode,
  runTests,
  seedProgress,
  setEditorCode,
  solveChallenge,
  statementPanel,
  successDialog,
  testButton,
  testsPanel,
  testsTab,
  typeInEditor,
  waitForEditor,
  waitForPython,
} from "./helpers";

const FACIL_1 = challenge("facil-1");
const FACIL_2 = challenge("facil-2");

test.describe("Ejecutar código", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
  });

  test("muestra la tabla del resultado", async ({ page }) => {
    await setEditorCode(page, FACIL_1.solution);
    await runCode(page);
    await expect(outputTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(outputPanel(page).locator("table.df")).toBeVisible();
  });

  test("muestra print y el valor de la última línea", async ({ page }) => {
    await setEditorCode(page, 'print("hola panda")\n40 + 2');
    await runCode(page);
    await expect(outputPanel(page)).toContainText("hola panda");
    await expect(outputPanel(page)).toContainText("42");
  });

  test("muestra errores con la línea", async ({ page }) => {
    await setEditorCode(page, "x = 1\ny = x +\n");
    await runCode(page);
    await expect(outputPanel(page)).toContainText("SyntaxError");
    await expect(outputPanel(page)).toContainText("Línea 2");

    await setEditorCode(page, "a = 1\nvariable_que_no_existe + a");
    await runCode(page);
    await expect(outputPanel(page)).toContainText("NameError");
    await expect(outputPanel(page)).toContainText("Línea 2");
  });

  test("corta un bucle infinito y Python se recupera", async ({ page }) => {
    test.setTimeout(150_000);
    await setEditorCode(page, "while True:\n    pass");
    await runCode(page);
    await expect(outputPanel(page)).toContainText("bucle infinito", { timeout: 30_000 });
    await waitForPython(page);
    await setEditorCode(page, 'print("de vuelta")');
    await runCode(page);
    await expect(outputPanel(page)).toContainText("de vuelta");
  });
});

test.describe("Fallar un reto", () => {
  test("con el código inicial falla, cuenta el intento y no completa", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    const r = await runTests(page);
    expect(r.passed).toBe(0);
    expect(r.total).toBe(FACIL_1.tests.length);
    await expect(testsTab(page)).toHaveAttribute("aria-selected", "true");
    // Cada test fallido aparece con su mensaje
    await expect(testsPanel(page).locator("li")).toHaveCount(FACIL_1.tests.length);
    await expect(testsPanel(page).getByText("(fallido)")).toHaveCount(FACIL_1.tests.length);
    await expect(testsPanel(page).locator("pre").first()).not.toBeEmpty();
    // La lista del enunciado también marca los fallidos
    await expect(statementPanel(page).getByText("(fallido)")).toHaveCount(FACIL_1.tests.length);
    await expect(successDialog(page)).toHaveCount(0);

    const p = await readProgress(page);
    expect(p?.state.attempts["facil-1"]).toBe(1);
    expect(p?.state.completed["facil-1"]).toBeUndefined();

    await runTests(page);
    expect((await readProgress(page))?.state.attempts["facil-1"]).toBe(2);
  });

  test("un error de Python antes de los tests se informa", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await setEditorCode(page, "def resolver(:\n    pass");
    const r = await runTests(page);
    expect(r.passed).toBe(0);
    await expect(testsPanel(page)).toContainText("SyntaxError");
  });
});

test.describe("Pasar un reto", () => {
  test("muestra el modal, guarda el progreso y abre el siguiente", async ({ page }) => {
    await solveChallenge(page, FACIL_1);
    const dialog = successDialog(page);
    await expect(dialog.getByRole("heading", { name: "¡Reto superado!" })).toBeVisible();
    await expect(dialog).toContainText(FACIL_1.title);

    await expect.poll(() => headerCount(page)).toBe("1/30");
    expect((await readProgress(page))?.state.completed["facil-1"]).toBeTruthy();

    await dialog.getByRole("link", { name: "Continuar la historia" }).click();
    await expect(page).toHaveURL("/historia/capitulo-1");
    await page.getByRole("button", { name: "Saltar escena" }).click();
    await page.getByRole("link", { name: `Reto 2 · ${FACIL_2.title}` }).click();
    await expect(page).toHaveURL(challengeHref(FACIL_2));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(FACIL_2.title);
  });

  test("Ver mapa lleva al mapa con el reto sellado", async ({ page }) => {
    await solveChallenge(page, FACIL_1);
    await successDialog(page).getByRole("link", { name: "Ver mapa" }).click();
    await expect(page).toHaveURL("/jugar");
    await expect(page.getByRole("link", { name: /^Reto 1: .*\(completado\)/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Reto 2: .*\(disponible\)/ })).toBeVisible();
  });

  test("Quedarme aquí cierra el modal y marca el reto como completado", async ({ page }) => {
    await solveChallenge(page, FACIL_1);
    await successDialog(page).getByRole("button", { name: "Quedarme aquí" }).click();
    await expect(successDialog(page)).toHaveCount(0);
    await expect(page).toHaveURL(challengeHref(FACIL_1));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("(completado)");
  });

  test("volver a pasar un reto ya completado no repite el modal", async ({ page }) => {
    await seedProgress(page, { completed: ["facil-1"] });
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await setEditorCode(page, FACIL_1.solution);
    const r = await runTests(page);
    expect(r.passed).toBe(r.total);
    await expect(successDialog(page)).toHaveCount(0);
  });

  test("completar el último reto de un nivel desbloquea el siguiente nivel", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(9) });
    const last = challenge("facil-10");
    await solveChallenge(page, last);
    const dialog = successDialog(page);
    await expect(dialog.getByRole("heading")).toHaveText("Bosque de Bambú, completado");
    await expect(dialog).toContainText("Desbloqueaste el nivel Medio: Río de Datos");
    await expect(dialog).toContainText(/Te esperan? \d* ?recompensas? en la historia/);
    await dialog.getByRole("link", { name: "Continuar la historia" }).click();
    await expect(page).toHaveURL("/historia/capitulo-10");
    await page.getByRole("button", { name: "Saltar escena" }).click();
    await expect(page.getByText("Pergamino de pistas II")).toBeVisible();
    await page.getByRole("link", { name: /^Reto 11 · / }).click();
    await expect(page).toHaveURL(challengeHref(challenge("medio-1")));
  });
});

test.describe("Bloqueo y navegación del reto", () => {
  test("los retos bloqueados redirigen al mapa", async ({ page }) => {
    await page.goto(challengeHref(challenge("facil-3")));
    await expect(page).toHaveURL("/jugar");
    await page.goto(challengeHref(challenge("medio-1")));
    await expect(page).toHaveURL("/jugar");
  });

  test("sin el Pergamino de pistas, las pistas están bloqueadas", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    const enunciado = statementPanel(page);
    await expect(enunciado.getByRole("button", { name: "Pistas bloqueadas" })).toBeDisabled();
    await expect(enunciado.getByText(/Las pistas se desbloquean con el Pergamino de pistas I/)).toBeVisible();
    await expect(enunciado.getByRole("button", { name: "Ver pista" })).toHaveCount(0);
  });

  test("con el primer pergamino solo se ve una pista por reto", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(3) });
    await page.goto(challengeHref(FACIL_1));
    const enunciado = statementPanel(page);
    await enunciado.getByRole("button", { name: "Ver pista" }).click();
    await expect(enunciado.getByText("Pista 1", { exact: true })).toBeVisible();
    await expect(enunciado.getByRole("button", { name: "Otra pista" })).toHaveCount(0);
    await expect(enunciado.getByText(/Más pistas con el Pergamino de pistas II/)).toBeVisible();
    // La pista abierta se recuerda
    await expect.poll(async () => (await readProgress(page))?.state.hintsUsed["facil-1"]).toBe(1);
    await page.reload();
    await expect(statementPanel(page).getByText("Pista 1", { exact: true })).toBeVisible();
  });

  test("pistas progresivas hasta agotarse", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(20) });
    await page.goto(challengeHref(FACIL_1));
    const enunciado = statementPanel(page);
    await enunciado.getByRole("button", { name: "Ver pista" }).click();
    await expect(enunciado.getByText("Pista 1", { exact: true })).toBeVisible();
    for (let i = 2; i <= FACIL_1.hints.length; i++) {
      await enunciado.getByRole("button", { name: "Otra pista" }).click();
      await expect(enunciado.getByText(`Pista ${i}`, { exact: true })).toBeVisible();
    }
    await expect(enunciado.getByRole("button", { name: /pista/i })).toHaveCount(0);
  });

  test("Repasar en el tutorial y ¿Cómo funciona? llevan a su lección", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await page.getByRole("link", { name: "Repasar en el tutorial" }).click();
    await expect(page).toHaveURL(`/tutorial/${FACIL_1.tutorialLink}`);
    await page.goBack();
    await page.getByRole("link", { name: /Cómo funciona/ }).click();
    await expect(page).toHaveURL("/tutorial/como-funcionan-los-retos");
  });

  test("Ver solución no aparece aunque haya muchos intentos", async ({ page }) => {
    await seedProgress(page, { attempts: { "facil-1": 7 } });
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await runTests(page);
    await expect(page.getByRole("button", { name: "Ver solución" })).toHaveCount(0);
    await expect(page.getByText(/La solución se desbloquea/)).toHaveCount(0);
  });

  test("el mini-mapa enlaza a los retos desbloqueados", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(12) });
    await page.goto(challengeHref(ALL_CHALLENGES[12]));
    const mini = page.getByRole("navigation", { name: "Progreso de retos" });
    await expect(mini.getByRole("link")).toHaveCount(13);
    await expect(mini.getByRole("link", { name: /^Reto 13: / })).toHaveAttribute("aria-current", "page");
    await mini.getByRole("link", { name: /^Reto 1: / }).click();
    await expect(page).toHaveURL(challengeHref(ALL_CHALLENGES[0]));
  });
});

test.describe("Editor", () => {
  test("Restaurar vuelve al código inicial y no revive el anterior", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await typeInEditor(page, "\n# mi intento");
    await expect.poll(async () => (await readProgress(page))?.state.code["facil-1"] ?? "").toContain("# mi intento");

    page.once("dialog", (d) => d.dismiss()); // cancelar mantiene el código
    await page.getByRole("button", { name: /Restaurar/ }).click();
    expect(await getEditorCode(page)).toContain("# mi intento");

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /Restaurar/ }).click();
    await expect.poll(() => getEditorCode(page)).toBe(FACIL_1.starterCode);
    await page.reload();
    await waitForEditor(page);
    expect(await getEditorCode(page)).toBe(FACIL_1.starterCode);
    expect((await readProgress(page))?.state.code["facil-1"]).toBeUndefined();
  });

  test("autoguarda el código y lo recupera al recargar", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await typeInEditor(page, "\n# guardado al recargar");
    await expect.poll(async () => (await readProgress(page))?.state.code["facil-1"] ?? "").toContain("# guardado");
    await page.reload();
    await waitForEditor(page);
    expect(await getEditorCode(page)).toContain("# guardado al recargar");
  });

  test("guarda lo escrito aunque se salga del reto enseguida", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await typeInEditor(page, "\n# salgo rapido");
    await page.getByRole("link", { name: "Volver al mapa" }).click();
    await expect(page).toHaveURL("/jugar");
    expect((await readProgress(page))?.state.code["facil-1"]).toContain("# salgo rapido");
  });

  test("atajos: Ctrl+Enter ejecuta y Ctrl+Shift+Enter corre los tests", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await setEditorCode(page, 'print("atajo")');
    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("Control+Enter");
    await expect(outputPanel(page)).toContainText("atajo");
    await page.keyboard.press("Control+Shift+Enter");
    await expect(testsTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(testsTab(page)).toContainText(/\d+\/\d+/);
  });

  test("las pestañas Salida/Tests se manejan con flechas", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await outputTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(testsTab(page)).toBeFocused();
    await expect(testsTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(testsPanel(page)).toBeVisible();
    await expect(outputPanel(page)).toBeHidden();
    await page.keyboard.press("Home");
    await expect(outputTab(page)).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Pegar está bloqueado en los retos", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("Ctrl+V, evento paste y Shift+Insert no cambian el código", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await waitForEditor(page);
    const before = await getEditorCode(page);
    await page.evaluate(() => navigator.clipboard.writeText("CODIGO_PEGADO = 1"));
    await page.locator(".monaco-editor .view-lines").first().click();

    await page.keyboard.press("Control+V");
    await expect(page.getByText(/escribe tu propio código/)).toBeVisible();
    expect(await getEditorCode(page)).toBe(before);

    await page.keyboard.press("Shift+Insert");
    expect(await getEditorCode(page)).toBe(before);

    await page.evaluate(() => {
      const target = document.querySelector(".monaco-editor textarea, .monaco-editor .native-edit-context");
      const data = new DataTransfer();
      data.setData("text/plain", "EVENTO_PEGADO = 2");
      target?.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    expect(await getEditorCode(page)).toBe(before);
  });

  test("escribir y copiar siguen funcionando", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await typeInEditor(page, "\n# escrito a mano");
    await expect.poll(() => getEditorCode(page)).toContain("# escrito a mano");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Control+C");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("# escrito a mano");
  });
});

test.describe("Ventajas de la historia", () => {
  test("la misión de la historia aparece sobre el enunciado", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await expect(statementPanel(page).getByText(FACIL_1.mision)).toBeVisible();
  });

  test("Lupa: sin ella no hay «Ver datos»", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(7) });
    await page.goto(challengeHref(challenge("facil-8")));
    await waitForPython(page);
    await expect(page.getByRole("button", { name: "Ejecutar", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ver datos" })).toHaveCount(0);
  });

  test("Lupa: «Ver datos» abre las tablas del reto", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(8) });
    const c = challenge("facil-9");
    await page.goto(challengeHref(c));
    await waitForPython(page);
    await page.getByRole("button", { name: "Ver datos" }).click();
    const dialog = page.getByRole("dialog", { name: "Datos del reto" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("table.df").first()).toBeVisible();
    await dialog.getByRole("button", { name: "Cerrar" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("Catalejo: sin él solo hay un aviso; con él se comparan las tablas", async ({ page }) => {
    const wrong = FACIL_1.solution.replace("tabla.set_index(columnas[0])", "tabla.set_index(columnas[0]).head(3)");
    await seedProgress(page, { completed: firstIds(3) });
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await setEditorCode(page, wrong);
    await runTests(page);
    await expect(testsPanel(page).getByText(/Con el Catalejo/).first()).toBeVisible();
    await expect(testsPanel(page).getByText("Catalejo: compara celda por celda")).toHaveCount(0);
  });

  test("Catalejo: marca las celdas distintas", async ({ page }) => {
    const wrong = FACIL_1.solution.replace("tabla.set_index(columnas[0])", "tabla.set_index(columnas[0]).head(3)");
    await seedProgress(page, { completed: firstIds(15) });
    await page.goto(challengeHref(FACIL_1));
    await waitForPython(page);
    await setEditorCode(page, wrong);
    await runTests(page);
    await expect(testsPanel(page).getByText("Catalejo: compara celda por celda").first()).toBeVisible();
    expect(await testsPanel(page).locator("table.df .diff").count()).toBeGreaterThan(0);
  });

  test("Brújula: el autocompletado de pandas aparece solo con ella", async ({ page }) => {
    await page.goto(challengeHref(FACIL_1));
    await typeInEditor(page, "\nx = pd.");
    await page.waitForTimeout(800);
    await expect(page.locator(".suggest-widget.visible")).toHaveCount(0);

    await page.evaluate(() => localStorage.removeItem("pandagame-progress"));
    await seedProgress(page, { completed: firstIds(5) });
    await page.goto(challengeHref(challenge("facil-6")));
    await typeInEditor(page, "\nx = pd.");
    await expect(page.locator(".suggest-widget.visible")).toContainText("DataFrame");
  });
});

test.describe("Pincel del maestro", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("tras el reto 20 se puede pegar en los retos", async ({ page }) => {
    await seedProgress(page, { completed: firstIds(20) });
    await page.goto(challengeHref(FACIL_1));
    await waitForEditor(page);
    await page.evaluate(() => navigator.clipboard.writeText("\nPEGADO_CON_PINCEL = 1"));
    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Control+V");
    await expect.poll(() => getEditorCode(page)).toContain("PEGADO_CON_PINCEL");
    await expect(page.getByText(/escribe tu propio código/)).toHaveCount(0);
  });
});

test("el botón Correr tests se deshabilita mientras ejecuta", async ({ page }) => {
  await page.goto(challengeHref(FACIL_1));
  await waitForPython(page);
  await setEditorCode(page, "import time\ntime.sleep(1.5)\n" + FACIL_1.starterCode);
  await testButton(page).click();
  await expect(testButton(page)).toBeDisabled();
  await expect(testButton(page)).toBeEnabled({ timeout: 30_000 });
});
