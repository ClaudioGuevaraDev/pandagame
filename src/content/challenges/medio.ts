import type { Challenge } from "../types.ts";

export const medio: Challenge[] = [
  {
    id: "medio-1",
    level: "medio",
    number: 1,
    title: "Huecos",
    icon: "CircleDashed",
    topic: "Valores nulos",
    description: `Los datos reales casi siempre tienen **huecos** (valores nulos, \`NaN\`). El registro de la reserva tiene varios.

Completa \`resolver(df)\` para que devuelva un DataFrame limpio siguiendo estos pasos **en orden**:

1. Elimina las filas donde falte el \`nombre\` (usa \`dropna\` con \`subset\`).
2. Rellena los nulos de \`edad\` con la **mediana** de \`edad\` de las filas que quedan.
3. Rellena los nulos de \`reserva\` con el texto \`"Desconocida"\`.
4. Reinicia el índice (\`reset_index(drop=True)\`).

Mantén las columnas en el mismo orden: \`nombre\`, \`edad\`, \`reserva\`.

> Usa \`df.isna().sum()\` para ver cuántos nulos hay en cada columna.`,
    setup: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", None, "Tao", "Yun"],
    "edad": [4, np.nan, 3, 10, np.nan],
    "reserva": ["Chengdu", None, "Wolong", None, "Wolong"],
})`,
    starterCode: `def resolver(df):
    # 1. Quita filas sin nombre
    # 2. Rellena la edad con la mediana
    # 3. Rellena la reserva con "Desconocida"
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.dropna(subset=["nombre"])
    df = df.fillna({
        "edad": df["edad"].median(),
        "reserva": "Desconocida",
    })
    return df.reset_index(drop=True)

