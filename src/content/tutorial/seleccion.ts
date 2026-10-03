import type { Lesson } from "../types.ts";

export const seleccion: Lesson = {
  slug: "seleccion",
  module: 2,
  title: "Selección",
  summary: "Elige filas y columnas con [], loc, iloc, máscaras booleanas, query, isin y between.",
  relatedChallenges: ["facil-3", "facil-4", "facil-5"],
  blocks: [
    {
      type: "markdown",
      content: `## Seleccionar columnas

Hay tres formas de quedarte con columnas:

| Código | Resultado |
|---|---|
| \`df["edad"]\` | Una \`Series\` |
| \`df[["nombre", "edad"]]\` | Un \`DataFrame\` (fíjate en los **dobles corchetes**) |
| \`df.edad\` | Una \`Series\` (atajo; no funciona con espacios ni nombres reservados) |

Recomendación: usa siempre corchetes; el atajo con punto es cómodo pero frágil.`,
    },
    {
      type: "code",
      title: "Una columna vs varias",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, 7, 2, 10],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an"],
})
print(type(df["edad"]))
print(type(df[["edad"]]))
df[["nombre", "reserva"]]`,
    },
    {
      type: "markdown",
      content: `## loc e iloc

- \`df.loc[filas, columnas]\` selecciona por **etiqueta** (nombres del índice y de columnas). Los rangos **incluyen** el final.
- \`df.iloc[filas, columnas]\` selecciona por **posición** (enteros, como en una lista). Los rangos **excluyen** el final.

Ambos aceptan un valor, una lista, un rango (\`a:b\`) o \`:\` para "todo".`,
    },
    {
      type: "code",
      title: "loc: por etiqueta",
      code: `import pandas as pd

df = pd.DataFrame(
    {"edad": [4, 7, 2, 10], "peso_kg": [80.5, 110.0, 45.2, 120.3]},
    index=["Mei", "Bao", "Lin", "Tao"],
)
print("Peso de Lin:", df.loc["Lin", "peso_kg"])
df.loc["Bao":"Tao", ["peso_kg"]]   # incluye "Tao"`,
    },
    {
      type: "code",
      title: "iloc: por posición",
      code: `import pandas as pd

df = pd.DataFrame(
    {"edad": [4, 7, 2, 10], "peso_kg": [80.5, 110.0, 45.2, 120.3]},
    index=["Mei", "Bao", "Lin", "Tao"],
)
print("Primera fila, segunda columna:", df.iloc[0, 1])
print("Última fila:")
print(df.iloc[-1])
df.iloc[1:3]   # filas en posición 1 y 2 (excluye la 3)`,
    },
    {
      type: "markdown",
      content: `## Filtrar con máscaras booleanas

Una comparación sobre una columna devuelve una **Series de booleanos** (una *máscara*). Al pasarla entre corchetes, te quedas solo con las filas \`True\`:

\`\`\`python
df[df["edad"] > 5]
\`\`\`

Para combinar condiciones usa \`&\` (y), \`|\` (o) y \`~\` (no), y **encierra cada condición entre paréntesis**. Las palabras \`and\` / \`or\` de Python **no** funcionan con Series.`,
    },
    {
      type: "code",
      title: "La máscara por dentro",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, 7, 2, 10],
})
mascara = df["edad"] > 5
print(mascara)
df[mascara]`,
    },
    {
      type: "code",
      title: "Varias condiciones",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong"],
})
# Pandas de Chengdu O mayores de 8 años
print(df[(df["reserva"] == "Chengdu") | (df["edad"] > 8)])
# Pandas de Wolong Y menores de 6
df[(df["reserva"] == "Wolong") & (df["edad"] < 6)]`,
    },
    {
      type: "markdown",
      content: `## Filtrar y elegir columnas a la vez

\`loc\` acepta una máscara en la parte de filas. Es la forma idiomática de filtrar y seleccionar columnas en un solo paso (y la correcta para **asignar** valores en un subconjunto).`,
    },
    {
      type: "code",
      title: "loc con máscara",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, 7, 2, 10],
    "peso_kg": [80.5, 110.0, 45.2, 120.3],
})
df.loc[df["peso_kg"] > 90, ["nombre", "peso_kg"]]`,
    },
    {
      type: "markdown",
      content: `## isin, between y query

- \`isin([...])\`: ¿el valor está en una lista? Ideal en vez de encadenar muchos \`|\`.
- \`between(a, b)\`: ¿está en el rango \`[a, b]\`? (incluye los extremos por defecto).
- \`query("...")\`: escribe la condición como texto. Muy legible; usa \`@variable\` para referirte a variables de Python.`,
    },
    {
      type: "code",
      title: "isin y between",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong"],
})
print(df[df["reserva"].isin(["Wolong", "Ya'an"])])
print(df[~df["reserva"].isin(["Chengdu"])])   # ~ niega la máscara
df[df["edad"].between(4, 7)]`,
    },
    {
      type: "code",
      title: "query",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1],
})
peso_min = 90
df.query("edad >= 5 and peso_kg > @peso_min")`,
    },
    {
      type: "markdown",
      content: `## Errores comunes

- \`df[df["edad"] > 5 & df["edad"] < 9]\` → error: faltan paréntesis, \`&\` tiene más prioridad que \`>\`.
- \`df[["edad"] > 5]\` → los corchetes van alrededor de la columna, no de la condición.
- \`df.loc[0:2]\` incluye la fila con etiqueta 2; \`df.iloc[0:2]\` no incluye la posición 2.`,
    },
    {
      type: "code",
      title: "Filtrar por texto",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei Mei", "Bao Bao", "Lin", "Tian Tian"],
    "edad": [4, 7, 2, 10],
})
# Nombres que contienen un espacio (nombres "dobles")
df[df["nombre"].str.contains(" ")]`,
    },
    {
      type: "markdown",
      content: `## Resumen

- \`df["a"]\` → Series; \`df[["a", "b"]]\` → DataFrame.
- \`loc\` = etiquetas (rango inclusivo); \`iloc\` = posiciones (rango exclusivo).
- Filtra con máscaras: \`df[cond]\`, combinando con \`&\`, \`|\`, \`~\` y paréntesis.
- \`isin\`, \`between\` y \`query\` hacen los filtros más legibles.

## Siguiente paso

En **Transformación** aprenderás a crear columnas nuevas, ordenar y modificar tus datos.`,
    },
  ],
};
