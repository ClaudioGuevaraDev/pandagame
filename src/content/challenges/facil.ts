import type { Challenge } from "../types.ts";

export const facil: Challenge[] = [
  {
    id: "facil-1",
    level: "facil",
    number: 1,
    title: "Primer brote",
    icon: "Sprout",
    topic: "Crear DataFrames",
    description: `Un **DataFrame** es una tabla: filas y columnas con nombre. La forma más común de crearlo es a partir de un diccionario, donde cada clave es una columna y cada valor una lista.

Crea un DataFrame llamado \`result\` con estas columnas y valores (en este orden):

| nombre | edad | comida |
|---|---|---|
| Mei | 4 | bambú |
| Bao | 7 | manzana |
| Lin | 2 | bambú |`,
    setup: `import pandas as pd`,
    starterCode: `import pandas as pd

# Crea el DataFrame aquí
result = None
result`,
    solution: `import pandas as pd

result = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin"],
    "edad": [4, 7, 2],
    "comida": ["bambú", "manzana", "bambú"],
})
result`,
    hints: [
      "Usa `pd.DataFrame({...})` pasándole un diccionario.",
      'Cada clave es una columna: `{"nombre": [...], "edad": [...], ...}`.',
    ],
    tests: [
      {
        name: "result es un DataFrame",
        code: `assert isinstance(result, pd.DataFrame), "result debe ser un DataFrame"`,
      },
      {
        name: "Tiene las columnas correctas y en orden",
        code: `assert list(result.columns) == ["nombre", "edad", "comida"], f"Columnas obtenidas: {list(result.columns)}"`,
      },
      {
        name: "Tiene 3 filas",
        code: `assert len(result) == 3, f"Se esperaban 3 filas y hay {len(result)}"`,
      },
      {
        name: "Los valores son correctos",
        code: `expected = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin"], "edad": [4, 7, 2], "comida": ["bambú", "manzana", "bambú"]})
check_frame(result.reset_index(drop=True), expected)`,
      },
    ],
    tutorialLink: "fundamentos",
  },
  {
    id: "facil-2",
    level: "facil",
    number: 2,
    title: "Ojos de panda",
    icon: "Eye",
    topic: "Explorar datos",
    description: `Antes de analizar datos hay que mirarlos. Ya tienes un DataFrame \`df\` cargado con información de pandas de una reserva.

Completa la función \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"filas"\`: número de filas (usa \`df.shape\`)
- \`"columnas"\`: lista con los nombres de las columnas
- \`"primeras"\`: un DataFrame con las **3 primeras filas** (usa \`head\`)

> Los tests llamarán a tu función con otros DataFrames, así que no escribas los valores a mano.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "edad": [4, 7, 2, 10, 5, 3],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu"],
})`,
    starterCode: `def resolver(df):
    return {
        "filas": 0,
        "columnas": [],
        "primeras": None,
    }

resolver(df)`,
    solution: `def resolver(df):
    return {
        "filas": df.shape[0],
        "columnas": list(df.columns),
        "primeras": df.head(3),
    }

resolver(df)`,
    hints: [
      "`df.shape` devuelve una tupla `(filas, columnas)`.",
      "`list(df.columns)` convierte las columnas en una lista.",
      "`df.head(3)` devuelve las 3 primeras filas.",
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las claves pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
assert set(r) >= {"filas", "columnas", "primeras"}, f"Faltan claves: {set(['filas','columnas','primeras']) - set(r)}"`,
      },
      {
        name: "Cuenta bien las filas",
        code: `r = resolver(df.copy())
assert r["filas"] == 6, f"Se esperaban 6 filas y se obtuvo {r['filas']}"`,
      },
      {
        name: "Lista las columnas",
        code: `r = resolver(df.copy())
assert list(r["columnas"]) == ["nombre", "edad", "peso_kg", "reserva"], f"Obtenido: {r['columnas']}"`,
      },
      {
        name: "Devuelve las 3 primeras filas",
        code: `r = resolver(df.copy())
check_frame(r["primeras"], df.iloc[:3])`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"a": range(10), "b": list("abcdefghij")})
r = resolver(otro)
assert r["filas"] == 10, "No funciona con un DataFrame de 10 filas"
assert list(r["columnas"]) == ["a", "b"]
check_frame(r["primeras"], otro.iloc[:3])`,
      },
    ],
    tutorialLink: "fundamentos",
  },
  {
    id: "facil-3",
    level: "facil",
    number: 3,
    title: "Selector",
    icon: "Columns3",
    topic: "Seleccionar columnas",
    description: `A veces solo necesitas algunas columnas. Con doble corchete \`df[["a", "b"]]\` obtienes un nuevo DataFrame solo con esas columnas, **en el orden que indiques**.

Completa \`resolver(df)\` para que devuelva un DataFrame con **solo** las columnas \`nombre\` y \`peso_kg\`, en ese orden. Conserva el índice original.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong"],
})`,
    starterCode: `def resolver(df):
    # Devuelve solo las columnas nombre y peso_kg
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df[["nombre", "peso_kg"]]

resolver(df)`,
    hints: [
      "Para seleccionar varias columnas pasa una **lista** dentro de los corchetes.",
      'Fíjate en los dobles corchetes: `df[["nombre", "peso_kg"]]`.',
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame (¿usaste doble corchete?)"`,
      },
      {
        name: "Tiene solo las columnas nombre y peso_kg, en orden",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["nombre", "peso_kg"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Conserva todas las filas y valores",
        code: `r = resolver(df.copy())
check_frame(r, df[["nombre", "peso_kg"]])`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"id": [1, 2], "peso_kg": [70.0, 99.9], "nombre": ["Hua", "Ling"], "zona": ["N", "S"]})
check_frame(resolver(otro.copy()), otro[["nombre", "peso_kg"]])`,
      },
    ],
    tutorialLink: "seleccion",
  },
  {
    id: "facil-4",
    level: "facil",
    number: 4,
    title: "Filtro de hojas",
    icon: "Filter",
    topic: "Filtrar filas",
    description: `Para quedarte con algunas filas usa una **máscara booleana**: una condición como \`df["edad"] > 3\` devuelve \`True\`/\`False\` por fila, y \`df[mascara]\` se queda con las filas \`True\`.

Completa \`resolver(df)\` para que devuelva las filas de los pandas que pesan **más de 90 kg** (estrictamente mayor). Conserva todas las columnas y el **índice original** (no lo reinicies).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "edad": [4, 7, 2, 10, 5, 3],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 90.0],
})`,
    starterCode: `def resolver(df):
    # Filtra los pandas de más de 90 kg
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df[df["peso_kg"] > 90]

resolver(df)`,
    hints: [
      'Primero crea la condición: `df["peso_kg"] > 90`.',
      "Luego úsala dentro de los corchetes: `df[condicion]`.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"`,
      },
      {
        name: "Todos los pandas pesan más de 90 kg",
        code: `r = resolver(df.copy())
assert (r["peso_kg"] > 90).all(), "Hay filas con 90 kg o menos"`,
      },
      {
        name: "No falta ningún panda (90 kg exactos no cuenta)",
        code: `r = resolver(df.copy())
assert len(r) == 3, f"Se esperaban 3 filas y hay {len(r)}"
check_frame(r, df[df["peso_kg"] > 90])`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": ["A", "B", "C", "D"], "peso_kg": [91.0, 89.0, 150.0, 90.0]}, index=[10, 20, 30, 40])
check_frame(resolver(otro.copy()), otro.loc[[10, 30]])`,
      },
    ],
    tutorialLink: "seleccion",
  },
  {
    id: "facil-5",
    level: "facil",
    number: 5,
    title: "Doble filtro",
    icon: "ListFilter",
    topic: "Combinar condiciones",
    description: `Puedes combinar condiciones con \`&\` (y), \`|\` (o) y \`~\` (no). ¡Cada condición va **entre paréntesis**! Para comprobar si un valor está en una lista usa \`.isin([...])\`.

Completa \`resolver(df)\` para que devuelva los pandas que viven en **Chengdu o Wolong** **y** que tienen **5 años o más**. Conserva todas las columnas y el índice original.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Xiu"],
    "edad": [4, 7, 12, 10, 5, 3, 8],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Foping"],
})`,
    starterCode: `def resolver(df):
    # Reserva Chengdu o Wolong, y edad >= 5
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df[df["reserva"].isin(["Chengdu", "Wolong"]) & (df["edad"] >= 5)]

resolver(df)`,
    hints: [
      '`df["reserva"].isin(["Chengdu", "Wolong"])` te da la primera condición.',
      'La segunda es `(df["edad"] >= 5)`. Combínalas con `&`.',
      "Recuerda los paréntesis alrededor de cada comparación: `(a) & (b)`.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"`,
      },
      {
        name: "Solo hay pandas de Chengdu o Wolong",
        code: `r = resolver(df.copy())
assert r["reserva"].isin(["Chengdu", "Wolong"]).all(), f"Reservas encontradas: {sorted(set(r['reserva']))}"`,
      },
      {
        name: "Todos tienen 5 años o más",
        code: `r = resolver(df.copy())
assert (r["edad"] >= 5).all(), "Hay pandas menores de 5 años"`,
      },
      {
        name: "Son exactamente los pandas esperados",
        code: `r = resolver(df.copy())
check_frame(r, df.loc[[1, 2, 4]])`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": list("abcde"), "edad": [5, 4, 9, 20, 6], "reserva": ["Wolong", "Wolong", "Ya'an", "Chengdu", "Foping"]})
check_frame(resolver(otro.copy()), otro.loc[[0, 3]])`,
      },
    ],
    tutorialLink: "seleccion",
  },
  {
    id: "facil-6",
    level: "facil",
    number: 6,
    title: "En orden",
    icon: "ArrowDownWideNarrow",
    topic: "Ordenar",
    description: `\`sort_values\` ordena un DataFrame por una o varias columnas. Con \`ascending=False\` el orden es de mayor a menor.

Completa \`resolver(df)\` para que devuelva el DataFrame ordenado por \`peso_kg\` de **mayor a menor**. Después **reinicia el índice** para que vaya de 0 a n-1 (sin conservar el índice viejo como columna).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1],
})`,
    starterCode: `def resolver(df):
    # Ordena por peso_kg de mayor a menor y reinicia el índice
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df.sort_values("peso_kg", ascending=False).reset_index(drop=True)

resolver(df)`,
    hints: [
      '`df.sort_values("peso_kg", ascending=False)` ordena de mayor a menor.',
      "`.reset_index(drop=True)` reinicia el índice sin crear una columna nueva.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame con las mismas columnas",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert list(r.columns) == list(df.columns), f"Columnas obtenidas: {list(r.columns)} (¿olvidaste drop=True?)"`,
      },
      {
        name: "Está ordenado de mayor a menor peso",
        code: `r = resolver(df.copy())
assert r["peso_kg"].is_monotonic_decreasing, "peso_kg no está ordenado de mayor a menor"`,
      },
      {
        name: "El índice va de 0 a n-1",
        code: `r = resolver(df.copy())
assert list(r.index) == list(range(len(df))), f"Índice obtenido: {list(r.index)}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": ["a", "b", "c", "d"], "peso_kg": [10.0, 300.0, 55.5, 70.0]})
esperado = pd.DataFrame({"nombre": ["b", "d", "c", "a"], "peso_kg": [300.0, 70.0, 55.5, 10.0]})
check_frame(resolver(otro.copy()), esperado)`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "facil-7",
    level: "facil",
    number: 7,
    title: "Nueva rama",
    icon: "GitBranchPlus",
    topic: "Columnas calculadas",
    description: `Puedes crear columnas nuevas a partir de otras con operaciones vectorizadas: \`df["c"] = df["a"] / df["b"]\` calcula fila a fila sin bucles.

Completa \`resolver(df)\` para que devuelva el DataFrame con una **nueva columna al final** llamada \`bambu_por_kg\`: los kilos de bambú que come al día (\`bambu_kg\`) divididos entre su peso (\`peso_kg\`), **redondeado a 3 decimales**.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3],
    "bambu_kg": [12.0, 18.5, 6.3, 20.1],
})`,
    starterCode: `def resolver(df):
    # Crea la columna bambu_por_kg
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.copy()
    df["bambu_por_kg"] = (df["bambu_kg"] / df["peso_kg"]).round(3)
    return df

resolver(df)`,
    hints: [
      'Divide dos columnas directamente: `df["bambu_kg"] / df["peso_kg"]`.',
      "Usa `.round(3)` sobre el resultado.",
      'Asigna con `df["bambu_por_kg"] = ...` (o usa `df.assign(...)`).',
    ],
    tests: [
      {
        name: "Existe la columna bambu_por_kg al final",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert list(r.columns) == ["nombre", "peso_kg", "bambu_kg", "bambu_por_kg"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Los valores están bien calculados",
        code: `r = resolver(df.copy())
check_series(r["bambu_por_kg"], (df["bambu_kg"] / df["peso_kg"]).round(3), check_names=False)`,
      },
      {
        name: "Está redondeado a 3 decimales",
        code: `r = resolver(df.copy())
assert (r["bambu_por_kg"] == r["bambu_por_kg"].round(3)).all(), "Los valores no están redondeados a 3 decimales"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": ["x", "y"], "peso_kg": [100.0, 3.0], "bambu_kg": [10.0, 1.0]})
esperado = otro.assign(bambu_por_kg=[0.1, 0.333])
check_frame(resolver(otro.copy()), esperado)`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "facil-8",
    level: "facil",
    number: 8,
    title: "Renombrar",
    icon: "PencilLine",
    topic: "rename y drop",
    description: `Los datos reales suelen venir con nombres feos. \`df.rename(columns={"viejo": "nuevo"})\` cambia nombres de columnas y \`df.drop(columns=[...])\` elimina columnas.

Completa \`resolver(df)\` para que:

1. Renombre \`nom\` → \`nombre\` y \`kg\` → \`peso_kg\`.
2. Elimine la columna \`id_interno\`.

El resto de columnas debe quedar igual y en el mismo orden.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "id_interno": [101, 102, 103],
    "nom": ["Mei", "Bao", "Lin"],
    "kg": [80.5, 110.0, 45.2],
    "reserva": ["Chengdu", "Wolong", "Chengdu"],
})`,
    starterCode: `def resolver(df):
    # Renombra nom y kg, y elimina id_interno
    return df

resolver(df)`,
    solution: `def resolver(df):
    return df.rename(columns={"nom": "nombre", "kg": "peso_kg"}).drop(columns=["id_interno"])

resolver(df)`,
    hints: [
      '`df.rename(columns={"nom": "nombre", "kg": "peso_kg"})` devuelve un DataFrame nuevo.',
      'Encadena `.drop(columns=["id_interno"])` al resultado.',
    ],
    tests: [
      {
        name: "Las columnas están renombradas",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert "nombre" in r.columns and "peso_kg" in r.columns, f"Columnas obtenidas: {list(r.columns)}"
assert "nom" not in r.columns and "kg" not in r.columns, "Aún quedan los nombres viejos"`,
      },
      {
        name: "Ya no existe id_interno",
        code: `r = resolver(df.copy())
assert "id_interno" not in r.columns, "La columna id_interno sigue ahí"`,
      },
      {
        name: "Columnas en el orden correcto y valores intactos",
        code: `r = resolver(df.copy())
esperado = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin"], "peso_kg": [80.5, 110.0, 45.2], "reserva": ["Chengdu", "Wolong", "Chengdu"]})
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"kg": [1.0], "id_interno": [9], "zona": ["N"], "nom": ["Hua"]})
esperado = pd.DataFrame({"peso_kg": [1.0], "zona": ["N"], "nombre": ["Hua"]})
check_frame(resolver(otro.copy()), esperado)`,
      },
    ],
    tutorialLink: "transformacion",
  },
  {
    id: "facil-9",
    level: "facil",
    number: 9,
    title: "Contar bambú",
    icon: "ChartColumn",
    topic: "value_counts y unique",
    description: `\`serie.value_counts()\` cuenta cuántas veces aparece cada valor (ordenado de más a menos frecuente) y \`serie.nunique()\` dice cuántos valores distintos hay.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"conteo"\`: una Series con cuántas veces aparece cada \`comida\`, ordenada de **mayor a menor** frecuencia.
- \`"reservas"\`: el **número** de reservas distintas (un entero).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Xiu"],
    "comida": ["bambú", "manzana", "bambú", "bambú", "zanahoria", "manzana", "bambú"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Foping"],
})`,
    starterCode: `def resolver(df):
    return {
        "conteo": None,
        "reservas": 0,
    }

resolver(df)`,
    solution: `def resolver(df):
    return {
        "conteo": df["comida"].value_counts(),
        "reservas": df["reserva"].nunique(),
    }

resolver(df)`,
    hints: [
      '`df["comida"].value_counts()` ya devuelve la Series ordenada.',
      '`df["reserva"].nunique()` cuenta los valores distintos (y `unique()` te los muestra).',
    ],
    tests: [
      {
        name: "Devuelve un diccionario con conteo y reservas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
assert set(r) >= {"conteo", "reservas"}, f"Claves obtenidas: {list(r)}"`,
      },
      {
        name: "El conteo de comidas es correcto",
        code: `r = resolver(df.copy())
esperado = pd.Series({"bambú": 4, "manzana": 2, "zanahoria": 1})
check_series(r["conteo"].sort_index(), esperado.sort_index(), check_names=False)`,
      },
      {
        name: "El conteo está ordenado de mayor a menor",
        code: `r = resolver(df.copy())
assert r["conteo"].is_monotonic_decreasing, "El conteo no está ordenado de mayor a menor"`,
      },
      {
        name: "Cuenta las reservas distintas",
        code: `r = resolver(df.copy())
assert int(r["reservas"]) == 4, f"Se esperaban 4 reservas distintas y se obtuvo {r['reservas']}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"comida": ["pera", "pera", "pera", "uva"], "reserva": ["A", "A", "A", "A"]})
r = resolver(otro.copy())
check_series(r["conteo"].sort_index(), pd.Series({"pera": 3, "uva": 1}), check_names=False)
assert int(r["reservas"]) == 1, "Con una sola reserva el resultado debe ser 1"`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "facil-10",
    level: "facil",
    number: 10,
    title: "Resumen",
    icon: "Sigma",
    topic: "sum, mean y describe",
    description: `¡Último reto del bosque! Las columnas numéricas tienen métodos de agregación: \`sum()\`, \`mean()\`, \`max()\`, \`min()\`... y \`describe()\` te da un resumen estadístico completo.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"total_bambu"\`: la suma de \`bambu_kg\`.
- \`"edad_media"\`: la media de \`edad\`.
- \`"mas_pesado"\`: el **nombre** del panda con mayor \`peso_kg\`.
- \`"estadisticas"\`: el resultado de \`describe()\` sobre la columna \`peso_kg\` (una Series).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Lin", "Tao", "Yun"],
    "edad": [4, 7, 2, 10, 5],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1],
    "bambu_kg": [12.0, 18.5, 6.3, 20.1, 15.0],
})`,
    starterCode: `def resolver(df):
    return {
        "total_bambu": 0,
        "edad_media": 0,
        "mas_pesado": "",
        "estadisticas": None,
    }

resolver(df)`,
    solution: `def resolver(df):
    return {
        "total_bambu": df["bambu_kg"].sum(),
        "edad_media": df["edad"].mean(),
        "mas_pesado": df.loc[df["peso_kg"].idxmax(), "nombre"],
        "estadisticas": df["peso_kg"].describe(),
    }

resolver(df)`,
    hints: [
      '`df["bambu_kg"].sum()` y `df["edad"].mean()` resuelven las dos primeras.',
      '`df["peso_kg"].idxmax()` te da el **índice** de la fila con mayor peso; úsalo con `df.loc[indice, "nombre"]`.',
      '`df["peso_kg"].describe()` devuelve la Series de estadísticas.',
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las claves pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
faltan = {"total_bambu", "edad_media", "mas_pesado", "estadisticas"} - set(r)
assert not faltan, f"Faltan claves: {faltan}"`,
      },
      {
        name: "Suma y media correctas",
        code: `r = resolver(df.copy())
assert abs(float(r["total_bambu"]) - 71.9) < 1e-6, f"total_bambu: se esperaba 71.9 y se obtuvo {r['total_bambu']}"
assert abs(float(r["edad_media"]) - 5.6) < 1e-6, f"edad_media: se esperaba 5.6 y se obtuvo {r['edad_media']}"`,
      },
      {
        name: "Encuentra al panda más pesado",
        code: `r = resolver(df.copy())
assert r["mas_pesado"] == "Tao", f"Se esperaba 'Tao' y se obtuvo {r['mas_pesado']!r}"`,
      },
      {
        name: "Las estadísticas son las de describe()",
        code: `r = resolver(df.copy())
check_series(r["estadisticas"], df["peso_kg"].describe(), check_names=False)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"nombre": ["a", "b", "c"], "edad": [1, 2, 6], "peso_kg": [300.0, 10.0, 20.0], "bambu_kg": [1.0, 2.0, 3.0]}, index=[5, 6, 7])
r = resolver(otro.copy())
assert abs(float(r["total_bambu"]) - 6.0) < 1e-6, "total_bambu incorrecto con otros datos"
assert abs(float(r["edad_media"]) - 3.0) < 1e-6, "edad_media incorrecta con otros datos"
assert r["mas_pesado"] == "a", f"mas_pesado: se esperaba 'a' y se obtuvo {r['mas_pesado']!r}"
check_series(r["estadisticas"], otro["peso_kg"].describe(), check_names=False)`,
      },
    ],
    tutorialLink: "agregacion",
  },
];
