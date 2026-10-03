import type { Lesson } from "../types.ts";

export const experto: Lesson = {
  slug: "experto",
  module: 9,
  title: "Nivel experto",
  summary: "Method chaining y pipe, vectorización, memoria y rendimiento, Copy-on-Write, ranking y errores comunes.",
  relatedChallenges: ["dificil-7", "dificil-9", "dificil-10"],
  blocks: [
    {
      type: "markdown",
      content: `## Method chaining

El código de un experto se lee **de arriba a abajo como una receta**. En lugar de crear variables intermedias (\`df2\`, \`df3\`, \`df_final\`…), encadena métodos que devuelven DataFrames nuevos:

\`\`\`python
resultado = (
    df
    .query("edad >= 2")
    .assign(peso_lb=lambda d: d["peso_kg"] * 2.2)
    .groupby("reserva", as_index=False)
    .agg(peso_medio=("peso_lb", "mean"))
    .sort_values("peso_medio", ascending=False)
)
\`\`\`

Claves: paréntesis exteriores para poder partir líneas, \`assign\` con \`lambda\` para usar columnas recién creadas, y \`query\` para filtrar.`,
    },
    {
      type: "code",
      title: "Una cadena completa",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Hua"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Ya'an"],
    "edad": [4, 7, 1, 10, 5, 3, 8],
    "peso_kg": [80.5, 110.0, 25.2, 120.3, 95.1, 60.0, 101.4],
})
(
    df
    .query("edad >= 2")
    .assign(peso_lb=lambda d: (d["peso_kg"] * 2.2046).round(1))
    .groupby("reserva", as_index=False)
    .agg(pandas=("nombre", "count"), peso_medio_lb=("peso_lb", "mean"))
    .sort_values("peso_medio_lb", ascending=False)
    .reset_index(drop=True)
)`,
    },
    {
      type: "markdown",
      content: `## pipe: tus propias funciones en la cadena

\`df.pipe(func, *args)\` equivale a \`func(df, *args)\`, pero te permite meter funciones propias en mitad de una cadena. Así construyes **pipelines** reutilizables y testeables, con una función por paso.`,
    },
    {
      type: "code",
      title: "Pipeline con pipe",
      code: `import pandas as pd

def limpiar_nombres(df):
    return df.assign(nombre=df["nombre"].str.strip().str.title())

def quitar_atipicos(df, col, minimo, maximo):
    return df[df[col].between(minimo, maximo)]

def resumir(df):
    return df.groupby("reserva", as_index=False)["peso_kg"].mean()

crudo = pd.DataFrame({
    "nombre": [" mei", "BAO ", "lin", "tao"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong"],
    "peso_kg": [80.5, 110.0, 900.0, 120.3],
})
(
    crudo
    .pipe(limpiar_nombres)
    .pipe(quitar_atipicos, "peso_kg", 20, 200)
    .pipe(resumir)
)`,
    },
    {
      type: "markdown",
      content: `## Vectorización vs apply vs bucles

Regla de oro: **si existe una operación vectorizada, úsala**. De más rápido a más lento:

1. Operaciones vectorizadas de Pandas/NumPy (\`df["a"] * 2\`, \`np.where\`, \`.str\`, \`.dt\`).
2. \`map\` con diccionario.
3. \`apply\` con función de Python.
4. Bucles \`for\` / \`iterrows\` (casi nunca necesarios).

Para condiciones, \`np.where(cond, si, no)\` y \`np.select([conds], [valores], default)\` sustituyen a la mayoría de \`apply\` con \`if\`.`,
    },
    {
      type: "code",
      title: "Midiendo la diferencia",
      code: `import time
import numpy as np
import pandas as pd

n = 200_000
df = pd.DataFrame({"peso_kg": np.random.default_rng(1).uniform(20, 150, n)})

t = time.perf_counter()
a = df["peso_kg"].apply(lambda p: "grande" if p > 100 else "normal")
t_apply = time.perf_counter() - t

t = time.perf_counter()
b = np.where(df["peso_kg"] > 100, "grande", "normal")
t_vec = time.perf_counter() - t

print(f"apply:     {t_apply * 1000:.1f} ms")
print(f"np.where:  {t_vec * 1000:.1f} ms")
print("¿Mismo resultado?", (a.to_numpy() == b).all())`,
    },
    {
      type: "code",
      title: "np.select para varias condiciones",
      code: `import numpy as np
import pandas as pd

df = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin", "Tao"], "edad": [4, 7, 1, 16]})
condiciones = [df["edad"] < 2, df["edad"] < 6, df["edad"] < 15]
etapas = ["cachorro", "joven", "adulto"]
df["etapa"] = np.select(condiciones, etapas, default="anciano")
df`,
    },
    {
      type: "markdown",
      content: `## Memoria: tipos adecuados

En tablas grandes, elegir bien los tipos puede reducir la memoria drásticamente:

- \`category\` para texto con pocos valores distintos.
- Enteros pequeños (\`int8\`, \`int16\`…) con \`pd.to_numeric(col, downcast="integer")\`.
- \`df.memory_usage(deep=True)\` para medir.

También \`df.eval("c = a * b")\` y \`df.query(...)\` pueden ser más eficientes y legibles en expresiones largas.`,
    },
    {
      type: "code",
      title: "Ahorrar memoria",
      code: `import numpy as np
import pandas as pd

n = 100_000
rng = np.random.default_rng(2)
df = pd.DataFrame({
    "reserva": rng.choice(["Chengdu", "Wolong", "Ya'an"], n),
    "edad": rng.integers(0, 30, n),
})
antes = df.memory_usage(deep=True).sum() / 1e6
optim = df.assign(
    reserva=df["reserva"].astype("category"),
    edad=pd.to_numeric(df["edad"], downcast="integer"),
)
despues = optim.memory_usage(deep=True).sum() / 1e6
print(f"Antes: {antes:.2f} MB  ->  Después: {despues:.2f} MB")
optim.dtypes`,
    },
    {
      type: "markdown",
      content: `## Copy-on-Write (pandas 3)

En pandas 3, **Copy-on-Write** (CoW) está activado siempre. Consecuencias:

- Cualquier subconjunto (\`df[...]\`, \`df["col"]\`, \`loc\`…) **se comporta como una copia**: modificarlo nunca altera el DataFrame original.
- La **asignación encadenada** ya no funciona: \`df[df["edad"] > 5]["peso"] = 0\` no modifica \`df\`. Usa \`df.loc[mascara, "peso"] = 0\`.
- Adiós al famoso \`SettingWithCopyWarning\` y a muchos \`.copy()\` defensivos.

Internamente Pandas solo copia los datos cuando realmente modificas algo, así que es más rápido además de más seguro.`,
    },
    {
      type: "code",
      title: "Asignar bien con loc",
      code: `import pandas as pd

df = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin"], "edad": [4, 7, 1], "dieta": ["normal"] * 3})

sub = df[df["edad"] < 2]
sub.loc[:, "dieta"] = "leche"         # modifica solo 'sub' (es una copia)
print(df)
print()
df.loc[df["edad"] < 2, "dieta"] = "leche"   # forma correcta de modificar df
df`,
    },
    {
      type: "markdown",
      content: `## Ranking y top-N por grupo

- \`rank()\` asigna posiciones; el parámetro \`method\` decide qué hacer con empates (\`"min"\`, \`"dense"\`, \`"first"\`…).
- Top-N por grupo: ordena y usa \`groupby(...).head(n)\`, o filtra por \`rank <= n\`.`,
    },
    {
      type: "code",
      title: "rank con empates",
      code: `import pandas as pd

df = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"], "puntos": [90, 85, 90, 70, 85]})
df["rank_min"] = df["puntos"].rank(method="min", ascending=False).astype(int)
df["rank_dense"] = df["puntos"].rank(method="dense", ascending=False).astype(int)
df["rank_first"] = df["puntos"].rank(method="first", ascending=False).astype(int)
df.sort_values("rank_first")`,
    },
    {
      type: "code",
      title: "Top 2 pandas más pesados por reserva",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Hua"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong", "Wolong", "Chengdu", "Chengdu"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0, 101.4],
})
(
    df
    .sort_values("peso_kg", ascending=False)
    .groupby("reserva")
    .head(2)
    .sort_values(["reserva", "peso_kg"], ascending=[True, False])
    .reset_index(drop=True)
)`,
    },
    {
      type: "markdown",
      content: `## Errores comunes (y cómo evitarlos)

