import type { Lesson } from "../types.ts";

export const reestructurar: Lesson = {
  slug: "reestructurar",
  module: 7,
  title: "Reestructurar",
  summary: "Formato largo y ancho: pivot, pivot_table, melt, stack/unstack, MultiIndex, cut y qcut.",
  relatedChallenges: ["dificil-1", "dificil-2", "dificil-3", "dificil-8"],
  blocks: [
    {
      type: "markdown",
      content: `## Largo vs ancho

Los mismos datos pueden tener dos formas:

- **Largo** (*tidy*): una fila por observación. Ideal para analizar, agrupar y graficar.
- **Ancho**: una fila por entidad y una columna por variable/periodo. Ideal para leer y reportar.

| Para ir de… | Usa |
|---|---|
| largo → ancho | \`pivot\`, \`pivot_table\`, \`unstack\` |
| ancho → largo | \`melt\`, \`stack\` |`,
    },
    {
      type: "code",
      title: "pivot: largo a ancho",
      code: `import pandas as pd

largo = pd.DataFrame({
    "panda": ["Mei", "Mei", "Mei", "Bao", "Bao", "Bao"],
    "mes": ["ene", "feb", "mar", "ene", "feb", "mar"],
    "bambu_kg": [350, 330, 360, 520, 500, 540],
})
largo.pivot(index="panda", columns="mes", values="bambu_kg")`,
    },
    {
      type: "markdown",
      content: `\`pivot\` solo reorganiza: falla si hay **combinaciones repetidas** de índice/columna. Cuando hay repetidos necesitas **agregar**: para eso está \`pivot_table\`.

## pivot_table

\`pivot_table(index=..., columns=..., values=..., aggfunc=...)\` agrupa y pivota a la vez. Parámetros útiles:

- \`aggfunc\`: \`"mean"\` (por defecto), \`"sum"\`, \`"count"\`, una lista…
- \`fill_value=0\`: rellena combinaciones vacías.
- \`margins=True\`: añade totales.`,
    },
    {
      type: "code",
      title: "pivot_table con agregación",
      code: `import pandas as pd

ventas = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Wolong", "Chengdu", "Ya'an"],
    "producto": ["peluche", "taza", "peluche", "peluche", "peluche", "taza"],
    "unidades": [10, 4, 7, 3, 5, 8],
})
ventas.pivot_table(index="reserva", columns="producto", values="unidades",
                   aggfunc="sum", fill_value=0, margins=True, margins_name="Total")`,
    },
    {
      type: "markdown",
      content: `## melt: ancho a largo

\`melt\` "derrite" columnas en filas:

- \`id_vars\`: columnas que se mantienen como identificadores.
- \`value_vars\`: columnas a derretir (por defecto, todas las demás).
- \`var_name\` / \`value_name\`: nombres de las nuevas columnas.`,
    },
    {
      type: "code",
      title: "melt",
      code: `import pandas as pd

ancho = pd.DataFrame({
    "panda": ["Mei", "Bao"],
    "ene": [350, 520],
    "feb": [330, 500],
    "mar": [360, 540],
})
largo = ancho.melt(id_vars="panda", var_name="mes", value_name="bambu_kg")
largo.sort_values(["panda", "mes"]).reset_index(drop=True)`,
    },
    {
      type: "markdown",
      content: `## MultiIndex

Un **MultiIndex** es un índice con varios niveles. Aparece naturalmente al agrupar por varias columnas. Puedes seleccionar con tuplas en \`loc\` o con \`xs\` (*cross-section*) para un nivel concreto.`,
    },
    {
      type: "code",
      title: "Trabajar con MultiIndex",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Wolong", "Chengdu", "Wolong"],
    "anio": [2023, 2024, 2023, 2024, 2024, 2024],
    "nacimientos": [3, 4, 2, 5, 1, 2],
})
s = df.groupby(["reserva", "anio"])["nacimientos"].sum()
print(s.index.names)
print("Chengdu 2024:", s.loc[("Chengdu", 2024)])
print(s.xs(2024, level="anio"))
s`,
    },
    {
      type: "markdown",
      content: `## stack y unstack

- \`unstack()\` mueve el **último nivel del índice** a las columnas (largo → ancho).
- \`stack()\` hace lo contrario: mueve columnas al índice (ancho → largo).

Puedes indicar qué nivel mover: \`unstack("anio")\` o \`unstack(0)\`.`,
    },
    {
      type: "code",
      title: "unstack y stack",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Wolong"],
    "anio": [2023, 2024, 2023, 2024],
    "nacimientos": [3, 4, 2, 5],
})
s = df.set_index(["reserva", "anio"])["nacimientos"]
tabla = s.unstack("anio")
print(tabla)
print()
tabla.stack()`,
    },
    {
      type: "code",
      title: "Aplanar columnas MultiIndex",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Wolong"],
    "peso_kg": [80.5, 45.2, 110.0, 120.3],
})
r = df.groupby("reserva").agg({"peso_kg": ["mean", "max"]})
print(r.columns.tolist())
r.columns = ["_".join(col) for col in r.columns]
r.reset_index()`,
    },
    {
      type: "markdown",
      content: `## cut y qcut: de números a categorías

- \`pd.cut(serie, bins, labels)\`: corta en intervalos **que tú defines** (ej. edades 0–2, 3–5, 6+).
- \`pd.qcut(serie, q, labels)\`: corta en **cuantiles**, de forma que cada grupo tenga aproximadamente el mismo número de elementos.

El resultado es de tipo \`category\` ordenado, perfecto para combinarlo con \`groupby\` o \`crosstab\`.`,
    },
    {
      type: "code",
      title: "cut con límites propios",
      code: `import pandas as pd

df = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
                   "edad": [4, 7, 1, 15, 5, 22]})
df["etapa"] = pd.cut(df["edad"], bins=[0, 2, 6, 15, 100],
                     labels=["cachorro", "joven", "adulto", "anciano"])
df`,
    },
    {
      type: "code",
      title: "qcut en cuartiles",
      code: `import pandas as pd

pesos = pd.Series([80.5, 110.0, 45.2, 120.3, 95.1, 60.0, 101.4, 70.2], name="peso_kg")
grupos = pd.qcut(pesos, q=4, labels=["Q1", "Q2", "Q3", "Q4"])
pd.DataFrame({"peso_kg": pesos, "cuartil": grupos}).sort_values("peso_kg")`,
    },
    {
      type: "markdown",
      content: `## Resumen

- Formato largo para analizar, ancho para presentar.
- \`pivot\` reorganiza; \`pivot_table\` además agrega (con \`fill_value\` y \`margins\`).
- \`melt\` y \`stack\` pasan de ancho a largo; \`unstack\` de largo a ancho.
- Selecciona en un MultiIndex con tuplas o \`xs\`; aplana columnas con \`"_".join\`.
- \`cut\` usa límites fijos; \`qcut\` usa cuantiles.

## Siguiente paso

En **Series temporales** trabajarás con fechas: remuestreos, ventanas móviles y variaciones.`,
    },
  ],
};
