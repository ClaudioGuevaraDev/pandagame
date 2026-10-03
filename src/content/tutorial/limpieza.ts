import type { Lesson } from "../types.ts";

export const limpieza: Lesson = {
  slug: "limpieza",
  module: 4,
  title: "Limpieza de datos",
  summary: "Nulos, duplicados, tipos, categorías, valores atípicos, replace y clip.",
  relatedChallenges: ["medio-1", "medio-2", "medio-3"],
  blocks: [
    {
      type: "markdown",
      content: `## Datos sucios: la norma, no la excepción

Se dice que el 80% del trabajo con datos es limpiarlos. Los problemas típicos:

1. **Valores faltantes** (\`NaN\`, \`None\`, \`NaT\` en fechas).
2. **Duplicados**.
3. **Tipos incorrectos** (números guardados como texto).
4. **Valores inconsistentes** (\`"Chengdu"\`, \`"chengdu "\`, \`"CD"\`).
5. **Valores atípicos** (un panda de 900 kg…).

## Detectar nulos

\`isna()\` devuelve una máscara con \`True\` donde falta el dato. Combinada con \`sum()\` cuenta los nulos por columna.`,
    },
    {
      type: "code",
      title: "Contar nulos",
      code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", None, "Tao", "Yun"],
    "edad": [4, np.nan, 2, 10, np.nan],
    "peso_kg": [80.5, 110.0, 45.2, np.nan, 95.1],
})
print(df.isna().sum())
print("Filas con algún nulo:", df.isna().any(axis=1).sum())
df[df["edad"].isna()]`,
    },
    {
      type: "markdown",
      content: `## Eliminar o rellenar

- \`dropna()\`: elimina filas con algún nulo. \`subset=["col"]\` para mirar solo ciertas columnas; \`how="all"\` para eliminar solo filas totalmente vacías.
- \`fillna(valor)\`: rellena. Acepta un valor, o un diccionario \`{columna: valor}\`.
- Rellenar con la **media** o **mediana** es habitual en columnas numéricas.
- \`ffill()\` / \`bfill()\`: rellenan con el valor anterior / siguiente (útil en series temporales).`,
    },
    {
      type: "code",
      title: "dropna y fillna",
      code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "edad": [4, np.nan, 2, 10],
    "peso_kg": [80.5, 110.0, np.nan, np.nan],
})
print(df.dropna(subset=["edad"]))
df.fillna({"edad": df["edad"].median(), "peso_kg": df["peso_kg"].mean()})`,
    },
    {
      type: "code",
      title: "ffill: arrastrar el último valor",
      code: `import pandas as pd
import numpy as np

lecturas = pd.DataFrame({
    "hora": ["08:00", "09:00", "10:00", "11:00"],
    "temperatura": [18.0, np.nan, np.nan, 21.5],
})
lecturas["temp_ffill"] = lecturas["temperatura"].ffill()
lecturas["temp_interp"] = lecturas["temperatura"].interpolate()
lecturas`,
    },
    {
      type: "markdown",
      content: `## Duplicados

- \`duplicated()\`: máscara con \`True\` en las filas repetidas (a partir de la segunda aparición).
- \`drop_duplicates()\`: las elimina. Con \`subset=[...]\` decides qué columnas definen "duplicado" y con \`keep="last"\` te quedas con la última aparición.`,
    },
    {
      type: "code",
      title: "drop_duplicates",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Mei", "Lin", "Bao"],
    "fecha": ["2024-01-01", "2024-01-01", "2024-01-01", "2024-01-02", "2024-01-05"],
    "peso_kg": [80.5, 110.0, 80.5, 45.2, 111.0],
})
print("Duplicados exactos:", df.duplicated().sum())
# Último registro de cada panda
df.drop_duplicates(subset=["nombre"], keep="last")`,
    },
    {
      type: "markdown",
      content: `## Normalizar valores inconsistentes

