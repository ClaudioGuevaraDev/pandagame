# PandaGame 🐼

Juego web para aprender **pandas** (Python): 30 retos con tests repartidos en 3 niveles, un mapa de progreso y un tutorial de cero a experto. Python corre en el navegador con [Pyodide](https://pyodide.org) (sin backend) y el progreso se guarda en `localStorage`.

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm validate   # comprueba que la solución de cada reto pasa sus tests y que los snippets del tutorial se ejecutan
pnpm build
```

## Tests end-to-end

Suite de [Playwright](https://playwright.dev) en `e2e/`, sobre el Chrome instalado en el sistema (no descarga navegadores). Levanta la app automáticamente (`pnpm build && pnpm start -p 3100`). Necesita internet: Pyodide se descarga del CDN.

```bash
pnpm test:e2e        # suite completa en escritorio y móvil
pnpm test:e2e:full   # recorrido completo: resuelve los 30 retos desde la interfaz
pnpm test:e2e:ui     # modo interactivo
```

| Spec | Qué cubre |
|---|---|
| `inicio` | Pantalla de inicio, Jugar/Continuar, barra de progreso, estado final |
| `navegacion` | Header, logo, "Saltar al contenido", 404 |
| `mapa` | Estados de los retos, cabecera fija, chips de nivel, tooltips, volver al reto |
| `retos` | Ejecutar, errores, timeout, fallar y pasar retos, completar nivel, bloqueo, pistas, restaurar, autoguardado, pegar bloqueado, atajos, pestañas, mini-mapa |
| `retos-movil` | Pestañas Reto/Código/Resultado en móvil |
| `tutorial` | Índice, navegación, ejemplos ejecutables, lecciones leídas, guía de botones |
| `borrar-datos` | Diálogo de borrado, confirmación con BORRAR, foco, limpieza total |
| `persistencia` | Recargas, migración del progreso, datos corruptos |
| `seo-a11y` | robots, sitemap, íconos, metadatos, JSON-LD y accesibilidad con axe |
| `recorrido-completo` | Los 30 retos en orden (`@full`) |

## Estructura

- `src/content/challenges/{facil,medio,dificil}.ts`: retos (enunciado, setup, código inicial, solución, pistas, tests).
- `src/content/tutorial/*.ts`: lecciones del tutorial.
- `src/lib/pyodide/`: arnés Python de ejecución y tests (`harness.ts`) y cliente del Web Worker (`runner.ts`).
- `public/pyodide-worker.js`: Web Worker que carga Pyodide + pandas desde el CDN.
- `src/lib/progress/`: progreso persistido (zustand) y reglas de desbloqueo.

Para añadir un reto, agrégalo al array del nivel y ejecuta `pnpm validate`.
