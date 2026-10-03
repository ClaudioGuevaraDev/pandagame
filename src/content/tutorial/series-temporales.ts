import type { Lesson } from "../types.ts";

export const seriesTemporales: Lesson = {
  slug: "series-temporales",
  module: 8,
  title: "Series temporales",
  summary: "Fechas con to_datetime y .dt, DatetimeIndex, resample, rolling, shift, diff y pct_change.",
  relatedChallenges: ["medio-10", "dificil-5", "dificil-6"],
  blocks: [
    {
      type: "markdown",
      content: `## Convertir a fecha

Las fechas suelen llegar como texto. \`pd.to_datetime\` las convierte al tipo \`datetime64\`, que permite operar con ellas:

- \`format="%d/%m/%Y"\` indica el formato exacto (más rápido y sin ambigüedades).
- \`errors="coerce"\` convierte las fechas inválidas en \`NaT\` (*Not a Time*).
- \`dayfirst=True\` para fechas tipo \`03/10/2026\` = 3 de octubre.`,
    },
    {
      type: "code",
      title: "to_datetime",
      code: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin"],
    "nacimiento": ["15/08/2020", "02/03/2017", "fecha rara"],
})
df["nacimiento"] = pd.to_datetime(df["nacimiento"], format="%d/%m/%Y", errors="coerce")
print(df.dtypes)
df`,
    },
    {
      type: "markdown",
      content: `## El accesor .dt

Igual que \`.str\` para texto, \`.dt\` da acceso a las partes de una fecha: \`year\`, \`month\`, \`day\`, \`dayofweek\` (lunes = 0), \`day_name()\`, \`quarter\`, \`hour\`… Y restar fechas da un \`Timedelta\`, del que puedes sacar \`.dt.days\`.`,
    },
    {
      type: "code",
      title: "Extraer partes y calcular diferencias",
      code: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin"],
    "nacimiento": pd.to_datetime(["2020-08-15", "2017-03-02", "2023-11-20"]),
})
hoy = pd.Timestamp("2026-10-03")
df["anio"] = df["nacimiento"].dt.year
df["mes"] = df["nacimiento"].dt.month
df["dia_semana"] = df["nacimiento"].dt.dayofweek
df["dias_vivo"] = (hoy - df["nacimiento"]).dt.days
df["edad"] = df["dias_vivo"] // 365
df`,
    },
    {
      type: "markdown",
      content: `## DatetimeIndex

