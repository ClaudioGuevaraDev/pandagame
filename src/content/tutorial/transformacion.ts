import type { Lesson } from "../types.ts";

export const transformacion: Lesson = {
  slug: "transformacion",
  module: 3,
  title: "Transformación",
  summary: "Crea y modifica columnas con operaciones vectorizadas, assign, map/apply, .str, astype, rename y ordena.",
  relatedChallenges: ["facil-6", "facil-7", "facil-8", "medio-4", "medio-5"],
  blocks: [
    {
      type: "markdown",
      content: `## Columnas calculadas

Las operaciones entre columnas son **vectorizadas**: se aplican a todas las filas a la vez, sin bucles. Para crear una columna basta con asignarla:

\`\`\`python
df["peso_lb"] = df["peso_kg"] * 2.2046
\`\`\`

Esto es mucho más rápido (y más corto) que recorrer las filas con un \`for\`.`,
    },
    {
      type: "code",
      title: "Nueva columna a partir de otras",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "peso_kg": [80.5, 110.0, 45.2],
    "bambu_kg_dia": [12, 18, 8],
})
df["peso_lb"] = (df["peso_kg"] * 2.2046).round(1)
df["bambu_pct_peso"] = df["bambu_kg_dia"] / df["peso_kg"] * 100
df`,
    },
    {
      type: "markdown",
      content: `## assign: crear columnas sin modificar el original

\`df.assign(...)\` devuelve un **DataFrame nuevo** con las columnas añadidas. Es la base del estilo "encadenado" (*method chaining*) que veremos en el módulo experto. Puedes pasar una \`lambda\` que recibe el DataFrame intermedio, útil para referirte a columnas creadas en el mismo paso.`,
    },
    {
      type: "code",
      title: "assign",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": [4, 7, 2],
    "peso_kg": [80.5, 110.0, 45.2],
})
nuevo = df.assign(
    adulto=df["edad"] >= 5,
    peso_por_anio=lambda d: d["peso_kg"] / d["edad"],
)
print("Columnas originales:", list(df.columns))
nuevo`,
    },
    {
      type: "markdown",
      content: `## map y apply

- \`serie.map(dict_o_funcion)\`: transforma **cada valor** de una Series. Con un diccionario es perfecto para "traducir" códigos.
- \`serie.apply(funcion)\`: parecido a \`map\` con una función.
- \`df.apply(funcion, axis=1)\`: aplica la función a **cada fila** (recibe una Series con la fila). Es flexible pero **lento**: úsalo solo cuando no haya alternativa vectorizada.`,
    },
    {
      type: "code",
      title: "map con diccionario y función",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "reserva": ["CD", "WL", "CD", "YA"],
    "edad": [4, 7, 2, 10],
})
nombres = {"CD": "Chengdu", "WL": "Wolong", "YA": "Ya'an"}
df["reserva"] = df["reserva"].map(nombres)
df["etapa"] = df["edad"].map(lambda e: "cachorro" if e < 3 else "adulto")
df`,
    },
    {
      type: "code",
      title: "apply por filas (axis=1)",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": [4, 7, 2],
    "peso_kg": [80.5, 110.0, 45.2],
})

def ficha(fila):
    return f"{fila['nombre']} ({fila['edad']} años, {fila['peso_kg']} kg)"

df["ficha"] = df.apply(ficha, axis=1)
df`,
    },
    {
      type: "markdown",
      content: `## Texto con .str

Las columnas de texto tienen el accesor \`.str\`, que aplica métodos de cadena a toda la columna: \`lower\`, \`upper\`, \`title\`, \`strip\`, \`replace\`, \`contains\`, \`startswith\`, \`len\`, \`split\`, \`slice\`…

En pandas 3 las columnas de texto son de tipo \`str\` por defecto, y los valores faltantes se mantienen como faltantes al usar \`.str\`.`,
    },
    {
      type: "code",
      title: "Limpiar texto",
      code: `import pandas as pd

df = pd.DataFrame({"nombre": ["  mei ", "BAO", "lin lin", " Tao"]})
df["limpio"] = df["nombre"].str.strip().str.title()
df["largo"] = df["limpio"].str.len()
df["inicial"] = df["limpio"].str[0]
df["doble"] = df["limpio"].str.contains(" ")
df`,
    },
    {
      type: "code",
      title: "split en columnas",
      code: `import pandas as pd

df = pd.DataFrame({"codigo": ["CD-2019-Mei", "WL-2016-Bao", "CD-2021-Lin"]})
partes = df["codigo"].str.split("-", expand=True)
partes.columns = ["reserva", "anio", "nombre"]
partes["anio"] = partes["anio"].astype(int)
partes`,
    },
    {
      type: "markdown",
      content: `## Tipos con astype

\`astype\` convierte una columna a otro tipo: \`int\`, \`float\`, \`str\`, \`bool\`, \`"category"\`… Si la conversión puede fallar (por ejemplo texto como \`"n/d"\`), usa \`pd.to_numeric(col, errors="coerce")\`, que convierte lo inválido en \`NaN\`.`,
    },
    {
      type: "code",
      title: "astype y to_numeric",
      code: `import pandas as pd

df = pd.DataFrame({"edad": ["4", "7", "2"], "peso": ["80.5", "n/d", "45.2"]})
df["edad"] = df["edad"].astype(int)
df["peso"] = pd.to_numeric(df["peso"], errors="coerce")
print(df.dtypes)
df`,
    },
    {
      type: "markdown",
      content: `## Renombrar y eliminar

- \`df.rename(columns={"viejo": "nuevo"})\` renombra columnas (y \`index=\` filas).
- \`df.drop(columns=["a", "b"])\` elimina columnas; \`df.drop(index=[...])\` filas.
- Ambos devuelven un DataFrame nuevo: **reasigna** el resultado (\`df = df.rename(...)\`).`,
    },
    {
      type: "code",
      title: "rename y drop",
      code: `import pandas as pd

df = pd.DataFrame({
    "Nombre Panda": ["Mei", "Bao"],
    "Edad (años)": [4, 7],
    "tmp": [0, 0],
})
df = df.rename(columns={"Nombre Panda": "nombre", "Edad (años)": "edad"}).drop(columns=["tmp"])
# Truco: normalizar todos los nombres de una vez
df.columns = df.columns.str.lower().str.replace(" ", "_")
df`,
    },
    {
      type: "markdown",
      content: `## Ordenar

- \`df.sort_values("col")\`: ordena por una columna. \`ascending=False\` para descendente.
- Con varias columnas: \`sort_values(["a", "b"], ascending=[True, False])\`.
- \`df.sort_index()\` ordena por el índice.
- \`nlargest(n, "col")\` / \`nsmallest\` son atajos para "los n mayores".`,
    },
    {
      type: "code",
      title: "sort_values con varias claves",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1],
})
print(df.nlargest(2, "peso_kg"))
df.sort_values(["reserva", "peso_kg"], ascending=[True, False]).reset_index(drop=True)`,
    },
    {
      type: "markdown",
      content: `## Resumen

- Prefiere operaciones vectorizadas: \`df["c"] = df["a"] * df["b"]\`.
- \`assign\` crea columnas devolviendo un DataFrame nuevo.
- \`map\` traduce valores; \`apply(axis=1)\` es flexible pero lento.
- \`.str\` para texto, \`astype\` / \`to_numeric\` para tipos.
- \`rename\`, \`drop\`, \`sort_values\`, \`nlargest\` y \`reset_index(drop=True)\`.

## Siguiente paso

Los datos reales vienen sucios. En **Limpieza** aprenderás a tratar nulos, duplicados y valores raros.`,
    },
  ],
};
