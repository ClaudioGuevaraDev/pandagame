import type { Lesson } from "../types.ts";

export const agregacion: Lesson = {
  slug: "agregacion",
  module: 5,
  title: "Agregación",
  summary: "Resume datos con value_counts, groupby, agg con nombres, transform, filter y crosstab.",
  relatedChallenges: ["facil-9", "facil-10", "medio-6", "medio-7", "dificil-4"],
  blocks: [
    {
      type: "markdown",
      content: `## Resúmenes rápidos

Antes de \`groupby\`, recuerda los agregados sobre una columna: \`sum\`, \`mean\`, \`median\`, \`min\`, \`max\`, \`count\`, \`std\`, \`nunique\`…

Y dos joyas para columnas categóricas:

- \`value_counts()\`: cuántas veces aparece cada valor (ordenado de mayor a menor). Con \`normalize=True\` da proporciones.
- \`unique()\` / \`nunique()\`: los valores distintos y cuántos son.`,
    },
    {
      type: "code",
      title: "value_counts",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
})
print("Reservas distintas:", df["reserva"].nunique(), df["reserva"].unique())
print(df["reserva"].value_counts(normalize=True).round(2))
df["reserva"].value_counts()`,
    },
    {
      type: "markdown",
      content: `## groupby: dividir, aplicar, combinar

\`groupby\` sigue el patrón **split-apply-combine**:

1. **Divide** las filas en grupos según una o más columnas.
2. **Aplica** una función a cada grupo (suma, media…).
3. **Combina** los resultados en una nueva tabla.

\`\`\`python
df.groupby("reserva")["peso_kg"].mean()
\`\`\`

Se lee: "agrupa por reserva, toma la columna peso y calcula la media de cada grupo".`,
    },
    {
      type: "code",
      title: "groupby básico",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
    "bambu_kg": [12, 18, 8, 20, 15, 10],
})
df.groupby("reserva")[["peso_kg", "bambu_kg"]].mean()`,
    },
    {
      type: "markdown",
      content: `## Varias funciones y agregación con nombres

\`agg\` permite aplicar varias funciones. La forma más clara es la **agregación con nombres** (*named aggregation*): cada argumento es \`nombre_resultado=(columna, función)\`. Obtienes columnas planas con los nombres que tú elijas.

Usa \`as_index=False\` o \`.reset_index()\` para que las claves del grupo vuelvan a ser columnas normales.`,
    },
    {
      type: "code",
      title: "agg con varias funciones",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
})
df.groupby("reserva")["peso_kg"].agg(["count", "mean", "max"])`,
    },
    {
      type: "code",
      title: "Named aggregation",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
    "bambu_kg": [12, 18, 8, 20, 15, 10],
})
resumen = df.groupby("reserva", as_index=False).agg(
    pandas=("nombre", "count"),
    peso_medio=("peso_kg", "mean"),
    bambu_total=("bambu_kg", "sum"),
    mas_pesado=("peso_kg", "max"),
)
resumen.sort_values("pandas", ascending=False)`,
    },
    {
      type: "code",
      title: "Agrupar por varias columnas",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Wolong", "Chengdu", "Wolong"],
    "sexo": ["H", "M", "H", "H", "H", "M"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
})
df.groupby(["reserva", "sexo"], as_index=False)["peso_kg"].mean()`,
    },
    {
      type: "markdown",
      content: `## transform: el resultado del grupo en cada fila

\`agg\` **reduce** cada grupo a una fila. \`transform\` devuelve un resultado **del mismo tamaño que el original**: cada fila recibe el valor calculado para su grupo. Es perfecto para:

- Comparar cada fila con la media de su grupo.
- Calcular porcentajes sobre el total del grupo.
- Rellenar nulos con la media del grupo.`,
    },
    {
      type: "code",
      title: "transform",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong", "Wolong", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
})
g = df.groupby("reserva")["peso_kg"]
df["media_reserva"] = g.transform("mean").round(1)
df["dif_media"] = (df["peso_kg"] - df["media_reserva"]).round(1)
df["pct_reserva"] = (df["peso_kg"] / g.transform("sum") * 100).round(1)
df`,
    },
    {
      type: "markdown",
      content: `## filter: quedarte con grupos enteros

\`groupby(...).filter(func)\` conserva las filas de los grupos para los que \`func(grupo)\` es \`True\`. Ejemplo: "solo reservas con al menos 3 pandas".`,
    },
    {
      type: "code",
      title: "filter",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
})
df.groupby("reserva").filter(lambda g: len(g) >= 3)`,
    },
    {
      type: "markdown",
      content: `## crosstab: tablas de contingencia

\`pd.crosstab(filas, columnas)\` cuenta combinaciones de dos variables. Con \`normalize="index"\` obtienes proporciones por fila y con \`margins=True\` los totales.`,
    },
    {
      type: "code",
      title: "crosstab",
      code: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Ya'an"],
    "comida": ["bambú", "bambú", "manzana", "bambú", "zanahoria", "bambú", "manzana"],
})
pd.crosstab(df["reserva"], df["comida"], margins=True, margins_name="Total")`,
    },
    {
      type: "markdown",
      content: `## Resumen

- \`value_counts\`, \`unique\` y \`nunique\` para columnas categóricas.
- \`groupby(col)[col2].func()\` para agregados por grupo.
- \`agg(nombre=(col, func))\` da resultados limpios y con nombres claros.
- \`transform\` mantiene el tamaño original; \`filter\` elimina grupos enteros.
- \`crosstab\` cuenta combinaciones de dos variables.

## Siguiente paso

Tus datos casi nunca están en una sola tabla. En **Combinar datos** aprenderás \`merge\` y \`concat\`.`,
    },
  ],
};
