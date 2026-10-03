import type { Challenge } from "../types.ts";

export const facil: Challenge[] = [
  {
    id: "facil-1",
    level: "facil",
    number: 1,
    title: "Primer brote",
    icon: "Sprout",
    topic: "Crear DataFrames",
    description: `En la **guardería del santuario** cada cuidadora anota sus mediciones como **tuplas**: una por cría, con los valores en el mismo orden que una lista de nombres de columna.

Completa \`resolver(registros, columnas)\` para que devuelva un **DataFrame** donde:

- cada tupla de \`registros\` es una **fila**,
- las columnas se llaman como indica \`columnas\` (en ese orden),
- la **primera columna** de \`columnas\` pasa a ser el **índice** de la tabla (deja de ser una columna normal).

Por ejemplo, con \`columnas = ["cria", "altura_cm", "meses"]\` el índice serán los nombres de las crías y las columnas \`altura_cm\` y \`meses\`.

> Los tests usan otros registros y otros nombres de columna: no escribas nada a mano.`,
    setup: `import pandas as pd

registros = [
    ("Nube", 61, 7),
    ("Kiwi", 58, 6),
    ("Momo", 64, 8),
    ("Pipo", 55, 5),
]
columnas = ["cria", "altura_cm", "meses"]`,
    starterCode: `import pandas as pd

def resolver(registros, columnas):
    # Construye la tabla y usa la primera columna como índice
    return None

resolver(registros, columnas)`,
    solution: `import pandas as pd

def resolver(registros, columnas):
    tabla = pd.DataFrame(registros, columns=columnas)
    return tabla.set_index(columnas[0])

resolver(registros, columnas)`,
    hints: [
      "`pd.DataFrame` también acepta una **lista de filas** (tuplas) junto con el parámetro `columns=` para nombrarlas.",
      "Para convertir una columna en el índice existe `set_index`.",
      "El nombre de la columna que va al índice es el primer elemento de `columnas`.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(list(registros), list(columnas))
assert isinstance(r, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(r).__name__}"`,
      },
      {
        name: "La primera columna es el índice",
        code: `r = resolver(list(registros), list(columnas))
assert r.index.name == "cria", f"El índice debería llamarse 'cria' y se llama {r.index.name!r}"
assert list(r.index) == ["Nube", "Kiwi", "Momo", "Pipo"], f"Índice obtenido: {list(r.index)}"`,
      },
      {
        name: "Columnas restantes en orden con sus valores",
        code: `r = resolver(list(registros), list(columnas))
esperado = pd.DataFrame({"altura_cm": [61, 58, 64, 55], "meses": [7, 6, 8, 5]},
                        index=pd.Index(["Nube", "Kiwi", "Momo", "Pipo"], name="cria"))
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con otros registros y columnas",
        code: `regs = [(101, "Tofu", 3.5), (102, "Yuzu", 2.8)]
cols = ["ficha", "apodo", "kg"]
r = resolver(regs, cols)
esperado = pd.DataFrame({"apodo": ["Tofu", "Yuzu"], "kg": [3.5, 2.8]}, index=pd.Index([101, 102], name="ficha"))
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con un solo registro",
        code: `r = resolver([("Dango", 52, 4)], ["cria", "altura_cm", "meses"])
assert len(r) == 1, f"Se esperaba 1 fila y hay {len(r)}"
assert r.loc["Dango", "altura_cm"] == 52, "El valor de altura no coincide"`,
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
    description: `La **tienda de souvenirs** del santuario tiene su inventario en un DataFrame \`df\`. Antes de hacer cuentas, la encargada quiere un vistazo rápido.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"n_productos"\`: cuántas filas tiene la tabla
- \`"n_columnas"\`: cuántas columnas tiene (un número, no la lista)
- \`"ultimos"\`: un DataFrame con las **2 últimas filas**

> Los tests usan otros inventarios: calcula todo a partir de \`df\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "producto": ["Peluche", "Llavero", "Taza", "Postal", "Gorra"],
    "stock": [12, 40, 25, 100, 8],
    "precio": [15.0, 3.5, 7.9, 1.2, 11.0],
})`,
    starterCode: `def resolver(df):
    return {
        "n_productos": 0,
        "n_columnas": 0,
        "ultimos": None,
    }

resolver(df)`,
    solution: `def resolver(df):
    filas, columnas = df.shape
    return {
        "n_productos": filas,
        "n_columnas": columnas,
        "ultimos": df.tail(2),
    }

resolver(df)`,
    hints: [
      "`df.shape` es una tupla con dos números: filas y columnas.",
      "Igual que `head` muestra el principio, hay un método que muestra el final.",
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las claves pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
faltan = {"n_productos", "n_columnas", "ultimos"} - set(r)
assert not faltan, f"Faltan claves: {faltan}"`,
      },
      {
        name: "Cuenta productos y columnas",
        code: `r = resolver(df.copy())
assert r["n_productos"] == 5, f"Se esperaban 5 productos y se obtuvo {r['n_productos']}"
assert r["n_columnas"] == 3, f"Se esperaban 3 columnas y se obtuvo {r['n_columnas']}"`,
      },
      {
        name: "Devuelve las 2 últimas filas",
        code: `r = resolver(df.copy())
check_frame(r["ultimos"], df.iloc[-2:])`,
      },
      {
        name: "Funciona con otro inventario",
        code: `otro = pd.DataFrame({"a": range(7), "b": list("abcdefg"), "c": [0.5] * 7, "d": [True] * 7})
r = resolver(otro)
assert r["n_productos"] == 7, "No cuenta bien las filas de otro inventario"
assert r["n_columnas"] == 4, "No cuenta bien las columnas de otro inventario"
check_frame(r["ultimos"], otro.iloc[-2:])`,
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
    description: `El registro de **visitas al santuario** guarda muchos datos por visitante. Hay columnas de gasto (\`gasto_...\`), de horarios (\`hora_...\`) y otras.

Completa \`resolver(df, prefijo)\` para que devuelva un DataFrame con:

1. la **primera columna** de \`df\` (el identificador del visitante), y a continuación
2. **todas las columnas cuyo nombre empiece por \`prefijo\`**, en el mismo orden en que aparecen en \`df\`.

Por ejemplo, con \`prefijo = "gasto_"\` el resultado tiene \`visitante\`, \`gasto_entrada\`, \`gasto_tienda\` y \`gasto_comida\`.

> Los tests usan otros prefijos y otras tablas (con otro identificador): no escribas los nombres a mano.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "visitante": ["Ana", "Joaquín", "Sofía", "Iker"],
    "pais": ["Chile", "España", "México", "Perú"],
    "gasto_entrada": [12, 12, 8, 12],
    "hora_llegada": ["10:00", "11:30", "12:15", "15:45"],
    "gasto_tienda": [25, 0, 14, 40],
    "grupo": [2, 5, 1, 3],
    "gasto_comida": [9, 18, 0, 11],
    "hora_salida": ["12:30", "14:00", "13:05", "17:20"],
})
prefijo = "gasto_"`,
    starterCode: `def resolver(df, prefijo):
    return df

resolver(df, prefijo)`,
    solution: `def resolver(df, prefijo):
    elegidas = [c for c in df.columns if c.startswith(prefijo)]
    return df[[df.columns[0]] + elegidas]

resolver(df, prefijo)`,
    hints: [
      "`df.columns` es la lista de nombres de columna: puedes recorrerla y quedarte con las que te sirvan.",
      "Los textos tienen el método `startswith` para saber si empiezan por algo.",
      "Arma una lista con la primera columna seguida de las elegidas y úsala dentro de `df[...]`.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy(), "gasto_")
assert isinstance(r, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(r).__name__}"`,
      },
      {
        name: "Identificador primero y columnas con el prefijo en orden",
        code: `r = resolver(df.copy(), "gasto_")
assert list(r.columns) == ["visitante", "gasto_entrada", "gasto_tienda", "gasto_comida"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Funciona con otro prefijo",
        code: `r = resolver(df.copy(), "hora_")
check_frame(r, df[["visitante", "hora_llegada", "hora_salida"]])`,
      },
      {
        name: "Si ninguna columna coincide, queda solo el identificador",
        code: `r = resolver(df.copy(), "xyz_")
assert list(r.columns) == ["visitante"], f"Columnas obtenidas: {list(r.columns)}"
assert len(r) == len(df), "No debe perder filas"`,
      },
      {
        name: "Funciona con otra tabla y otro identificador",
        code: `otro = pd.DataFrame({"ticket": [1, 2], "kg_bambu": [3, 4], "nota": ["a", "b"], "kg_fruta": [5, 6]})
check_frame(resolver(otro, "kg_"), otro[["ticket", "kg_bambu", "kg_fruta"]])`,
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
    description: `En la **guardería**, las cuidadoras registran cuántos minutos jugó cada cría hoy. Quieren saber qué crías jugaron **más que el promedio** del grupo.

Completa \`resolver(df)\` para que devuelva las filas cuyo \`minutos_juego\` sea **estrictamente mayor que la media** de esa columna, con todas sus columnas y el índice reiniciado (\`0, 1, 2…\`).

> La media cambia con los datos: calcúlala dentro de la función.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Nube", "Kiwi", "Momo", "Pipo", "Lulú"],
    "minutos_juego": [45, 80, 30, 95, 50],
    "siesta_min": [120, 90, 150, 60, 110],
})`,
    starterCode: `def resolver(df):
    return df

resolver(df)`,
    solution: `def resolver(df):
    media = df["minutos_juego"].mean()
    activas = df[df["minutos_juego"] > media]
    return activas.reset_index(drop=True)

resolver(df)`,
    hints: [
      "Primero calcula la media de la columna `minutos_juego` con `.mean()`.",
      "Compara la columna con esa media para obtener una máscara de `True`/`False` y úsala dentro de `df[...]`.",
      "Termina con `.reset_index(drop=True)` para renumerar las filas.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(r).__name__}"`,
      },
      {
        name: "Solo crías por encima de la media",
        code: `r = resolver(df.copy())
assert sorted(r["cria"]) == ["Kiwi", "Pipo"], f"Crías obtenidas: {list(r['cria'])}"`,
      },
      {
        name: "Mantiene todas las columnas y reinicia el índice",
        code: `r = resolver(df.copy())
esperado = pd.DataFrame({"cria": ["Kiwi", "Pipo"], "minutos_juego": [80, 95], "siesta_min": [90, 60]})
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"cria": ["A", "B", "C", "D"], "minutos_juego": [10, 10, 10, 50], "siesta_min": [1, 2, 3, 4]})
r = resolver(otro)
check_frame(r, otro.iloc[[3]].reset_index(drop=True))`,
      },
      {
        name: "Si todas jugaron igual, no devuelve ninguna",
        code: `igual = pd.DataFrame({"cria": ["A", "B"], "minutos_juego": [20, 20], "siesta_min": [5, 5]})
r = resolver(igual)
assert len(r) == 0, f"Ninguna supera la media, pero se obtuvieron {len(r)} filas"`,
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
    description: `La **clínica veterinaria** del santuario quiere avisar a los pacientes que necesitan revisión.

Completa \`resolver(df, areas)\` para que devuelva los pacientes que cumplan **las dos** condiciones:

1. su \`area\` está en la lista \`areas\`, **y**
2. tienen fiebre (\`temperatura\` **mayor o igual** a \`38.5\`) **o** están marcados como \`urgente\`.

Devuelve todas las columnas con el índice reiniciado.

> Necesitarás \`&\`, \`|\`, \`isin\` y paréntesis alrededor de cada condición.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "paciente": ["Taro", "Sésamo", "Bruma", "Coco", "Ámbar", "Tofu"],
    "area": ["Bosque Alto", "Valle Niebla", "Bosque Alto", "Río Jade", "Valle Niebla", "Río Jade"],
    "temperatura": [38.9, 37.8, 37.5, 39.1, 38.5, 37.2],
    "urgente": [False, True, False, False, False, True],
})
areas = ["Bosque Alto", "Valle Niebla"]`,
    starterCode: `def resolver(df, areas):
    return df

resolver(df, areas)`,
    solution: `def resolver(df, areas):
    en_area = df["area"].isin(areas)
    revisar = (df["temperatura"] >= 38.5) | df["urgente"]
    return df[en_area & revisar].reset_index(drop=True)

resolver(df, areas)`,
    hints: [
      "`df[\"area\"].isin(areas)` te dice qué filas están en alguna de las áreas.",
      "Combina condiciones con `&` (y) y `|` (o), y pon cada una entre paréntesis.",
    ],
    tests: [
      {
        name: "Devuelve un DataFrame",
        code: `r = resolver(df.copy(), ["Bosque Alto", "Valle Niebla"])
assert isinstance(r, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(r).__name__}"`,
      },
      {
        name: "Selecciona los pacientes correctos",
        code: `r = resolver(df.copy(), ["Bosque Alto", "Valle Niebla"])
assert list(r["paciente"]) == ["Taro", "Sésamo", "Ámbar"], f"Pacientes obtenidos: {list(r['paciente'])}"`,
      },
      {
        name: "Respeta la lista de áreas",
        code: `r = resolver(df.copy(), ["Río Jade"])
assert list(r["paciente"]) == ["Coco", "Tofu"], f"Pacientes obtenidos: {list(r['paciente'])}"`,
      },
      {
        name: "Mantiene columnas e índice reiniciado",
        code: `r = resolver(df.copy(), ["Bosque Alto", "Valle Niebla"])
check_frame(r, df.iloc[[0, 1, 4]].reset_index(drop=True))`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"paciente": ["a", "b", "c"], "area": ["X", "Y", "X"], "temperatura": [40.0, 40.0, 36.0], "urgente": [False, False, False]})
r = resolver(otro, ["X"])
assert list(r["paciente"]) == ["a"], f"Pacientes obtenidos: {list(r['paciente'])}"`,
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
    description: `Terminó el **torneo de trepar árboles**. Los participantes compiten en categorías (\`cria\`, \`juvenil\`, \`adulto\`) y el jurado quiere publicar la tabla agrupada por categoría, **en el orden que ellos eligen**, que no es el alfabético.

Completa \`resolver(df, orden)\` para que devuelva la tabla:

- ordenada por \`categoria\` según la posición de cada categoría en la lista \`orden\` (la primera de la lista va arriba),
- dentro de cada categoría, por \`puntos\` de **mayor a menor**,
- con las **mismas columnas** que \`df\` (sin columnas auxiliares) y el **índice reiniciado**.

> La lista \`orden\` cambia en cada test.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "participante": ["Yuzu", "Mochi", "Dango", "Nori", "Brisa", "Copo"],
    "categoria": ["adulto", "cria", "juvenil", "cria", "adulto", "juvenil"],
    "puntos": [72, 90, 85, 78, 60, 88],
})
orden = ["juvenil", "cria", "adulto"]`,
    starterCode: `def resolver(df, orden):
    return df

resolver(df, orden)`,
    solution: `def resolver(df, orden):
    posicion = {cat: i for i, cat in enumerate(orden)}
    tabla = df.assign(pos=df["categoria"].map(posicion))
    tabla = tabla.sort_values(["pos", "puntos"], ascending=[True, False])
    return tabla.drop(columns="pos").reset_index(drop=True)

resolver(df, orden)`,
    hints: [
      "Ordenar por `categoria` directamente la pondría en orden alfabético. Necesitas un valor numérico que represente la posición de cada categoría en `orden`.",
      "Puedes crear un diccionario categoría → posición y aplicarlo con `map` en una columna auxiliar.",
      "Ordena por esa columna auxiliar y por `puntos` (con direcciones distintas), y luego elimínala.",
    ],
    tests: [
      {
        name: "Devuelve todas las filas con las mismas columnas",
        code: `r = resolver(df.copy(), ["juvenil", "cria", "adulto"])
assert isinstance(r, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(r).__name__}"
assert list(r.columns) == list(df.columns), f"Columnas obtenidas: {list(r.columns)}"
assert len(r) == len(df), f"Se esperaban {len(df)} filas y hay {len(r)}"`,
      },
      {
        name: "Orden de categorías según la lista y puntos de mayor a menor",
        code: `r = resolver(df.copy(), ["juvenil", "cria", "adulto"])
assert list(r["participante"]) == ["Copo", "Dango", "Mochi", "Nori", "Yuzu", "Brisa"], f"Orden obtenido: {list(r['participante'])}"`,
      },
      {
        name: "Respeta otra lista de orden",
        code: `r = resolver(df.copy(), ["adulto", "juvenil", "cria"])
assert list(r["participante"]) == ["Yuzu", "Brisa", "Copo", "Dango", "Mochi", "Nori"], f"Orden obtenido: {list(r['participante'])}"`,
      },
      {
        name: "Índice reiniciado",
        code: `r = resolver(df.copy(), ["cria", "juvenil", "adulto"])
assert list(r.index) == list(range(len(df))), f"Índice obtenido: {list(r.index)}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"participante": ["a", "b", "c", "d"], "categoria": ["oro", "plata", "oro", "bronce"], "puntos": [1, 9, 5, 3]})
r = resolver(otro, ["bronce", "oro", "plata"])
assert list(r["participante"]) == ["d", "c", "a", "b"], f"Orden obtenido: {list(r['participante'])}"`,
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
    description: `El **inventario de bambú** anota cuántos tallos hay de cada variedad, cuántos kilos pesa cada tallo y el precio por kilo.

Completa \`resolver(df)\` para que devuelva el DataFrame con **dos columnas nuevas** al final:

- \`"kg_totales"\`: \`tallos × kg_por_tallo\`
- \`"valor"\`: \`kg_totales × precio_kg\`, **redondeado a 2 decimales**

Las columnas originales deben quedar igual.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "variedad": ["Gigante", "Dorado", "Negro", "Enano"],
    "tallos": [12, 30, 8, 50],
    "kg_por_tallo": [2.5, 0.8, 3.1, 0.3],
    "precio_kg": [1.20, 2.75, 3.40, 0.95],
})`,
    starterCode: `def resolver(df):
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.copy()
    df["kg_totales"] = df["tallos"] * df["kg_por_tallo"]
    df["valor"] = (df["kg_totales"] * df["precio_kg"]).round(2)
    return df

resolver(df)`,
    hints: [
      "Puedes crear una columna asignando una operación entre columnas: `df[\"nueva\"] = ...`.",
      "La segunda columna puede usar la primera que acabas de crear.",
      "`.round(2)` redondea a dos decimales.",
    ],
    tests: [
      {
        name: "Agrega las dos columnas al final",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["variedad", "tallos", "kg_por_tallo", "precio_kg", "kg_totales", "valor"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "kg_totales es correcto",
        code: `r = resolver(df.copy())
check_series(r["kg_totales"], pd.Series([30.0, 24.0, 24.8, 15.0], name="kg_totales"), atol=1e-9)`,
      },
      {
        name: "valor es correcto y está redondeado",
        code: `r = resolver(df.copy())
check_series(r["valor"], pd.Series([36.0, 66.0, 84.32, 14.25], name="valor"), atol=1e-9)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"variedad": ["x"], "tallos": [3], "kg_por_tallo": [1.111], "precio_kg": [3.0]})
r = resolver(otro)
assert abs(r["kg_totales"].iloc[0] - 3.333) < 1e-9, "kg_totales incorrecto"
assert r["valor"].iloc[0] == 10.0, f"valor obtenido: {r['valor'].iloc[0]}"`,
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
    description: `El sistema de la **tienda de souvenirs** exporta el registro de ventas con nombres abreviados y algunas columnas internas que empiezan con \`"tmp_"\`.

Completa \`resolver(df)\` para que devuelva el DataFrame:

1. **sin ninguna columna cuyo nombre empiece por \`"tmp_"\`** (pueden ser distintas en cada test),
2. con \`"prod"\` renombrada a \`"producto"\` y \`"cant"\` renombrada a \`"cantidad"\`.

El resto de columnas se mantiene en su orden.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "prod": ["Peluche", "Taza", "Gorra"],
    "tmp_id": [901, 902, 903],
    "cant": [2, 1, 4],
    "total": [30.0, 7.9, 44.0],
    "tmp_caja": ["C1", "C2", "C1"],
})`,
    starterCode: `def resolver(df):
    return df

resolver(df)`,
    solution: `def resolver(df):
    internas = [c for c in df.columns if c.startswith("tmp_")]
    limpio = df.drop(columns=internas)
    return limpio.rename(columns={"prod": "producto", "cant": "cantidad"})

resolver(df)`,
    hints: [
      "Recorre `df.columns` y quédate con los nombres que empiezan por `\"tmp_\"` (`str.startswith`).",
      "`drop(columns=...)` acepta una lista de columnas.",
      "`rename(columns={...})` usa un diccionario de nombre viejo a nombre nuevo.",
    ],
    tests: [
      {
        name: "Elimina las columnas tmp_",
        code: `r = resolver(df.copy())
assert not any(c.startswith("tmp_") for c in r.columns), f"Quedan columnas internas: {list(r.columns)}"`,
      },
      {
        name: "Renombra prod y cant",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["producto", "cantidad", "total"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Los valores no cambian",
        code: `r = resolver(df.copy())
esperado = pd.DataFrame({"producto": ["Peluche", "Taza", "Gorra"], "cantidad": [2, 1, 4], "total": [30.0, 7.9, 44.0]})
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con otras columnas internas",
        code: `otro = pd.DataFrame({"tmp_a": [1], "prod": ["Postal"], "tmp_b": [2], "cant": [9], "tmp_c": [3]})
r = resolver(otro)
assert list(r.columns) == ["producto", "cantidad"], f"Columnas: {list(r.columns)}"`,
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
    description: `El **libro de visitas del santuario** guarda el país de cada visitante.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"paises"\`: la lista de países **distintos**, ordenada alfabéticamente
- \`"pais_top"\`: el país que **más visitas** tiene
- \`"visitas_top"\`: cuántas visitas tiene ese país (un número)

> En los datos de los tests nunca hay empate en el primer puesto.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "visitante": ["Ana", "Leo", "Kenji", "Marta", "Aiko", "Pablo", "Hana", "Sora"],
    "pais": ["Chile", "España", "Japón", "España", "Japón", "España", "Japón", "Japón"],
})`,
    starterCode: `def resolver(df):
    return {
        "paises": [],
        "pais_top": None,
        "visitas_top": 0,
    }

resolver(df)`,
    solution: `def resolver(df):
    conteo = df["pais"].value_counts()
    return {
        "paises": sorted(df["pais"].unique()),
        "pais_top": conteo.index[0],
        "visitas_top": int(conteo.iloc[0]),
    }

resolver(df)`,
    hints: [
      "`unique()` devuelve los valores distintos de una columna; `sorted(...)` los ordena.",
      "`value_counts()` cuenta las apariciones y las ordena de mayor a menor.",
      "El primer elemento de ese conteo es el más frecuente: mira su índice y su valor.",
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las claves pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
faltan = {"paises", "pais_top", "visitas_top"} - set(r)
assert not faltan, f"Faltan claves: {faltan}"`,
      },
      {
        name: "Países distintos y ordenados",
        code: `r = resolver(df.copy())
assert list(r["paises"]) == ["Chile", "España", "Japón"], f"Obtenido: {list(r['paises'])}"`,
      },
      {
        name: "País con más visitas",
        code: `r = resolver(df.copy())
assert r["pais_top"] == "Japón", f"Obtenido: {r['pais_top']}"
assert r["visitas_top"] == 4, f"Obtenido: {r['visitas_top']}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"visitante": list("abcde"), "pais": ["Perú", "Kenia", "Perú", "Brasil", "Perú"]})
r = resolver(otro)
assert list(r["paises"]) == ["Brasil", "Kenia", "Perú"], f"Obtenido: {list(r['paises'])}"
assert r["pais_top"] == "Perú" and r["visitas_top"] == 3, f"Obtenido: {r['pais_top']}, {r['visitas_top']}"`,
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
    description: `Fin de semana en la **clínica veterinaria**. La directora quiere un resumen de los pacientes atendidos.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"dosis_totales"\`: la **suma** de la columna \`dosis\`
- \`"mediana_edad"\`: la **mediana** de \`edad\`
- \`"rango_peso"\`: la diferencia entre el peso **máximo** y el **mínimo** (\`peso_kg\`), redondeada a 1 decimal

> Calcula todo a partir de \`df\`: los tests usan otros pacientes.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "paciente": ["Taro", "Sésamo", "Bruma", "Coco", "Ámbar"],
    "edad": [3, 12, 7, 1, 9],
    "peso_kg": [62.4, 118.0, 95.5, 21.3, 104.7],
    "dosis": [2, 1, 3, 4, 2],
})`,
    starterCode: `def resolver(df):
    return {
        "dosis_totales": 0,
        "mediana_edad": 0,
        "rango_peso": 0,
    }

resolver(df)`,
    solution: `def resolver(df):
    return {
        "dosis_totales": int(df["dosis"].sum()),
        "mediana_edad": float(df["edad"].median()),
        "rango_peso": round(float(df["peso_kg"].max() - df["peso_kg"].min()), 1),
    }

resolver(df)`,
    hints: [
      "Las columnas tienen métodos como `.sum()`, `.median()`, `.max()` y `.min()`.",
      "El rango es `máximo - mínimo`; luego usa `round(..., 1)`.",
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las claves pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
faltan = {"dosis_totales", "mediana_edad", "rango_peso"} - set(r)
assert not faltan, f"Faltan claves: {faltan}"`,
      },
      {
        name: "Suma de dosis",
        code: `r = resolver(df.copy())
assert r["dosis_totales"] == 12, f"Obtenido: {r['dosis_totales']}"`,
      },
      {
        name: "Mediana de edad",
        code: `r = resolver(df.copy())
assert r["mediana_edad"] == 7, f"Obtenido: {r['mediana_edad']}"`,
      },
      {
        name: "Rango de peso redondeado",
        code: `r = resolver(df.copy())
assert abs(r["rango_peso"] - 96.7) < 1e-9, f"Obtenido: {r['rango_peso']}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({"paciente": list("abcd"), "edad": [2, 4, 6, 8], "peso_kg": [10.04, 50.0, 30.0, 20.0], "dosis": [1, 1, 1, 1]})
r = resolver(otro)
assert r["dosis_totales"] == 4, f"dosis_totales: {r['dosis_totales']}"
assert r["mediana_edad"] == 5, f"mediana_edad: {r['mediana_edad']}"
assert abs(r["rango_peso"] - 40.0) < 1e-9, f"rango_peso: {r['rango_peso']}"`,
      },
    ],
    tutorialLink: "agregacion",
  },
];
