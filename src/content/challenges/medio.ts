import type { Challenge } from "../types.ts";

export const medio: Challenge[] = [
  {
    id: "medio-1",
    level: "medio",
    number: 1,
    title: "Huecos",
    icon: "CircleDashed",
    topic: "Valores nulos",
    description: `La **clínica veterinaria** del santuario registra los chequeos de las crías, pero el termómetro y el pulsómetro fallan a veces y quedan **huecos** (\`NaN\`). Además, algunas fichas se guardaron sin el nombre del paciente.

Completa \`resolver(df)\` para que devuelva un DataFrame limpio:

1. Elimina las filas sin \`paciente\`.
2. Rellena los huecos de \`temperatura_c\` y \`pulso\` con la **mediana de su propio \`centro\`** (no la mediana global).
3. Reinicia el índice (\`0, 1, 2, ...\`).

Las columnas deben quedar en el mismo orden: \`paciente\`, \`centro\`, \`temperatura_c\`, \`pulso\`.`,
    setup: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "paciente": ["Kiko", "Nube", None, "Sora", "Dango", "Momo", "Tofu"],
    "centro": ["Qinling", "Qinling", "Foping", "Foping", "Qinling", "Foping", "Foping"],
    "temperatura_c": [37.9, np.nan, 38.4, 38.1, 38.3, np.nan, 37.7],
    "pulso": [88.0, 92.0, np.nan, np.nan, 80.0, 95.0, 101.0],
})`,
    starterCode: `def resolver(df):
    # 1. quita las fichas sin paciente
    # 2. rellena cada hueco con la mediana de su centro
    return df

resolver(df)`,
    solution: `def resolver(df):
    limpio = df.dropna(subset=["paciente"]).copy()
    por_centro = limpio.groupby("centro")
    for col in ["temperatura_c", "pulso"]:
        limpio[col] = limpio[col].fillna(por_centro[col].transform("median"))
    return limpio.reset_index(drop=True)

