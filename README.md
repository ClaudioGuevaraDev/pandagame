# PandaGame 🐼

Juego web para aprender **pandas** (Python): 30 retos con tests repartidos en 3 niveles, un mapa de progreso y un tutorial de cero a experto. Python corre en el navegador con [Pyodide](https://pyodide.org) (sin backend) y el progreso se guarda en `localStorage`.

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm validate   # comprueba que la solución de cada reto pasa sus tests y que los snippets del tutorial se ejecutan
pnpm build
```

## Estructura

- `src/content/challenges/{facil,medio,dificil}.ts`: retos (enunciado, setup, código inicial, solución, pistas, tests).
- `src/content/tutorial/*.ts`: lecciones del tutorial.
- `src/lib/pyodide/`: arnés Python de ejecución y tests (`harness.ts`) y cliente del Web Worker (`runner.ts`).
- `public/pyodide-worker.js`: Web Worker que carga Pyodide + pandas desde el CDN.
- `src/lib/progress/`: progreso persistido (zustand) y reglas de desbloqueo.

Para añadir un reto, agrégalo al array del nivel y ejecuta `pnpm validate`.