Primero estandariza el texto (\`strip\`, \`lower\`), luego usa \`replace\` o \`map\` para unificar variantes. \`replace\` deja intactos los valores que no estén en el diccionario; \`map\` los convierte en \`NaN\`.`,
    },
    {
      type: "code",
      title: "replace para unificar",
      code: `import pandas as pd

df = pd.DataFrame({"reserva": ["Chengdu", " chengdu", "CD", "Wolong", "wolong ", "WL"]})
limpio = df["reserva"].str.strip().str.lower().replace({"cd": "chengdu", "wl": "wolong"})
df["reserva_limpia"] = limpio.str.title()
df["reserva_limpia"].value_counts()`,
    },
    {
      type: "markdown",
      content: `## Tipos y categorías

Una columna de texto con pocos valores distintos (reservas, especies, colores) se beneficia del tipo \`category\`: ocupa menos memoria y permite definir un **orden** lógico (por ejemplo \`bajo < medio < alto\`).`,
    },
    {
      type: "code",
      title: "Categorías ordenadas",
      code: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "apetito": ["medio", "alto", "bajo", "alto"],
})
orden = pd.CategoricalDtype(["bajo", "medio", "alto"], ordered=True)
df["apetito"] = df["apetito"].astype(orden)
print(df["apetito"].dtype)
print(df[df["apetito"] >= "medio"])
df.sort_values("apetito")`,
    },
    {
      type: "markdown",
      content: `## Valores atípicos (outliers)

Un método clásico es el **rango intercuartílico (IQR)**: se considera atípico lo que esté por debajo de \`Q1 - 1.5·IQR\` o por encima de \`Q3 + 1.5·IQR\`.

Una vez detectados puedes eliminarlos, marcarlos o **recortarlos** con \`clip(lower, upper)\`, que sustituye los valores fuera de rango por el límite.`,
    },
    {
      type: "code",
      title: "Detectar con IQR",
      code: `import pandas as pd

pesos = pd.Series([80.5, 110.0, 45.2, 120.3, 95.1, 900.0, 101.4, 5.0], name="peso_kg")
q1, q3 = pesos.quantile([0.25, 0.75])
iqr = q3 - q1
bajo, alto = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"Rango aceptable: {bajo:.1f} – {alto:.1f}")
pesos[(pesos < bajo) | (pesos > alto)]`,
    },
    {
      type: "code",
      title: "Recortar con clip",
      code: `import pandas as pd

df = pd.DataFrame({"nombre": list("ABCDEF"), "peso_kg": [80.5, 110.0, 900.0, 95.1, 5.0, 101.4]})
df["peso_recortado"] = df["peso_kg"].clip(lower=30, upper=160)
df`,
    },
    {
      type: "markdown",
      content: `## Un mini pipeline de limpieza

En la práctica encadenas todo lo anterior. Fíjate en el orden: primero tipos y texto, luego duplicados, luego nulos.`,
    },
    {
      type: "code",
      title: "Todo junto",
      code: `import pandas as pd

crudo = pd.DataFrame({
    "nombre": [" mei", "BAO", "mei ", "Lin", None],
    "edad": ["4", "7", "4", "n/d", "3"],
    "peso_kg": [80.5, 110.0, 80.5, 45.2, 60.0],
})
limpio = (
    crudo
    .dropna(subset=["nombre"])
    .assign(
        nombre=lambda d: d["nombre"].str.strip().str.title(),
        edad=lambda d: pd.to_numeric(d["edad"], errors="coerce"),
    )
    .drop_duplicates()
    .reset_index(drop=True)
)
limpio`,
    },
    {
      type: "markdown",
      content: `## Resumen

- Detecta nulos con \`isna().sum()\`; trátalos con \`dropna\`, \`fillna\`, \`ffill\` o \`interpolate\`.
- \`drop_duplicates(subset=..., keep=...)\` elimina repetidos.
- Unifica texto con \`.str.strip().str.lower()\` + \`replace\`.
- \`category\` ahorra memoria y permite orden lógico.
- Detecta atípicos con IQR y recórtalos con \`clip\`.

## Siguiente paso

Con datos limpios llega lo divertido: **Agregación** con \`groupby\`.`,
    },
  ],
};