resolver(df)`,
    hints: [
      'Primero `df = df.dropna(subset=["nombre"])`.',
      'Calcula la mediana después de quitar filas: `df["edad"].median()`.',
      '`df.fillna({"edad": mediana, "reserva": "Desconocida"})` rellena varias columnas a la vez.',
    ],
    tests: [
      {
        name: "No quedan valores nulos",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
n = int(r.isna().sum().sum())
assert n == 0, f"Todavía quedan {n} valores nulos"`,
      },
      {
        name: "Se eliminan las filas sin nombre",
        code: `r = resolver(df.copy())
assert len(r) == 4, f"Se esperaban 4 filas y hay {len(r)}"
assert list(r.index) == list(range(len(r))), "Recuerda reiniciar el índice con reset_index(drop=True)"`,
      },
      {
        name: "La edad se rellena con la mediana",
        code: `r = resolver(df.copy())
assert list(r["edad"]) == [4, 7, 10, 7], f"Edades obtenidas: {list(r['edad'])} (la mediana de 4 y 10 es 7)"`,
      },
      {
        name: "El resultado completo es correcto",
        code: `r = resolver(df.copy())
expected = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Tao", "Yun"],
    "edad": [4.0, 7.0, 10.0, 7.0],
    "reserva": ["Chengdu", "Desconocida", "Desconocida", "Wolong"],
})
check_frame(r, expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "nombre": ["A", "B", None, "C"],
    "edad": [np.nan, 2, 5, 6],
    "reserva": [None, "X", "Y", None],
})
expected = pd.DataFrame({
    "nombre": ["A", "B", "C"],
    "edad": [4.0, 2.0, 6.0],
    "reserva": ["Desconocida", "X", "Desconocida"],
})
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "limpieza",
  },
  {
    id: "medio-2",
    level: "medio",
    number: 2,
    title: "Duplicados",
    icon: "Copy",
    topic: "Eliminar duplicados",
    description: `Los guardas registraron algunos avistamientos dos veces. 🐼🐼

Completa dos funciones:

- \`contar_duplicados(df)\`: devuelve el **número de filas completamente duplicadas** (como entero). Pista: \`df.duplicated()\`.
- \`resolver(df)\`: devuelve un DataFrame con **un solo registro por panda**, quedándote con el **último** que aparece en la tabla. Ordénalo por \`panda\` de forma ascendente y reinicia el índice.

Las columnas deben mantenerse: \`panda\`, \`reserva\`, \`dia\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Mei", "Lin", "Bao", "Mei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Chengdu", "Ya'an", "Wolong"],
    "dia": [1, 2, 1, 3, 4, 5],
})`,
    starterCode: `def contar_duplicados(df):
    return 0

def resolver(df):
    return df

print("Duplicados exactos:", contar_duplicados(df))
resolver(df)`,
    solution: `def contar_duplicados(df):
    return int(df.duplicated().sum())

def resolver(df):
    return (
        df.drop_duplicates(subset="panda", keep="last")
        .sort_values("panda")
        .reset_index(drop=True)
    )

print("Duplicados exactos:", contar_duplicados(df))
resolver(df)`,
    hints: [
      "`df.duplicated()` devuelve True en cada fila que repite una anterior; súmalo con `.sum()`.",
      '`drop_duplicates(subset="panda", keep="last")` deja el último registro de cada panda.',
      'Termina con `.sort_values("panda").reset_index(drop=True)`.',
    ],
    tests: [
      {
        name: "Cuenta los duplicados exactos",
        code: `n = contar_duplicados(df.copy())
assert n == 1, f"Hay 1 fila duplicada exacta y se obtuvo {n}"`,
      },
      {
        name: "Un solo registro por panda",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert len(r) == 3, f"Hay 3 pandas distintos y se obtuvieron {len(r)} filas"
assert r["panda"].is_unique, "Algún panda aparece más de una vez"`,
      },
      {
        name: "Se queda con el último registro y ordena por panda",
        code: `expected = pd.DataFrame({
    "panda": ["Bao", "Lin", "Mei"],
    "reserva": ["Ya'an", "Chengdu", "Wolong"],
    "dia": [4, 3, 5],
})
check_frame(resolver(df.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "panda": ["Y", "X", "Y", "X", "X"],
    "reserva": ["b", "a", "b", "c", "a"],
    "dia": [2, 1, 2, 3, 1],
})
n = contar_duplicados(otro)
assert n == 2, f"Con otros datos se esperaban 2 duplicados y se obtuvo {n}"
expected = pd.DataFrame({"panda": ["X", "Y"], "reserva": ["a", "b"], "dia": [1, 2]})
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "limpieza",
  },
  {
    id: "medio-3",
    level: "medio",
    number: 3,
    title: "Tipos",
    icon: "Binary",
    topic: "Convertir tipos",
    description: `Alguien guardó todo el registro como **texto**: las edades, los pesos y hasta las vacunas. Así no se puede calcular nada.

Completa \`resolver(df)\` para que devuelva el DataFrame con los tipos correctos:

- \`edad\` → **entero** (usa \`astype(int)\`).
- \`peso_kg\` → **número decimal**. Algunos valores no son válidos (como \`"n/d"\`): deben quedar como \`NaN\`. Usa \`pd.to_numeric(..., errors="coerce")\`.
- \`vacunado\` → **booleano**: \`True\` si el texto es \`"si"\`, \`False\` en otro caso.

Mantén todas las columnas en el mismo orden.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": ["4", "7", "2"],
    "peso_kg": ["80.5", "n/d", "45"],
    "vacunado": ["si", "no", "si"],
})`,
    starterCode: `def resolver(df):
    print(df.dtypes)
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df.assign(
        edad=df["edad"].astype(int),
        peso_kg=pd.to_numeric(df["peso_kg"], errors="coerce"),
        vacunado=df["vacunado"] == "si",
    )

resolver(df)`,
    hints: [
      "Mira los tipos con `df.dtypes`.",
      '`pd.to_numeric(df["peso_kg"], errors="coerce")` convierte lo que puede y deja NaN en lo demás.',
      'Una comparación como `df["vacunado"] == "si"` ya devuelve una Series de booleanos.',
    ],
    tests: [
      {
        name: "edad es de tipo entero",
        code: `r = resolver(df.copy())
assert pd.api.types.is_integer_dtype(r["edad"]), f"edad es de tipo {r['edad'].dtype}, se esperaba entero"`,
      },
      {
        name: "peso_kg es numérico y 'n/d' queda como NaN",
        code: `r = resolver(df.copy())
assert pd.api.types.is_float_dtype(r["peso_kg"]), f"peso_kg es de tipo {r['peso_kg'].dtype}, se esperaba decimal"
assert r["peso_kg"].isna().sum() == 1, "El valor 'n/d' debería convertirse en NaN"`,
      },
      {
        name: "vacunado es booleano",
        code: `r = resolver(df.copy())
assert pd.api.types.is_bool_dtype(r["vacunado"]), f"vacunado es de tipo {r['vacunado'].dtype}, se esperaba bool"`,
      },
      {
        name: "Los valores son correctos",
        code: `expected = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": [4, 7, 2],
    "peso_kg": [80.5, np.nan, 45.0],
    "vacunado": [True, False, True],
})
check_frame(resolver(df.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "nombre": ["A", "B"],
    "edad": ["12", "1"],
    "peso_kg": ["?", "3.25"],
    "vacunado": ["no", "si"],
})
expected = pd.DataFrame({
    "nombre": ["A", "B"],
    "edad": [12, 1],
    "peso_kg": [np.nan, 3.25],
    "vacunado": [False, True],
})
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "medio-4",
    level: "medio",
    number: 4,
    title: "Texto",
    icon: "Type",
    topic: "Métodos .str",
    description: `Los nombres se escribieron a mano con espacios y mayúsculas al azar, y el código de cada panda mezcla el país y un número: \`"CHN-042"\`.

Completa \`resolver(df)\` para que devuelva un DataFrame con estas columnas, **en este orden**:

- \`nombre\`: sin espacios al inicio/final y con formato título (\`"  mei "\` → \`"Mei"\`).
- \`codigo\`: sin cambios.
- \`pais\`: la parte antes del guion (\`"CHN"\`).
- \`numero\`: la parte después del guion, como **entero** (\`"042"\` → \`42\`).

> Todos los métodos de texto están en el accesor \`.str\`: \`str.strip()\`, \`str.title()\`, \`str.split("-")\`...`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["  mei ", "BAO", "lin  ", "tAo"],
    "codigo": ["CHN-001", "CHN-042", "JPN-007", "USA-120"],
})`,
    starterCode: `def resolver(df):
    df = df.copy()
    # df["nombre"] = ...
    # df["pais"] = ...
    # df["numero"] = ...
    return df

resolver(df)`,
    solution: `def resolver(df):
    partes = df["codigo"].str.split("-")
    return df.assign(
        nombre=df["nombre"].str.strip().str.title(),
        pais=partes.str[0],
        numero=partes.str[1].astype(int),
    )

resolver(df)`,
    hints: [
      '`df["nombre"].str.strip().str.title()` limpia y capitaliza.',
      '`df["codigo"].str.split("-")` devuelve listas; con `.str[0]` y `.str[1]` tomas cada parte.',
      "Convierte el número con `.astype(int)`.",
    ],
    tests: [
      {
        name: "Los nombres están limpios",
        code: `r = resolver(df.copy())
assert list(r["nombre"]) == ["Mei", "Bao", "Lin", "Tao"], f"Nombres obtenidos: {list(r['nombre'])}"`,
      },
      {
        name: "Columnas en el orden correcto",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["nombre", "codigo", "pais", "numero"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "pais y numero se extraen del código",
        code: `r = resolver(df.copy())
assert list(r["pais"]) == ["CHN", "CHN", "JPN", "USA"], f"pais obtenido: {list(r['pais'])}"
assert list(r["numero"]) == [1, 42, 7, 120], f"numero obtenido: {list(r['numero'])}"
assert pd.api.types.is_integer_dtype(r["numero"]), "numero debe ser un entero"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": [" ana maría ", "PEDRO"], "codigo": ["MEX-5", "ESP-300"]})
expected = pd.DataFrame({
    "nombre": ["Ana María", "Pedro"],
    "codigo": ["MEX-5", "ESP-300"],
    "pais": ["MEX", "ESP"],
    "numero": [5, 300],
})
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "medio-5",
    level: "medio",
    number: 5,
    title: "Transformar",
    icon: "Wand",
    topic: "map y apply",
    description: `La columna \`comida\` usa códigos de una letra y queremos clasificar a los pandas por peso.

Completa \`resolver(df)\` para que devuelva el DataFrame con **dos columnas nuevas al final**:

1. \`comida_nombre\`: traduce el código con \`map\` usando este diccionario:
   \`{"B": "bambú", "M": "manzana", "Z": "zanahoria"}\`
2. \`categoria\`: según \`peso_kg\`, usando \`apply\` con una función tuya:
   - menos de 60 → \`"ligero"\`
   - de 60 a 100 (incluidos) → \`"mediano"\`
   - más de 100 → \`"pesado"\``,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "comida": ["B", "M", "B", "Z"],
    "peso_kg": [80.5, 110.0, 45.2, 100.0],
})`,
    starterCode: `COMIDAS = {"B": "bambú", "M": "manzana", "Z": "zanahoria"}

def categoria(peso):
    return "?"

def resolver(df):
    df = df.copy()
    return df

resolver(df)`,
    solution: `COMIDAS = {"B": "bambú", "M": "manzana", "Z": "zanahoria"}

def categoria(peso):
    if peso < 60:
        return "ligero"
    if peso <= 100:
        return "mediano"
    return "pesado"

def resolver(df):
    return df.assign(
        comida_nombre=df["comida"].map(COMIDAS),
        categoria=df["peso_kg"].apply(categoria),
    )

resolver(df)`,
    hints: [
      '`df["comida"].map(COMIDAS)` reemplaza cada código por su valor en el diccionario.',
      "Escribe una función que reciba un peso y devuelva la categoría con `if`/`elif`.",
      '`df["peso_kg"].apply(categoria)` aplica tu función a cada valor.',
    ],
    tests: [
      {
        name: "Añade las columnas nuevas al final",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["nombre", "comida", "peso_kg", "comida_nombre", "categoria"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Traduce la comida",
        code: `r = resolver(df.copy())
assert list(r["comida_nombre"]) == ["bambú", "manzana", "bambú", "zanahoria"], f"Obtenido: {list(r['comida_nombre'])}"`,
      },
      {
        name: "Clasifica por peso (100 es mediano)",
        code: `r = resolver(df.copy())
assert list(r["categoria"]) == ["mediano", "pesado", "ligero", "mediano"], f"Obtenido: {list(r['categoria'])}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": ["A", "B", "C"], "comida": ["Z", "Z", "M"], "peso_kg": [60.0, 59.9, 100.1]})
r = resolver(otro)
assert list(r["comida_nombre"]) == ["zanahoria", "zanahoria", "manzana"], f"Obtenido: {list(r['comida_nombre'])}"
assert list(r["categoria"]) == ["mediano", "ligero", "pesado"], f"Obtenido: {list(r['categoria'])}"`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "medio-6",
    level: "medio",
    number: 6,
    title: "Grupos",
    icon: "Group",
    topic: "groupby + agg",
    description: `¿Qué reserva tiene los pandas más pesados? Para responder hay que **agrupar**.