Si pones las fechas como **índice**, Pandas desbloquea superpoderes: seleccionar por texto parcial (\`s.loc["2026-03"]\` → todo marzo), rangos de fechas y remuestreo.

\`pd.date_range(inicio, periods=n, freq=...)\` genera fechas regulares. Alias de frecuencia comunes en **pandas 3**:

| Alias | Significado |
|---|---|
| \`"D"\` | Día |
| \`"W"\` | Semana (termina en domingo) |
| \`"ME"\` | Fin de mes (antes \`"M"\`) |
| \`"MS"\` | Inicio de mes |
| \`"QE"\` | Fin de trimestre |
| \`"YE"\` | Fin de año |
| \`"h"\` / \`"min"\` | Hora / minuto (en minúscula) |`,
    },
    {
      type: "code",
      title: "date_range y selección parcial",
      code: `import pandas as pd
import numpy as np

fechas = pd.date_range("2026-01-01", periods=90, freq="D")
rng = np.random.default_rng(0)
bambu = pd.Series(rng.integers(10, 20, size=90), index=fechas, name="bambu_kg")
print("Total de febrero:", bambu.loc["2026-02"].sum())
bambu.loc["2026-03-01":"2026-03-07"]`,
    },
    {
      type: "markdown",
      content: `## resample: cambiar la frecuencia

\`resample\` es un \`groupby\` por intervalos de tiempo. Necesita un índice de fechas (o \`on="columna"\`):

\`\`\`python
serie.resample("ME").sum()   # total por mes
serie.resample("W").mean()   # media semanal
\`\`\``,
    },
    {
      type: "code",
      title: "resample mensual y semanal",
      code: `import pandas as pd
import numpy as np

fechas = pd.date_range("2026-01-01", periods=90, freq="D")
rng = np.random.default_rng(0)
bambu = pd.Series(rng.integers(10, 20, size=90), index=fechas, name="bambu_kg")
print(bambu.resample("W").mean().head())
bambu.resample("ME").agg(["sum", "mean", "max"])`,
    },
    {
      type: "code",
      title: "resample con columna de fecha y grupos",
      code: `import pandas as pd

df = pd.DataFrame({
    "fecha": pd.to_datetime(["2026-01-03", "2026-01-20", "2026-02-11", "2026-02-25", "2026-03-02", "2026-01-15"]),
    "panda": ["Mei", "Mei", "Mei", "Bao", "Bao", "Bao"],
    "visitantes": [120, 150, 90, 200, 180, 170],
})
df.groupby("panda").resample("MS", on="fecha")["visitantes"].sum().unstack(fill_value=0)`,
    },
    {
      type: "markdown",
      content: `## Ventanas móviles con rolling

\`rolling(n)\` calcula estadísticas sobre una **ventana deslizante** de \`n\` filas: media móvil, suma móvil… Suaviza el ruido y revela tendencias. Las primeras \`n-1\` filas quedan en \`NaN\` salvo que uses \`min_periods\`.

También puedes usar ventanas de tiempo: \`rolling("7D")\` con un índice de fechas.`,
    },
    {
      type: "code",
      title: "Media móvil de 7 días",
      code: `import pandas as pd

fechas = pd.date_range("2026-03-01", periods=10, freq="D")
df = pd.DataFrame({"bambu_kg": [12, 15, 11, 18, 14, 13, 19, 16, 12, 17]}, index=fechas)
df["media_3d"] = df["bambu_kg"].rolling(3).mean().round(2)
df["media_7d"] = df["bambu_kg"].rolling("7D").mean().round(2)
df["acumulado"] = df["bambu_kg"].cumsum()
df`,
    },
    {
      type: "markdown",
      content: `## shift, diff y pct_change

- \`shift(1)\`: desplaza los valores una fila hacia abajo (el valor "de ayer").
- \`diff()\`: diferencia con la fila anterior = \`s - s.shift(1)\`.
- \`pct_change()\`: variación porcentual = \`s / s.shift(1) - 1\`.

Combinados con \`groupby\`, se calculan **por grupo** (por ejemplo, por panda) sin mezclar datos de distintos grupos.`,
    },
    {
      type: "code",
      title: "Variaciones día a día",
      code: `import pandas as pd

df = pd.DataFrame({
    "fecha": pd.date_range("2026-03-01", periods=5, freq="D"),
    "peso_kg": [80.0, 80.6, 81.1, 80.9, 81.5],
})
df["ayer"] = df["peso_kg"].shift(1)
df["cambio"] = df["peso_kg"].diff().round(2)
df["cambio_pct"] = (df["peso_kg"].pct_change() * 100).round(2)
df`,
    },
    {
      type: "code",
      title: "Variaciones por grupo",
      code: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Mei", "Mei", "Bao", "Bao", "Bao"],
    "mes": [1, 2, 3, 1, 2, 3],
    "peso_kg": [80.0, 82.0, 83.5, 110.0, 108.0, 111.0],
})
df = df.sort_values(["panda", "mes"])
df["cambio"] = df.groupby("panda")["peso_kg"].diff()
df["media_movil_2"] = df.groupby("panda")["peso_kg"].transform(lambda s: s.rolling(2).mean())
df`,
    },
    {
      type: "markdown",
      content: `## Resumen

- \`to_datetime\` (con \`format\` y \`errors="coerce"\`) y el accesor \`.dt\`.
- Un \`DatetimeIndex\` permite seleccionar por texto parcial y remuestrear.
- \`resample("ME")\` agrupa por periodos; recuerda los alias de pandas 3 (\`ME\`, \`QE\`, \`YE\`, \`h\`).
- \`rolling\` para ventanas móviles; \`shift\`, \`diff\` y \`pct_change\` para comparar con el pasado.
- Ordena siempre por fecha antes de usar \`shift\` o \`rolling\`.

## Siguiente paso

Llegó la hora del **Nivel experto**: estilo profesional, rendimiento y los errores que separan a un novato de un maestro panda.`,
    },
  ],
};