| Error | Solución |
|---|---|
| Usar \`and\` / \`or\` con Series | \`&\`, \`\\|\`, \`~\` y paréntesis |
| Asignación encadenada \`df[m]["c"] = x\` | \`df.loc[m, "c"] = x\` |
| Olvidar reasignar: \`df.dropna()\` sin \`df = ...\` | Los métodos devuelven un DataFrame nuevo |
| Comparar con \`NaN\` usando \`==\` | \`isna()\` / \`notna()\` |
| Merge que multiplica filas | \`validate="many_to_one"\` y revisar claves duplicadas |
| \`shift\`/\`rolling\` sin ordenar | \`sort_values\` por fecha (y por grupo) antes |
| Bucles \`for\` con \`iterrows\` | Operaciones vectorizadas, \`np.where\`, \`map\` |
| Índice desordenado tras filtrar | \`reset_index(drop=True)\` |

## Buenas prácticas

- Explora primero (\`info\`, \`describe\`, \`value_counts\`), transforma después.
- Una función por paso + \`pipe\` = código testeable.
- Nombres de columnas en \`snake_case\`, sin espacios.
- Valida tus supuestos con \`assert\` (ej. \`assert df["id"].is_unique\`).`,
    },
    {
      type: "code",
      title: "Validar supuestos con assert",
      code: `import pandas as pd

df = pd.DataFrame({"id": [1, 2, 3], "peso_kg": [80.5, 110.0, 45.2]})
assert df["id"].is_unique, "Hay ids duplicados"
assert df["peso_kg"].between(10, 200).all(), "Pesos fuera de rango"
assert df.notna().all().all(), "Hay valores nulos"
print("Todas las validaciones pasaron ✔")
df`,
    },
    {
      type: "markdown",
      content: `## Resumen

- Encadena métodos y usa \`pipe\` para pipelines legibles y reutilizables.
- Vectoriza: \`np.where\` / \`np.select\` antes que \`apply\`, y \`apply\` antes que bucles.
- \`category\` y \`downcast\` ahorran memoria.
- Con Copy-on-Write, modifica siempre con \`df.loc[mascara, col] = valor\`.
- \`rank\` y \`groupby().head(n)\` para rankings y top-N.

## Siguiente paso

¡Ya tienes las herramientas de un maestro panda! Pon a prueba todo lo aprendido en los retos de la **Cumbre del Maestro Panda**.`,
    },
  ],
};