resolver(df)`,
    hints: [
      "Primero `dropna(subset=[...])` para quitar las fichas sin paciente.",
      "`df.groupby(\"centro\")[col].transform(\"median\")` devuelve, para cada fila, la mediana de su centro (con el mismo índice que `df`).",
      "Pásale esa Series a `fillna(...)` columna por columna y termina con `reset_index(drop=True)`.",
    ],
    tests: [
      {
        name: "Se eliminan las fichas sin paciente",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert len(r) == 6, f"Se esperaban 6 filas y hay {len(r)}"
assert r["paciente"].notna().all(), "Aún hay pacientes nulos"`,
      },
      {
        name: "No quedan huecos en las mediciones",
        code: `r = resolver(df.copy())
assert r[["temperatura_c", "pulso"]].isna().sum().sum() == 0, "Quedan valores nulos en temperatura_c o pulso"`,
      },
      {
        name: "Se usa la mediana del propio centro",
        code: `r = resolver(df.copy())
nube = r.loc[r["paciente"] == "Nube", "temperatura_c"].iloc[0]
assert abs(nube - 38.1) < 1e-9, f"Nube (Qinling) debería tener 38.1 (mediana de Qinling) y tiene {nube}"
sora = r.loc[r["paciente"] == "Sora", "pulso"].iloc[0]
assert abs(sora - 98.0) < 1e-9, f"Sora (Foping) debería tener pulso 98.0 (mediana de Foping sin la ficha anónima) y tiene {sora}"`,
      },
      {
        name: "Resultado completo con índice reiniciado",
        code: `esperado = pd.DataFrame({
    "paciente": ["Kiko", "Nube", "Sora", "Dango", "Momo", "Tofu"],
    "centro": ["Qinling", "Qinling", "Foping", "Qinling", "Foping", "Foping"],
    "temperatura_c": [37.9, 38.1, 38.1, 38.3, 37.9, 37.7],
    "pulso": [88.0, 92.0, 98.0, 80.0, 95.0, 101.0],
})
check_frame(resolver(df.copy()), esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "paciente": ["Rin", None, "Yuki", "Pipa", "Luma"],
    "centro": ["Labahe", "Labahe", "Labahe", "Tangjiahe", "Tangjiahe"],
    "temperatura_c": [np.nan, 39.0, 38.0, 37.0, np.nan],
    "pulso": [70.0, 75.0, np.nan, 90.0, 110.0],
})
esperado = pd.DataFrame({
    "paciente": ["Rin", "Yuki", "Pipa", "Luma"],
    "centro": ["Labahe", "Labahe", "Tangjiahe", "Tangjiahe"],
    "temperatura_c": [38.0, 38.0, 37.0, 37.0],
    "pulso": [70.0, 70.0, 90.0, 110.0],
})
check_frame(resolver(otro), esperado)`,
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
    description: `El registro de **vacunas** de la guardería tiene entradas repetidas: cuando una cría recibe un refuerzo, se añade otra fila con la misma \`cria\` y la misma \`vacuna\`, pero con otra \`fecha\` (texto \`AAAA-MM-DD\`) y otro \`lote\`.

Completa \`resolver(df)\` para quedarte solo con la **aplicación más reciente** de cada combinación \`cria\` + \`vacuna\`.

- El resultado debe estar ordenado por \`cria\` y luego por \`vacuna\` (alfabéticamente).
- Reinicia el índice.
- Las columnas no cambian: \`cria\`, \`vacuna\`, \`fecha\`, \`lote\`.

> Ojo: las filas no vienen ordenadas por fecha.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Kiko", "Nube", "Kiko", "Sora", "Nube", "Kiko", "Sora"],
    "vacuna": ["rabia", "moquillo", "rabia", "rabia", "moquillo", "moquillo", "rabia"],
    "fecha": ["2025-03-10", "2025-01-05", "2024-11-20", "2025-02-14", "2025-04-01", "2025-03-10", "2025-02-14"],
    "lote": ["R-118", "M-020", "R-090", "R-101", "M-044", "M-031", "R-101"],
})`,
    starterCode: `def resolver(df):
    return df.drop_duplicates()

resolver(df)`,
    solution: `def resolver(df):
    return (
        df.sort_values("fecha")
        .drop_duplicates(subset=["cria", "vacuna"], keep="last")
        .sort_values(["cria", "vacuna"])
        .reset_index(drop=True)
    )

resolver(df)`,
    hints: [
      "Un duplicado aquí no es una fila idéntica: es la misma pareja `cria` + `vacuna`. Mira el parámetro `subset` de `drop_duplicates`.",
      "Para quedarte con la más reciente, ordena primero por `fecha` (en formato AAAA-MM-DD el orden de texto es cronológico) y usa `keep=\"last\"`.",
      "Al final vuelve a ordenar por `[\"cria\", \"vacuna\"]` y reinicia el índice.",
    ],
    tests: [
      {
        name: "Una fila por cría y vacuna",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert not r.duplicated(subset=["cria", "vacuna"]).any(), "Aún hay combinaciones cria + vacuna repetidas"
assert len(r) == 4, f"Se esperaban 4 filas y hay {len(r)}"`,
      },
      {
        name: "Se conserva la aplicación más reciente",
        code: `r = resolver(df.copy())
fila = r[(r["cria"] == "Kiko") & (r["vacuna"] == "rabia")]
assert fila["fecha"].iloc[0] == "2025-03-10", f"Para Kiko/rabia debía quedar 2025-03-10 y quedó {fila['fecha'].iloc[0]}"
fila = r[(r["cria"] == "Nube") & (r["vacuna"] == "moquillo")]
assert fila["lote"].iloc[0] == "M-044", f"Para Nube/moquillo debía quedar el lote M-044 y quedó {fila['lote'].iloc[0]}"`,
      },
      {
        name: "Orden e índice correctos",
        code: `esperado = pd.DataFrame({
    "cria": ["Kiko", "Kiko", "Nube", "Sora"],
    "vacuna": ["moquillo", "rabia", "moquillo", "rabia"],
    "fecha": ["2025-03-10", "2025-03-10", "2025-04-01", "2025-02-14"],
    "lote": ["M-031", "R-118", "M-044", "R-101"],
})
check_frame(resolver(df.copy()), esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "cria": ["Yuki", "Yuki", "Pipa", "Yuki", "Pipa"],
    "vacuna": ["parvo", "parvo", "parvo", "rabia", "parvo"],
    "fecha": ["2024-06-01", "2025-06-01", "2023-01-15", "2024-12-31", "2024-01-15"],
    "lote": ["P-1", "P-9", "P-2", "R-5", "P-7"],
})
esperado = pd.DataFrame({
    "cria": ["Pipa", "Yuki", "Yuki"],
    "vacuna": ["parvo", "parvo", "rabia"],
    "fecha": ["2024-01-15", "2025-06-01", "2024-12-31"],
    "lote": ["P-7", "P-9", "R-5"],
})
check_frame(resolver(otro), esperado)`,
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
    description: `La **tienda de souvenirs** exportó su inventario desde una hoja de cálculo y todo llegó como texto:

- \`precio\`: con símbolo y formato local, por ejemplo \`"$1.250,50"\` (punto de miles, coma decimal).
- \`stock\`: con la unidad pegada, por ejemplo \`"12 uds"\`.
- \`oferta\`: \`"sí"\` o \`"no"\`.

Completa \`resolver(df)\` para devolver el DataFrame con tipos útiles:

- \`precio\` → número decimal (\`1250.5\`)
- \`stock\` → entero
- \`oferta\` → booleano (\`True\` si es \`"sí"\`)

Mantén las columnas en el mismo orden (\`producto\`, \`precio\`, \`stock\`, \`oferta\`).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "producto": ["peluche gigante", "taza bambú", "llavero", "póster"],
    "precio": ["$1.250,50", "$89,90", "$15,00", "$2.000,00"],
    "stock": ["12 uds", "140 uds", "1300 uds", "7 uds"],
    "oferta": ["no", "sí", "sí", "no"],
})`,
    starterCode: `def resolver(df):
    df = df.copy()
    df["precio"] = df["precio"]  # ¿cómo lo conviertes a número?
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.copy()
    df["precio"] = (
        df["precio"]
        .str.replace("$", "", regex=False)
        .str.replace(".", "", regex=False)
        .str.replace(",", ".", regex=False)
        .astype(float)
    )
    df["stock"] = df["stock"].str.replace(" uds", "", regex=False).astype(int)
    df["oferta"] = df["oferta"].eq("sí")
    return df

resolver(df)`,
    hints: [
      "Para el precio, limpia el texto paso a paso con `.str.replace(..., regex=False)`: quita `$`, quita los puntos de miles y cambia la coma por punto.",
      "Después de limpiar, `.astype(float)` o `.astype(int)` hacen la conversión.",
      "Una comparación como `serie == \"sí\"` (o `.eq(\"sí\")`) ya devuelve booleanos.",
    ],
    tests: [
      {
        name: "precio es numérico y correcto",
        code: `r = resolver(df.copy())
assert pd.api.types.is_float_dtype(r["precio"]), f"precio es de tipo {r['precio'].dtype}, se esperaba decimal"
assert list(r["precio"]) == [1250.5, 89.9, 15.0, 2000.0], f"Precios obtenidos: {list(r['precio'])}"`,
      },
      {
        name: "stock es entero",
        code: `r = resolver(df.copy())
assert pd.api.types.is_integer_dtype(r["stock"]), f"stock es de tipo {r['stock'].dtype}, se esperaba entero"
assert list(r["stock"]) == [12, 140, 1300, 7], f"Stock obtenido: {list(r['stock'])}"`,
      },
      {
        name: "oferta es booleano",
        code: `r = resolver(df.copy())
assert pd.api.types.is_bool_dtype(r["oferta"]), f"oferta es de tipo {r['oferta'].dtype}, se esperaba bool"
assert list(r["oferta"]) == [False, True, True, False], f"Ofertas obtenidas: {list(r['oferta'])}"`,
      },
      {
        name: "No modifica el original y conserva el orden de columnas",
        code: `copia = df.copy()
r = resolver(copia)
assert list(r.columns) == ["producto", "precio", "stock", "oferta"], f"Columnas: {list(r.columns)}"
assert copia["precio"].iloc[0] == "$1.250,50", "resolver no debe modificar el DataFrame original"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "producto": ["gorra", "mapa"],
    "precio": ["$12.345,67", "$3,05"],
    "stock": ["0 uds", "25 uds"],
    "oferta": ["sí", "no"],
})
r = resolver(otro)
assert list(r["precio"]) == [12345.67, 3.05], f"Precios: {list(r['precio'])}"
assert list(r["stock"]) == [0, 25], f"Stock: {list(r['stock'])}"
assert list(r["oferta"]) == [True, False], f"Oferta: {list(r['oferta'])}"`,
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
    description: `Cada collar GPS tiene un **código** con el formato \`CENTRO-AÑO-SEXO-NÚMERO\`, por ejemplo \`"qin-2019-F-07"\`. Los apodos, en cambio, se escribieron a mano y tienen **espacios de sobra** (también entre palabras).

Completa \`resolver(df)\` para devolver un DataFrame **nuevo** con estas columnas, en este orden:

| columna | qué contiene |
|---|---|
| \`apodo\` | el apodo sin espacios al inicio/final, con **un solo espacio** entre palabras y en formato Título (\`"Kiko Sol"\`) |
| \`centro\` | la parte del centro, en **MAYÚSCULAS** (\`"QIN"\`) |
| \`anio\` | el año como entero |
| \`sexo\` | \`"F"\` o \`"M"\` |
| \`numero\` | el número como entero (\`7\`) |

Usa una **expresión regular**: los códigos pueden traer las letras del centro en minúsculas o mayúsculas.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "codigo": ["qin-2019-F-07", "FOP-2021-M-12", "lab-2020-M-03", "Qin-2022-F-15"],
    "apodo": ["  kiko   sol ", "NUBE", "dango    de miel", "  momo"],
})`,
    starterCode: `def resolver(df):
    partes = df["codigo"]  # extrae las partes del código
    return df

resolver(df)`,
    solution: `def resolver(df):
    partes = df["codigo"].str.extract(r"^([A-Za-z]+)-(\\d{4})-([FM])-(\\d+)$")
    return pd.DataFrame({
        "apodo": df["apodo"].str.strip().str.replace(r"\\s+", " ", regex=True).str.title(),
        "centro": partes[0].str.upper(),
        "anio": partes[1].astype(int),
        "sexo": partes[2],
        "numero": partes[3].astype(int),
    })

resolver(df)`,
    hints: [
      "`df[\"codigo\"].str.extract(r\"...\")` devuelve un DataFrame con una columna por cada grupo entre paréntesis de la expresión regular.",
      "Un patrón como `([A-Za-z]+)-(\\d{4})-([FM])-(\\d+)` captura las cuatro partes.",
      "Para los espacios internos: `.str.replace(r\"\\s+\", \" \", regex=True)` junta varios espacios en uno.",
    ],
    tests: [
      {
        name: "Columnas correctas y en orden",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["apodo", "centro", "anio", "sexo", "numero"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Apodos normalizados",
        code: `r = resolver(df.copy())
assert list(r["apodo"]) == ["Kiko Sol", "Nube", "Dango De Miel", "Momo"], f"Apodos: {list(r['apodo'])}"`,
      },
      {
        name: "Partes del código extraídas",
        code: `r = resolver(df.copy())
assert list(r["centro"]) == ["QIN", "FOP", "LAB", "QIN"], f"Centros: {list(r['centro'])}"
assert list(r["sexo"]) == ["F", "M", "M", "F"], f"Sexos: {list(r['sexo'])}"
assert list(r["anio"]) == [2019, 2021, 2020, 2022], f"Años: {list(r['anio'])}"
assert list(r["numero"]) == [7, 12, 3, 15], f"Números: {list(r['numero'])}"`,
      },
      {
        name: "Año y número son enteros",
        code: `r = resolver(df.copy())
assert pd.api.types.is_integer_dtype(r["anio"]), f"anio es {r['anio'].dtype}"
assert pd.api.types.is_integer_dtype(r["numero"]), f"numero es {r['numero'].dtype}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "codigo": ["tang-2018-M-101", "LAB-2023-F-1"],
    "apodo": ["rin  rin", " yuki   NIEVE  "],
})
esperado = pd.DataFrame({
    "apodo": ["Rin Rin", "Yuki Nieve"],
    "centro": ["TANG", "LAB"],
    "anio": [2018, 2023],
    "sexo": ["M", "F"],
    "numero": [101, 1],
})
check_frame(resolver(otro), esperado)`,
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
    description: `La nutricionista calcula la **ración diaria** de cada cría a partir de **varias columnas**:

1. Un \`factor\` según su \`actividad\`: \`"baja"\` → 0.04, \`"media"\` → 0.05, \`"alta"\` → 0.06.
2. La \`racion_kg\` es \`masa_kg × factor\`, **más 0.5 kg de leche** si la cría tiene **menos de 12** \`meses\`. Redondea a 2 decimales.

Completa \`resolver(df)\` para devolver el DataFrame con **dos columnas nuevas** al final: \`factor\` y \`racion_kg\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Kiko", "Nube", "Sora", "Dango", "Momo"],
    "masa_kg": [35.0, 60.0, 12.5, 80.0, 48.0],
    "meses": [14, 30, 7, 50, 11],
    "actividad": ["alta", "media", "alta", "baja", "media"],
})`,
    starterCode: `def resolver(df):
    df = df.copy()
    df["factor"] = 0
    df["racion_kg"] = 0
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.copy()
    df["factor"] = df["actividad"].map({"baja": 0.04, "media": 0.05, "alta": 0.06})

    def racion(fila):
        extra = 0.5 if fila["meses"] < 12 else 0.0
        return round(fila["masa_kg"] * fila["factor"] + extra, 2)

    df["racion_kg"] = df.apply(racion, axis=1)
    return df

resolver(df)`,
    hints: [
      "`serie.map({...})` traduce cada valor de `actividad` a su factor.",
      "Cuando el cálculo necesita varias columnas de la misma fila, `df.apply(funcion, axis=1)` le pasa cada fila a tu función.",
      "Dentro de la función accedes a `fila[\"masa_kg\"]`, `fila[\"meses\"]`, etc. Usa `round(valor, 2)`.",
    ],
    tests: [
      {
        name: "Se añaden factor y racion_kg al final",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["cria", "masa_kg", "meses", "actividad", "factor", "racion_kg"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "El factor depende de la actividad",
        code: `r = resolver(df.copy())
assert list(r["factor"]) == [0.06, 0.05, 0.06, 0.04, 0.05], f"Factores: {list(r['factor'])}"`,
      },
      {
        name: "Las crías menores de 12 meses reciben leche",
        code: `r = resolver(df.copy())
assert list(r["racion_kg"]) == [2.1, 3.0, 1.25, 3.2, 2.9], f"Raciones: {list(r['racion_kg'])}"`,
      },
      {
        name: "No modifica el original",
        code: `copia = df.copy()
resolver(copia)
assert "factor" not in copia.columns, "resolver no debe modificar el DataFrame original"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "cria": ["Pipa", "Luma", "Rin"],
    "masa_kg": [10.0, 100.0, 20.0],
    "meses": [12, 3, 2],
    "actividad": ["baja", "alta", "media"],
})
r = resolver(otro)
assert list(r["factor"]) == [0.04, 0.06, 0.05], f"Factores: {list(r['factor'])}"
assert list(r["racion_kg"]) == [0.4, 6.5, 1.5], f"Raciones: {list(r['racion_kg'])}"`,
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
    description: `En el **torneo de trepado** cada equipo compite en varias rondas. La tabla tiene una fila por intento: \`equipo\`, \`ronda\`, \`competidor\` y \`segundos\` que tardó en subir.

Completa \`resolver(df)\` para obtener, por cada combinación de **equipo y ronda**:

- \`tiempo_medio\`: media de \`segundos\`, redondeada a 1 decimal.
- \`participantes\`: cuántos intentos hubo.

Quédate solo con las combinaciones que tengan **al menos 2 participantes**. El resultado debe tener las columnas \`equipo\`, \`ronda\`, \`tiempo_medio\`, \`participantes\` (como columnas, no como índice), ordenado por \`equipo\` y \`ronda\`, con índice reiniciado.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "equipo": ["Garras", "Garras", "Garras", "Brotes", "Brotes", "Brotes", "Garras", "Brotes"],
    "ronda": [1, 1, 2, 1, 2, 2, 2, 2],
    "competidor": ["Kiko", "Nube", "Kiko", "Sora", "Dango", "Momo", "Nube", "Tofu"],
    "segundos": [42.0, 38.5, 40.0, 51.2, 47.0, 45.5, 39.0, 49.1],
})`,
    starterCode: `def resolver(df):
    return df.groupby("equipo")["segundos"].mean()

resolver(df)`,
    solution: `def resolver(df):
    r = (
        df.groupby(["equipo", "ronda"], as_index=False)
        .agg(tiempo_medio=("segundos", "mean"), participantes=("segundos", "count"))
    )
    r["tiempo_medio"] = r["tiempo_medio"].round(1)
    r = r[r["participantes"] >= 2]
    return r.sort_values(["equipo", "ronda"]).reset_index(drop=True)

resolver(df)`,
    hints: [
      "Agrupa por las dos claves a la vez: `df.groupby([\"equipo\", \"ronda\"], as_index=False)`.",
      "Con `.agg(tiempo_medio=(\"segundos\", \"mean\"), participantes=(\"segundos\", \"count\"))` calculas ambas métricas.",
      "Filtra el resultado con una máscara sobre `participantes` y termina ordenando y reiniciando el índice.",
    ],
    tests: [
      {
        name: "Devuelve las columnas pedidas",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame (usa as_index=False o reset_index)"
assert list(r.columns) == ["equipo", "ronda", "tiempo_medio", "participantes"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Se descartan grupos con un solo intento",
        code: `r = resolver(df.copy())
assert not ((r["equipo"] == "Brotes") & (r["ronda"] == 1)).any(), "Brotes en la ronda 1 solo tiene 1 intento y debe quedar fuera"
assert (r["participantes"] >= 2).all(), "Hay grupos con menos de 2 participantes"`,
      },
      {
        name: "Valores correctos",
        code: `esperado = pd.DataFrame({
    "equipo": ["Brotes", "Garras", "Garras"],
    "ronda": [2, 1, 2],
    "tiempo_medio": [47.2, 40.2, 39.5],
    "participantes": [3, 2, 2],
})
check_frame(resolver(df.copy()), esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "equipo": ["Zarpas", "Zarpas", "Zarpas", "Hojas", "Hojas"],
    "ronda": [3, 3, 3, 1, 1],
    "competidor": ["Rin", "Yuki", "Pipa", "Luma", "Rin"],
    "segundos": [30.0, 31.0, 35.0, 60.0, 61.0],
})
esperado = pd.DataFrame({
    "equipo": ["Hojas", "Zarpas"],
    "ronda": [1, 3],
    "tiempo_medio": [60.5, 32.0],
    "participantes": [2, 3],
})
check_frame(resolver(otro), esperado)`,
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
    description: `Las **estaciones meteorológicas** del bosque envían lecturas de temperatura a distintas horas (\`hora\` de 0 a 23). Las filas llegan desordenadas.

Completa \`resolver(df)\` para devolver un resumen con **una fila por \`estacion\`** y estas columnas, en este orden:

| columna | qué es |
|---|---|
| \`estacion\` | nombre de la estación |
| \`lecturas\` | número de lecturas |
| \`minima\` | temperatura mínima |
| \`maxima\` | temperatura máxima |
| \`amplitud\` | \`maxima - minima\` |
| \`primera\` | temperatura de la lectura **más temprana** del día |
| \`ultima\` | temperatura de la lectura **más tardía** |

Ordena de **mayor a menor amplitud** (si empatan, por nombre de estación) y reinicia el índice.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "estacion": ["Cumbre", "Valle", "Cumbre", "Valle", "Cumbre", "Valle", "Arroyo", "Arroyo"],
    "hora": [14, 6, 6, 14, 22, 22, 9, 18],
    "temp_c": [8.5, 12.0, -1.5, 21.0, 2.0, 15.5, 10.0, 13.0],
})`,
    starterCode: `def resolver(df):
    return df.groupby("estacion")["temp_c"].agg(["min", "max"])

resolver(df)`,
    solution: `def resolver(df):
    r = (
        df.sort_values("hora")
        .groupby("estacion", as_index=False)
        .agg(
            lecturas=("temp_c", "count"),
            minima=("temp_c", "min"),
            maxima=("temp_c", "max"),
            primera=("temp_c", "first"),
            ultima=("temp_c", "last"),
        )
    )
    r.insert(4, "amplitud", r["maxima"] - r["minima"])
    return r.sort_values(["amplitud", "estacion"], ascending=[False, True]).reset_index(drop=True)

resolver(df)`,
    hints: [
      "Las funciones `\"first\"` y `\"last\"` toman la primera y la última fila de cada grupo, así que ordena antes por `hora`.",
      "La agregación con nombres es `.agg(nombre=(\"columna\", \"funcion\"), ...)`.",
      "`amplitud` no es una agregación directa: calcúlala después con las columnas `maxima` y `minima` y colócala en su sitio (`insert` o reordenando columnas).",
    ],
    tests: [
      {
        name: "Columnas en el orden pedido",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["estacion", "lecturas", "minima", "maxima", "amplitud", "primera", "ultima"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "primera y ultima siguen el orden de las horas",
        code: `r = resolver(df.copy()).set_index("estacion")
assert r.loc["Cumbre", "primera"] == -1.5, f"La primera lectura de Cumbre (6h) es -1.5, no {r.loc['Cumbre', 'primera']}"
assert r.loc["Cumbre", "ultima"] == 2.0, f"La última lectura de Cumbre (22h) es 2.0, no {r.loc['Cumbre', 'ultima']}"`,
      },
      {
        name: "Resumen completo y ordenado por amplitud",
        code: `esperado = pd.DataFrame({
    "estacion": ["Cumbre", "Valle", "Arroyo"],
    "lecturas": [3, 3, 2],
    "minima": [-1.5, 12.0, 10.0],
    "maxima": [8.5, 21.0, 13.0],
    "amplitud": [10.0, 9.0, 3.0],
    "primera": [-1.5, 12.0, 10.0],
    "ultima": [2.0, 15.5, 13.0],
})
check_frame(resolver(df.copy()), esperado)`,
      },
      {
        name: "Funciona con otros datos (y desempata por nombre)",
        code: `otro = pd.DataFrame({
    "estacion": ["Lago", "Bosque", "Lago", "Bosque"],
    "hora": [23, 12, 1, 3],
    "temp_c": [5.0, 9.0, 3.0, 7.0],
})
esperado = pd.DataFrame({
    "estacion": ["Bosque", "Lago"],
    "lecturas": [2, 2],
    "minima": [7.0, 3.0],
    "maxima": [9.0, 5.0],
    "amplitud": [2.0, 2.0],
    "primera": [7.0, 3.0],
    "ultima": [9.0, 5.0],
})
check_frame(resolver(otro), esperado)`,
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
    description: `Llegan **pedidos de bambú** y hay que cruzarlos con la tabla de **proveedores**. Las claves se llaman distinto en cada tabla: \`cod_prov\` en \`pedidos\` y \`codigo\` en \`proveedores\`. Algunos pedidos traen un código que **no existe**.

Completa \`resolver(pedidos, proveedores)\` para devolver un **diccionario** con dos claves:

- \`"sin_proveedor"\`: DataFrame con los pedidos cuyo código no aparece en \`proveedores\`, con las columnas originales de \`pedidos\` (\`pedido\`, \`cod_prov\`, \`kilos\`), ordenado por \`pedido\` y con índice reiniciado.
- \`"kilos_por_region"\`: una Series con el total de \`kilos\` de los pedidos **válidos** por \`region\` del proveedor, ordenada por región (índice = región).`,
    setup: `import pandas as pd

pedidos = pd.DataFrame({
    "pedido": [301, 302, 303, 304, 305, 306],
    "cod_prov": ["BX", "QZ", "BX", "KM", "TT", "QZ"],
    "kilos": [120, 80, 60, 200, 45, 30],
})

proveedores = pd.DataFrame({
    "codigo": ["BX", "QZ", "LP"],
    "proveedor": ["Bambú Express", "Quinta Zen", "La Pradera"],
    "region": ["norte", "sur", "norte"],
})`,
    starterCode: `def resolver(pedidos, proveedores):
    cruce = pedidos.merge(proveedores, left_on="cod_prov", right_on="codigo")
    return {"sin_proveedor": None, "kilos_por_region": None}

resolver(pedidos, proveedores)`,
    solution: `def resolver(pedidos, proveedores):
    cruce = pedidos.merge(
        proveedores, left_on="cod_prov", right_on="codigo", how="left", indicator=True
    )
    huerfanos = (
        cruce.loc[cruce["_merge"] == "left_only", ["pedido", "cod_prov", "kilos"]]
        .sort_values("pedido")
        .reset_index(drop=True)
    )
    validos = cruce[cruce["_merge"] == "both"]
    kilos = validos.groupby("region")["kilos"].sum().sort_index()
    return {"sin_proveedor": huerfanos, "kilos_por_region": kilos}

resolver(pedidos, proveedores)`,
    hints: [
      "Como las claves tienen nombres distintos, usa `left_on=` y `right_on=` en `merge`.",
      "Con `how=\"left\"` e `indicator=True` aparece la columna `_merge`: vale `\"left_only\"` para los pedidos sin pareja.",
      "Para los kilos usa solo las filas con `_merge == \"both\"` y agrupa por `region`.",
    ],
    tests: [
      {
        name: "Devuelve un diccionario con las dos claves",
        code: `r = resolver(pedidos.copy(), proveedores.copy())
assert isinstance(r, dict), "resolver debe devolver un diccionario"
assert set(r) == {"sin_proveedor", "kilos_por_region"}, f"Claves: {set(r)}"`,
      },
      {
        name: "Detecta los pedidos sin proveedor",
        code: `r = resolver(pedidos.copy(), proveedores.copy())
esperado = pd.DataFrame({"pedido": [304, 305], "cod_prov": ["KM", "TT"], "kilos": [200, 45]})
check_frame(r["sin_proveedor"], esperado)`,
      },
      {
        name: "Suma los kilos válidos por región",
        code: `r = resolver(pedidos.copy(), proveedores.copy())
esperado = pd.Series([180, 110], index=pd.Index(["norte", "sur"], name="region"), name="kilos")
check_series(r["kilos_por_region"], esperado, check_names=False)`,
      },
      {
        name: "Funciona con otros datos",
        code: `p = pd.DataFrame({"pedido": [9, 7, 8], "cod_prov": ["AA", "ZZ", "AA"], "kilos": [10, 5, 15]})
v = pd.DataFrame({"codigo": ["AA"], "proveedor": ["Alfa"], "region": ["este"]})
r = resolver(p, v)
check_frame(r["sin_proveedor"], pd.DataFrame({"pedido": [7], "cod_prov": ["ZZ"], "kilos": [5]}))
check_series(r["kilos_por_region"], pd.Series([25], index=pd.Index(["este"], name="region")), check_names=False)`,
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
    description: `Los dos **almacenes** del santuario llevan su inventario en tablas con columnas **distintas**:

- \`norte\`: \`articulo\`, \`cantidad\`, \`lote\`
- \`sur\`: \`articulo\`, \`cantidad\`, \`caducidad\`

Completa \`resolver(norte, sur, solo_comunes=False)\` para apilarlas en una sola tabla:

- Añade una columna \`origen\` **al principio**, con \`"norte"\` o \`"sur"\` según la tabla de la que viene la fila.
- Si \`solo_comunes\` es \`False\`, conserva **todas** las columnas (las que falten quedan como \`NaN\`), en este orden: \`origen\`, \`articulo\`, \`cantidad\`, \`lote\`, \`caducidad\`.
- Si \`solo_comunes\` es \`True\`, conserva solo las columnas que existen en **ambas** tablas (\`origen\`, \`articulo\`, \`cantidad\`).
- El índice debe ser continuo: \`0, 1, 2, ...\``,
    setup: `import pandas as pd

norte = pd.DataFrame({
    "articulo": ["brotes", "cañas", "hojas"],
    "cantidad": [40, 15, 90],
    "lote": ["N-01", "N-02", "N-03"],
})

sur = pd.DataFrame({
    "articulo": ["cañas", "fruta"],
    "cantidad": [22, 8],
    "caducidad": ["2025-07-01", "2025-06-20"],
})`,
    starterCode: `def resolver(norte, sur, solo_comunes=False):
    return pd.concat([norte, sur])

resolver(norte, sur)`,
    solution: `def resolver(norte, sur, solo_comunes=False):
    union = "inner" if solo_comunes else "outer"
    r = pd.concat(
        [norte.assign(origen="norte"), sur.assign(origen="sur")],
        join=union,
        ignore_index=True,
    )
    columnas = ["origen"] + [c for c in r.columns if c != "origen"]
    return r[columnas]

resolver(norte, sur)`,
    hints: [
      "`df.assign(origen=\"norte\")` añade una columna constante sin modificar el original.",
      "`pd.concat([...], join=\"outer\")` conserva todas las columnas; con `join=\"inner\"` solo las comunes. `ignore_index=True` deja el índice continuo.",
      "Para poner `origen` primero, reordena las columnas: `r[[\"origen\"] + resto]`.",
    ],
    tests: [
      {
        name: "Apila todas las filas con índice continuo",
        code: `r = resolver(norte.copy(), sur.copy())
assert len(r) == 5, f"Se esperaban 5 filas y hay {len(r)}"
assert list(r.index) == [0, 1, 2, 3, 4], f"Índice: {list(r.index)}"`,
      },
      {
        name: "origen va primero y marca cada tabla",
        code: `r = resolver(norte.copy(), sur.copy())
assert r.columns[0] == "origen", f"La primera columna es {r.columns[0]}"
assert list(r["origen"]) == ["norte", "norte", "norte", "sur", "sur"], f"origen: {list(r['origen'])}"`,
      },
      {
        name: "Con todas las columnas, las que faltan quedan vacías",
        code: `r = resolver(norte.copy(), sur.copy())
assert list(r.columns) == ["origen", "articulo", "cantidad", "lote", "caducidad"], f"Columnas: {list(r.columns)}"
assert r["lote"].isna().sum() == 2 and r["caducidad"].isna().sum() == 3, "Las columnas que no existen en una tabla deben quedar como NaN"`,
      },
      {
        name: "solo_comunes=True deja solo las columnas compartidas",
        code: `r = resolver(norte.copy(), sur.copy(), solo_comunes=True)
esperado = pd.DataFrame({
    "origen": ["norte", "norte", "norte", "sur", "sur"],
    "articulo": ["brotes", "cañas", "hojas", "cañas", "fruta"],
    "cantidad": [40, 15, 90, 22, 8],
})
check_frame(r, esperado)`,
      },
      {
        name: "Funciona con otros datos",
        code: `a = pd.DataFrame({"articulo": ["sal"], "cantidad": [1], "lote": ["X"]})
b = pd.DataFrame({"articulo": ["miel", "té"], "cantidad": [2, 3], "caducidad": ["2026-01-01", "2026-02-02"]})
r = resolver(a, b)
assert list(r["origen"]) == ["norte", "sur", "sur"], f"origen: {list(r['origen'])}"
assert list(r["articulo"]) == ["sal", "miel", "té"], f"articulo: {list(r['articulo'])}"
assert list(r.index) == [0, 1, 2], "El índice debe ser continuo"`,
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
    description: `El programa de **apadrinamiento** guarda cuándo empezó y terminó cada padrinazgo, con fechas en formato **día/mes/año** (\`"15/03/2024"\`). Si el padrinazgo sigue activo, \`fin\` está vacío.

Completa \`resolver(df, corte="2025-06-30")\` para devolver el DataFrame con:

- \`inicio\` y \`fin\` convertidos a fechas (\`datetime\`). Cuidado: el día va **primero**.
- \`trimestre\`: el trimestre de inicio como texto, por ejemplo \`"2024-T1"\`.
- \`meses\`: los **meses completos** de padrinazgo, desde \`inicio\` hasta \`fin\` (o hasta la fecha \`corte\` si sigue activo). Un mes cuenta solo si se cumplió: del 15/03 al 14/04 son 0 meses; del 15/03 al 15/04, 1 mes.

Las columnas nuevas van al final, en ese orden: \`trimestre\`, \`meses\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "padrino": ["Escuela Arcoíris", "Familia Ruiz", "Club Andino", "Ana P."],
    "inicio": ["15/03/2024", "01/11/2023", "31/01/2025", "10/06/2025"],
    "fin": ["14/04/2024", "01/05/2025", None, None],
})`,
    starterCode: `def resolver(df, corte="2025-06-30"):
    df = df.copy()
    df["inicio"] = pd.to_datetime(df["inicio"])
    return df

resolver(df)`,
    solution: `def resolver(df, corte="2025-06-30"):
    df = df.copy()
    df["inicio"] = pd.to_datetime(df["inicio"], dayfirst=True)
    df["fin"] = pd.to_datetime(df["fin"], dayfirst=True)
    hasta = df["fin"].fillna(pd.Timestamp(corte))
    ini = df["inicio"]
    df["trimestre"] = ini.dt.year.astype(str) + "-T" + ini.dt.quarter.astype(str)
    meses = (hasta.dt.year - ini.dt.year) * 12 + (hasta.dt.month - ini.dt.month)
    df["meses"] = (meses - (hasta.dt.day < ini.dt.day).astype(int)).astype(int)
    return df

resolver(df)`,
    hints: [
      "`pd.to_datetime(serie, dayfirst=True)` entiende fechas día/mes/año; los vacíos quedan como `NaT`.",
      "`.dt.quarter` da el trimestre (1–4). Para los activos, rellena `fin` con `pd.Timestamp(corte)` usando `fillna`.",
      "Meses completos: `(años de diferencia) * 12 + (meses de diferencia)`, y resta 1 cuando el día final es menor que el día de inicio.",
    ],
    tests: [
      {
        name: "inicio y fin son fechas (día primero)",
        code: `r = resolver(df.copy())
assert pd.api.types.is_datetime64_any_dtype(r["inicio"]), f"inicio es {r['inicio'].dtype}"
assert pd.api.types.is_datetime64_any_dtype(r["fin"]), f"fin es {r['fin'].dtype}"
assert r["inicio"].iloc[1] == pd.Timestamp("2023-11-01"), f"01/11/2023 debe ser 1 de noviembre, no {r['inicio'].iloc[1]}"
assert r["fin"].isna().sum() == 2, "Los padrinazgos activos deben tener fin vacío (NaT)"`,
      },
      {
        name: "Trimestre de inicio",
        code: `r = resolver(df.copy())
assert list(r["trimestre"]) == ["2024-T1", "2023-T4", "2025-T1", "2025-T2"], f"Trimestres: {list(r['trimestre'])}"`,
      },
      {
        name: "Meses completos (con fecha de corte para los activos)",
        code: `r = resolver(df.copy())
assert list(r["meses"]) == [0, 18, 4, 0], f"Meses: {list(r['meses'])}"
assert list(r.columns[-2:]) == ["trimestre", "meses"], f"Las columnas nuevas deben ir al final: {list(r.columns)}"`,
      },
      {
        name: "Respeta el parámetro corte",
        code: `r = resolver(df.copy(), corte="2026-01-31")
assert list(r["meses"]) == [0, 18, 12, 7], f"Con corte 2026-01-31 se esperaban [0, 18, 12, 7] y se obtuvo {list(r['meses'])}"`,
      },
      {
        name: "Funciona con otros datos",
        code: `otro = pd.DataFrame({
    "padrino": ["X", "Y"],
    "inicio": ["29/02/2024", "05/12/2022"],
    "fin": ["28/02/2025", "05/12/2024"],
})
r = resolver(otro)
assert list(r["meses"]) == [11, 24], f"Meses: {list(r['meses'])}"
assert list(r["trimestre"]) == ["2024-T1", "2022-T4"], f"Trimestres: {list(r['trimestre'])}"`,
      },
    ],
    tutorialLink: "series-temporales",
  },
];
