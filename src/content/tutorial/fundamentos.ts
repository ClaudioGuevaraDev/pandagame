import type { Lesson } from "../types.ts";

export const fundamentos: Lesson = {
  slug: "fundamentos",
  module: 1,
  title: "Fundamentos",
  summary: "Qué es Pandas, Series y DataFrames, y cómo echar el primer vistazo a tus datos.",
  relatedChallenges: ["facil-1", "facil-2"],
  blocks: [
    {
      type: "markdown",
      content: `## ¿Qué es Pandas?

**Pandas** es la librería de Python para trabajar con datos tabulares: hojas de cálculo, tablas SQL, CSV, JSON… Se apoya en **NumPy** y te da dos estructuras principales:

| Estructura | Qué es | Analogía |
|---|---|---|
| \`Series\` | Una columna de datos con etiquetas (índice) | Una columna de Excel |
| \`DataFrame\` | Una tabla: varias \`Series\` que comparten índice | Una hoja de Excel completa |

Por convención siempre se importa así:

\`\`\`python
import pandas as pd
\`\`\`

> En este juego usamos **pandas 3**, que trae novedades como *Copy-on-Write* activado por defecto y un tipo \`str\` dedicado para texto. Las verás a lo largo del tutorial.

Cada bloque de código de esta página se puede **editar y ejecutar**. Si la última línea es una expresión (por ejemplo \`df\`), verás su valor como una tabla.`,
    },
    {
      type: "code",
      title: "Tu primera Series",
      code: `import pandas as pd

edades = pd.Series([4, 7, 2, 10], name="edad")
edades`,
    },
    {
      type: "markdown",
      content: `## El índice

Toda \`Series\` tiene un **índice**: las etiquetas de cada valor. Si no indicas ninguno, Pandas usa \`0, 1, 2, …\`. Puedes poner etiquetas propias y luego acceder por ellas, como en un diccionario.`,
    },
    {
      type: "code",
      title: "Series con índice propio",
      code: `import pandas as pd

pesos = pd.Series([80.5, 110.0, 45.2], index=["Mei", "Bao", "Lin"], name="peso_kg")
print("Peso de Bao:", pesos["Bao"])
print("Media:", pesos.mean())
pesos`,
    },
    {
      type: "markdown",
      content: `## Crear un DataFrame

La forma más habitual es un **diccionario de listas**: cada clave es una columna. También puedes partir de una **lista de diccionarios** (cada diccionario es una fila), muy común cuando los datos vienen de una API en JSON.`,
    },
    {
      type: "code",
      title: "DataFrame desde un diccionario",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, 7, 2, 10],
    "comida": ["bambú", "manzana", "bambú", "zanahoria"],
})
df`,
    },
    {
      type: "code",
      title: "DataFrame desde una lista de filas",
      code: `import pandas as pd

filas = [
    {"nombre": "Mei", "reserva": "Chengdu", "peso_kg": 80.5},
    {"nombre": "Bao", "reserva": "Wolong", "peso_kg": 110.0},
    {"nombre": "Lin", "reserva": "Chengdu"},  # le falta peso_kg -> NaN
]
pd.DataFrame(filas)`,
    },
    {
      type: "markdown",
      content: `Fíjate en que a Lin le faltaba \`peso_kg\` y Pandas lo rellenó con \`NaN\` (*Not a Number*), el marcador de **valor faltante**. Lo trataremos a fondo en el módulo de limpieza.

## Echar un vistazo a los datos

Antes de analizar, **mira**. Estos métodos son los que usarás siempre al recibir datos nuevos:

| Método / atributo | Devuelve |
|---|---|
| \`df.head(n)\` / \`df.tail(n)\` | Las primeras / últimas \`n\` filas (5 por defecto) |
| \`df.shape\` | Tupla \`(filas, columnas)\` |
| \`df.columns\` | Los nombres de las columnas |
| \`df.dtypes\` | El tipo de dato de cada columna |
| \`df.info()\` | Resumen: tipos, no-nulos y memoria |
| \`df.describe()\` | Estadísticas de las columnas numéricas |`,
    },
    {
      type: "code",
      title: "head, shape y columns",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Hua"],
    "edad": [4, 7, 2, 10, 5, 3, 8],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0, 101.4],
})
print("Forma:", df.shape)
print("Columnas:", list(df.columns))
df.head(3)`,
    },
    {
      type: "code",
      title: "dtypes e info()",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": [4, 7, 2],
    "peso_kg": [80.5, 110.0, None],
    "vacunado": [True, False, True],
})
df.info()
df.dtypes`,
    },
    {
      type: "markdown",
      content: `Los tipos más comunes son:

- \`int64\`: enteros.
- \`float64\`: decimales (y cualquier columna numérica con \`NaN\`).
- \`bool\`: verdadero/falso.
- \`str\`: texto. **Novedad de pandas 3**: antes el texto se guardaba como \`object\`; ahora tiene su propio tipo, más rápido y seguro.
- \`datetime64[ns]\`: fechas y horas.
- \`category\`: texto con pocos valores repetidos (lo veremos en el módulo experto).`,
    },
    {
      type: "code",
      title: "describe(): estadísticas rápidas",
      code: `import pandas as pd

df = pd.DataFrame({
    "edad": [4, 7, 2, 10, 5, 3, 8],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0, 101.4],
})
df.describe()`,
    },
    {
      type: "markdown",
      content: `## Acceder a una columna

\`df["columna"]\` devuelve una \`Series\`. Sobre ella puedes llamar a métodos como \`mean()\`, \`max()\`, \`min()\`, \`sum()\`… Con dobles corchetes \`df[["a", "b"]]\` obtienes un DataFrame con varias columnas.`,
    },
    {
      type: "code",
      title: "Columnas y operaciones básicas",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, 7, 2, 10],
    "peso_kg": [80.5, 110.0, 45.2, 120.3],
})
print("Edad media:", df["edad"].mean())
print("Panda más pesado:", df["peso_kg"].max(), "kg")
df[["nombre", "peso_kg"]]`,
    },
    {
      type: "markdown",
      content: `## Leer archivos

En proyectos reales casi nunca escribes los datos a mano: los lees. Las funciones \`pd.read_*\` cubren la mayoría de formatos:

\`\`\`python
df = pd.read_csv("pandas.csv")          # CSV
df = pd.read_excel("pandas.xlsx")       # Excel
df = pd.read_json("pandas.json")        # JSON
df = pd.read_parquet("pandas.parquet")  # Parquet (rápido y compacto)
\`\`\`

Y para guardar: \`df.to_csv("salida.csv", index=False)\`, \`df.to_parquet(...)\`, etc.`,
    },
    {
      type: "code",
      title: "Leer un CSV desde texto",
      code: `import io
import pandas as pd

csv = io.StringIO("""nombre,edad,reserva
Mei,4,Chengdu
Bao,7,Wolong
Lin,2,Chengdu""")
df = pd.read_csv(csv)
df`,
    },
    {
      type: "markdown",
      content: `## Resumen

- Una \`Series\` es una columna con índice; un \`DataFrame\` es una tabla de Series.
- Crea DataFrames con \`pd.DataFrame(dict)\` o con una lista de filas.
- Explora siempre con \`head\`, \`shape\`, \`dtypes\`, \`info\` y \`describe\`.
- \`df["col"]\` da una Series; \`df[["a", "b"]]\` un DataFrame.

## Siguiente paso

Ya sabes crear y mirar datos. En **Selección** aprenderás a quedarte exactamente con las filas y columnas que te interesan.`,
    },
  ],
};