Completa \`resolver(df)\` para que devuelva un DataFrame **agrupado por \`reserva\`** (la reserva queda como índice, ordenado alfabéticamente, que es lo que \`groupby\` hace por defecto) con:

- \`peso_kg\`: el **promedio** del peso.
- \`edad\`: la edad **máxima**.

Solo esas dos columnas, en ese orden.

> \`agg\` acepta un diccionario \`{columna: función}\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "edad": [4, 7, 2, 10, 5, 3],
    "peso_kg": [80.0, 110.0, 45.0, 120.0, 95.0, 60.0],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
})`,
    starterCode: `def resolver(df):
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df.groupby("reserva").agg({"peso_kg": "mean", "edad": "max"})

resolver(df)`,
    hints: [
      '`df.groupby("reserva")` agrupa las filas por reserva.',
      'Después usa `.agg({"peso_kg": "mean", "edad": "max"})`.',
    ],
    tests: [
      {
        name: "El índice son las reservas",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert list(r.index) == ["Chengdu", "Wolong", "Ya'an"], f"Índice obtenido: {list(r.index)}"`,
      },
      {
        name: "Columnas peso_kg y edad",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["peso_kg", "edad"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Promedio de peso y edad máxima correctos",
        code: `expected = pd.DataFrame(
    {"peso_kg": [185 / 3, 102.5, 120.0], "edad": [4, 7, 10]},
    index=pd.Index(["Chengdu", "Wolong", "Ya'an"], name="reserva"),
)
check_frame(resolver(df.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "nombre": ["a", "b", "c"],
    "edad": [1, 9, 3],
    "peso_kg": [10.0, 20.0, 50.0],
    "reserva": ["Z", "A", "Z"],
})
expected = pd.DataFrame(
    {"peso_kg": [20.0, 30.0], "edad": [9, 3]},
    index=pd.Index(["A", "Z"], name="reserva"),
)
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "medio-7",
    level: "medio",
    number: 7,
    title: "Varias métricas",
    icon: "Calculator",
    topic: "Agregación con nombres",
    description: `El informe mensual necesita varias métricas por reserva con **nombres claros**. Para eso existe la *named aggregation*:

\`\`\`python
df.groupby("col").agg(nuevo_nombre=("columna", "funcion"))
\`\`\`

Completa \`resolver(df)\` para que devuelva un DataFrame con estas columnas, **en este orden**:

| columna | significado |
|---|---|
| \`reserva\` | la reserva (como columna, no como índice) |
| \`avistamientos\` | número de filas de esa reserva |
| \`pandas_unicos\` | número de pandas **distintos** |
| \`bambu_total\` | suma de \`bambu_kg\` |
| \`bambu_max\` | máximo de \`bambu_kg\` |

Ordena por \`bambu_total\` de **mayor a menor** y reinicia el índice.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Ya'an"],
    "panda": ["Mei", "Bao", "Lin", "Tao", "Bao", "Mei", "Yun"],
    "bambu_kg": [12, 15, 9, 20, 11, 14, 8],
})`,
    starterCode: `def resolver(df):
    return df.groupby("reserva").agg(
        # avistamientos=("panda", "count"),
    )

resolver(df)`,
    solution: `def resolver(df):
    return (
        df.groupby("reserva")
        .agg(
            avistamientos=("panda", "count"),
            pandas_unicos=("panda", "nunique"),
            bambu_total=("bambu_kg", "sum"),
            bambu_max=("bambu_kg", "max"),
        )
        .sort_values("bambu_total", ascending=False)
        .reset_index()
    )

resolver(df)`,
    hints: [
      'Cada métrica es `nombre=("columna", "función")`. Funciones útiles: `"count"`, `"nunique"`, `"sum"`, `"max"`.',
      '`.sort_values("bambu_total", ascending=False)` ordena de mayor a menor.',
      "`.reset_index()` convierte el índice `reserva` en columna.",
    ],
    tests: [
      {
        name: "Columnas correctas y en orden",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert list(r.columns) == ["reserva", "avistamientos", "pandas_unicos", "bambu_total", "bambu_max"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Ordenado por bambu_total descendente",
        code: `r = resolver(df.copy())
assert list(r["reserva"]) == ["Chengdu", "Ya'an", "Wolong"], f"Orden obtenido: {list(r['reserva'])}"`,
      },
      {
        name: "Métricas correctas",
        code: `expected = pd.DataFrame({
    "reserva": ["Chengdu", "Ya'an", "Wolong"],
    "avistamientos": [3, 2, 2],
    "pandas_unicos": [2, 2, 1],
    "bambu_total": [35, 28, 26],
    "bambu_max": [14, 20, 15],
})
check_frame(resolver(df.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"reserva": ["A", "B", "A"], "panda": ["x", "y", "z"], "bambu_kg": [1, 10, 2]})
expected = pd.DataFrame({
    "reserva": ["B", "A"],
    "avistamientos": [1, 2],
    "pandas_unicos": [1, 2],
    "bambu_total": [10, 3],
    "bambu_max": [10, 2],
})
check_frame(resolver(otro), expected)`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "medio-8",
    level: "medio",
    number: 8,
    title: "Unir orillas",
    icon: "Merge",
    topic: "merge",
    description: `Tienes dos tablas en dos orillas del río:

- \`osos\`: cada panda con el \`reserva_id\` donde vive.
- \`reservas\`: información de cada reserva.

Completa \`resolver(osos, reservas)\` para **unirlas** por \`reserva_id\` de forma que se conserven **todos los pandas**, aunque su reserva no exista en la tabla \`reservas\` (en ese caso sus datos de reserva quedan como \`NaN\`).

El resultado debe tener las columnas \`nombre\`, \`reserva_id\`, \`reserva\`, \`fundada\`, en el mismo orden de filas que \`osos\`.`,
    setup: `import pandas as pd

osos = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "reserva_id": [1, 2, 1, 9],
})

reservas = pd.DataFrame({
    "reserva_id": [1, 2, 3],
    "reserva": ["Chengdu", "Wolong", "Ya'an"],
    "fundada": [1987, 1963, 2006],
})`,
    starterCode: `def resolver(osos, reservas):
    return osos.merge(reservas, on="reserva_id")

resolver(osos, reservas)`,
    solution: `def resolver(osos, reservas):
    return osos.merge(reservas, on="reserva_id", how="left")

resolver(osos, reservas)`,
    hints: [
      '`osos.merge(reservas, on="reserva_id")` hace por defecto un *inner join*: solo deja las coincidencias.',
      'Para conservar todas las filas de la tabla de la izquierda usa `how="left"`.',
    ],
    tests: [
      {
        name: "Se conservan todos los pandas",
        code: `r = resolver(osos.copy(), reservas.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert len(r) == 4, f"Hay 4 pandas y el resultado tiene {len(r)} filas. ¿Usaste how='left'?"`,
      },
      {
        name: "Columnas correctas",
        code: `r = resolver(osos.copy(), reservas.copy())
assert list(r.columns) == ["nombre", "reserva_id", "reserva", "fundada"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Datos unidos correctamente",
        code: `expected = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "reserva_id": [1, 2, 1, 9],
    "reserva": ["Chengdu", "Wolong", "Chengdu", None],
    "fundada": [1987, 1963, 1987, np.nan],
})
check_frame(resolver(osos.copy(), reservas.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `a = pd.DataFrame({"nombre": ["x", "y", "z"], "reserva_id": [5, 7, 5]})
b = pd.DataFrame({"reserva_id": [5, 6], "reserva": ["R5", "R6"], "fundada": [2000, 2010]})
expected = pd.DataFrame({
    "nombre": ["x", "y", "z"],
    "reserva_id": [5, 7, 5],
    "reserva": ["R5", None, "R5"],
    "fundada": [2000, np.nan, 2000],
})
check_frame(resolver(a, b), expected)`,
      },
    ],
    tutorialLink: "combinar",
  },
  {
    id: "medio-9",
    level: "medio",
    number: 9,
    title: "Apilar",
    icon: "Layers",
    topic: "concat",
    description: `Los avistamientos llegan en una tabla por mes: \`enero\` y \`febrero\`. ¡Ojo! En febrero alguien guardó las columnas en otro orden.

Completa \`resolver(enero, febrero)\` para que devuelva **una sola tabla** con:

- Primero las filas de enero y luego las de febrero.
- Las columnas \`panda\`, \`bambu_kg\` y una nueva columna \`mes\` con el texto \`"enero"\` o \`"febrero"\` según de dónde venga la fila.
- Un índice continuo \`0, 1, 2, ...\` (sin índices repetidos).

> \`pd.concat\` alinea las columnas por nombre, no por posición.`,
    setup: `import pandas as pd

enero = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin"],
    "bambu_kg": [12, 15, 9],
})

febrero = pd.DataFrame({
    "bambu_kg": [14, 11],
    "panda": ["Mei", "Tao"],
})`,
    starterCode: `def resolver(enero, febrero):
    return pd.concat([enero, febrero])

resolver(enero, febrero)`,
    solution: `def resolver(enero, febrero):
    return pd.concat(
        [enero.assign(mes="enero"), febrero.assign(mes="febrero")],
        ignore_index=True,
    )

resolver(enero, febrero)`,
    hints: [
      '`enero.assign(mes="enero")` añade una columna con el mismo valor en todas las filas.',
      "`pd.concat([a, b], ignore_index=True)` apila las tablas y reinicia el índice.",
    ],
    tests: [
      {
        name: "Tiene todas las filas",
        code: `r = resolver(enero.copy(), febrero.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert len(r) == 5, f"Se esperaban 5 filas y hay {len(r)}"`,
      },
      {
        name: "El índice no se repite",
        code: `r = resolver(enero.copy(), febrero.copy())
assert list(r.index) == [0, 1, 2, 3, 4], f"Índice obtenido: {list(r.index)}. Usa ignore_index=True"`,
      },
      {
        name: "Incluye la columna mes",
        code: `r = resolver(enero.copy(), febrero.copy())
assert "mes" in r.columns, "Falta la columna 'mes'"
assert list(r["mes"]) == ["enero"] * 3 + ["febrero"] * 2, f"mes obtenido: {list(r['mes'])}"`,
      },
      {
        name: "El resultado completo es correcto",
        code: `expected = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Mei", "Tao"],
    "bambu_kg": [12, 15, 9, 14, 11],
    "mes": ["enero", "enero", "enero", "febrero", "febrero"],
})
check_frame(resolver(enero.copy(), febrero.copy()), expected)`,
      },
      {
        name: "Funciona con otros datos",
        code: `a = pd.DataFrame({"panda": ["x"], "bambu_kg": [1]}, index=[10])
b = pd.DataFrame({"bambu_kg": [2, 3], "panda": ["y", "z"]}, index=[10, 11])
expected = pd.DataFrame({
    "panda": ["x", "y", "z"],
    "bambu_kg": [1, 2, 3],
    "mes": ["enero", "febrero", "febrero"],
})
check_frame(resolver(a, b), expected)`,
      },
    ],
    tutorialLink: "combinar",
  },
  {
    id: "medio-10",
    level: "medio",
    number: 10,
    title: "Calendario",
    icon: "CalendarDays",
    topic: "Fechas con to_datetime y .dt",
    description: `Las fechas de los avistamientos están guardadas como texto y desordenadas.

Completa \`resolver(df)\` para que devuelva un DataFrame con:

1. \`fecha\` convertida a fecha real con \`pd.to_datetime\`.
2. Filas **ordenadas por fecha** (de la más antigua a la más reciente) e índice reiniciado.
3. Columnas nuevas, en este orden, al final:
   - \`anio\`: el año.
   - \`mes\`: el mes (1–12).
   - \`dia_semana\`: día de la semana como número (**0 = lunes**, 6 = domingo).
   - \`dias_desde_inicio\`: días transcurridos desde la fecha **más antigua** (entero).

> Con el accesor \`.dt\` tienes \`.dt.year\`, \`.dt.month\`, \`.dt.dayofweek\` y, para diferencias de tiempo, \`.dt.days\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Tao"],
    "fecha": ["2024-03-15", "2023-12-31", "2024-01-01", "2024-02-29"],
})`,
    starterCode: `def resolver(df):
    df = df.copy()
    # df["fecha"] = pd.to_datetime(...)
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.assign(fecha=pd.to_datetime(df["fecha"]))
    df = df.sort_values("fecha").reset_index(drop=True)
    return df.assign(
        anio=df["fecha"].dt.year,
        mes=df["fecha"].dt.month,
        dia_semana=df["fecha"].dt.dayofweek,
        dias_desde_inicio=(df["fecha"] - df["fecha"].min()).dt.days,
    )

resolver(df)`,
    hints: [
      '`pd.to_datetime(df["fecha"])` convierte texto en fechas.',
      'Ordena con `sort_values("fecha")` y después `reset_index(drop=True)`.',
      'Restar dos fechas da un intervalo de tiempo: `(df["fecha"] - df["fecha"].min()).dt.days`.',
    ],
    tests: [
      {
        name: "fecha es de tipo fecha",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert pd.api.types.is_datetime64_any_dtype(r["fecha"]), f"fecha es de tipo {r['fecha'].dtype}; usa pd.to_datetime"`,
      },
      {
        name: "Ordenado por fecha",
        code: `r = resolver(df.copy())
assert list(r["panda"]) == ["Bao", "Lin", "Tao", "Mei"], f"Orden obtenido: {list(r['panda'])}"
assert list(r.index) == [0, 1, 2, 3], "Recuerda reiniciar el índice"`,
      },
      {
        name: "Columnas nuevas en orden",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["panda", "fecha", "anio", "mes", "dia_semana", "dias_desde_inicio"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Valores de calendario correctos",
        code: `r = resolver(df.copy())
assert list(r["anio"]) == [2023, 2024, 2024, 2024], f"anio: {list(r['anio'])}"
assert list(r["mes"]) == [12, 1, 2, 3], f"mes: {list(r['mes'])}"
assert list(r["dia_semana"]) == [6, 0, 3, 4], f"dia_semana: {list(r['dia_semana'])}"
assert list(r["dias_desde_inicio"]) == [0, 1, 60, 75], f"dias_desde_inicio: {list(r['dias_desde_inicio'])}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"panda": ["x", "y"], "fecha": ["2025-01-10", "2025-01-03"]})
r = resolver(otro)
assert list(r["panda"]) == ["y", "x"], f"Orden obtenido: {list(r['panda'])}"
assert list(r["dia_semana"]) == [4, 4], f"dia_semana: {list(r['dia_semana'])}"
assert list(r["dias_desde_inicio"]) == [0, 7], f"dias_desde_inicio: {list(r['dias_desde_inicio'])}"`,
      },
    ],
    tutorialLink: "series-temporales",
  },
];
