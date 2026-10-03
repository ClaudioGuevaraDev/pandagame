import type { Challenge } from "../types.ts";

// Funciones de referencia usadas por los tests (no se muestran al usuario).

const ref1 = `def _ref(df):
    t = df.pivot_table(index="reserva", columns="mes", values="kg", aggfunc="sum", fill_value=0)
    t["total"] = t.sum(axis=1)
    t.columns.name = None
    return t.sort_values("total", ascending=False, kind="stable")`;

const ref2 = `def _ref(df):
    meses = [c for c in df.columns if c != "panda"]
    l = df.melt(id_vars="panda", var_name="mes", value_name="kg").dropna(subset=["kg"])
    l["kg"] = l["kg"].astype(int)
    l["_o"] = l["mes"].map({m: i for i, m in enumerate(meses)})
    return l.sort_values(["panda", "_o"]).drop(columns="_o").reset_index(drop=True)`;

const ref3 = `def _ref(df):
    s = df.groupby(["reserva", "año"])["nacimientos"].sum()
    return {
        "serie": s,
        "tabla": s.unstack("año", fill_value=0),
        "chengdu": s.xs("Chengdu", level="reserva"),
    }`;

const ref4 = `def _ref(df):
    d = df.copy()
    media = d.groupby("reserva")["peso_kg"].transform("mean")
    total = d.groupby("reserva")["peso_kg"].transform("sum")
    d["peso_medio_reserva"] = media.round(2)
    d["diferencia"] = (d["peso_kg"] - media).round(2)
    d["pct_reserva"] = (d["peso_kg"] / total * 100).round(1)
    return d[d["diferencia"] > 0]`;

const ref5 = `def _ref(df):
    d = df.sort_values(["panda", "fecha"]).reset_index(drop=True)
    g = d.groupby("panda")["kg"]
    d["ayer"] = g.shift(1)
    d["cambio"] = d["kg"] - d["ayer"]
    d["media_3d"] = g.transform(lambda s: s.rolling(3).mean()).round(2)
    return d`;

const ref6 = `def _ref(df):
    r = df.set_index("fecha").sort_index()["kg"].resample("D")
    out = pd.DataFrame({"total": r.sum(), "comidas": r.count()})
    out["acumulado"] = out["total"].cumsum()
    out.index.name = "fecha"
    return out`;

const ref7 = `def _ref(df):
    d = df.copy()
    d["rank_reserva"] = d.groupby("reserva")["puntos"].rank(method="dense", ascending=False).astype(int)
    d = d[d["rank_reserva"] <= 2].sort_values(["reserva", "rank_reserva", "panda"]).reset_index(drop=True)
    return d[["reserva", "panda", "puntos", "rank_reserva"]]`;

const ref8 = `def _ref(df):
    d = df.copy()
    d["etapa"] = pd.cut(d["edad"], bins=[0, 2, 5, 15, float("inf")], right=False,
                        labels=["cría", "joven", "adulto", "anciano"])
    d["cuartil_peso"] = pd.qcut(d["peso_kg"], 4, labels=["Q1", "Q2", "Q3", "Q4"])
    return {"datos": d, "tabla": pd.crosstab(d["etapa"], d["reserva"])}

def _norm_tabla(t):
    t = t.copy()
    t.index = pd.Index([str(x) for x in t.index], name=t.index.name)
    t.columns = pd.Index([str(x) for x in t.columns], name=t.columns.name)
    return t

def _norm_datos(d):
    d = d.copy()
    for c in ["etapa", "cuartil_peso"]:
        d[c] = d[c].astype(str)
    return d`;

const ref9 = `def _ref(df):
    return (
        df.assign(kg_por_hora=lambda d: (d["kg_bambu"] / d["horas_sueno"]).round(2))
          .query("horas_sueno >= 8")
          .pipe(normalizar, "kg_por_hora")
          .sort_values("kg_por_hora_norm", ascending=False, kind="stable")
          .reset_index(drop=True)
          [["panda", "reserva", "kg_por_hora", "kg_por_hora_norm"]]
    )`;

const ref10 = `def _ref(df, reservas):
    d = df.copy()
    d["panda"] = d["panda"].str.strip().str.title()
    d["kg"] = pd.to_numeric(d["kg"].str.replace(",", ".", regex=False), errors="coerce")
    d = d.dropna(subset=["kg"])
    d["fecha"] = pd.to_datetime(d["fecha"])
    d = d.drop_duplicates()
    d = d.merge(reservas, on="reserva_id", how="left")
    d["reserva"] = d["reserva"].fillna("Desconocida")
    out = (
        d.groupby(["reserva", "panda"], as_index=False)
         .agg(total_kg=("kg", "sum"), dias=("fecha", "nunique"), ultima=("fecha", "max"))
    )
    out["total_kg"] = out["total_kg"].round(2)
    return out.sort_values(["total_kg", "panda"], ascending=[False, True]).reset_index(drop=True)`;

export const dificil: Challenge[] = [
  {
    id: "dificil-1",
    level: "dificil",
    number: 1,
    title: "Pivote",
    icon: "Table2",
    topic: "pivot_table",
    description: `Tienes \`df\` con los kilos de bambú entregados a cada reserva, en formato **largo**: una fila por entrega (\`reserva\`, \`mes\`, \`kg\`). Puede haber varias entregas para la misma reserva y mes.

Completa \`resolver(df)\` para que devuelva una **tabla dinámica** donde:

- El **índice** son las reservas (con nombre \`"reserva"\`).
- Las **columnas** son los meses (en el orden por defecto de \`pivot_table\`, alfabético), con la **suma** de kg.
- Las combinaciones sin datos valen **0** (no \`NaN\`).
- Se añade una última columna \`"total"\` con la suma de cada fila.
- El nombre del eje de columnas debe quedar vacío (\`tabla.columns.name = None\`).
- Las filas se ordenan por \`total\` de **mayor a menor**.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Chengdu", "Ya'an", "Wolong"],
    "mes": ["ene", "ene", "feb", "feb", "feb", "ene", "mar", "mar"],
    "kg": [120, 90, 100, 60, 75, 30, 40, 85],
})`,
    starterCode: `def resolver(df):
    tabla = df  # usa pivot_table
    return tabla

resolver(df)`,
    solution: `def resolver(df):
    tabla = df.pivot_table(index="reserva", columns="mes", values="kg",
                           aggfunc="sum", fill_value=0)
    tabla["total"] = tabla.sum(axis=1)
    tabla.columns.name = None
    return tabla.sort_values("total", ascending=False)

resolver(df)`,
    hints: [
      '`df.pivot_table(index="reserva", columns="mes", values="kg", aggfunc="sum")` crea la tabla.',
      "El parámetro `fill_value=0` rellena los huecos.",
      'Suma por filas con `tabla.sum(axis=1)` y ordena con `sort_values("total", ascending=False)`.',
    ],
    tests: [
      {
        name: "Devuelve un DataFrame indexado por reserva",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "resolver debe devolver un DataFrame"
assert r.index.name == "reserva", f"El índice debe llamarse 'reserva' (es {r.index.name!r})"`,
      },
      {
        name: "Columnas: meses + total",
        code: `r = resolver(df.copy())
assert list(r.columns) == sorted(["ene", "feb", "mar"]) + ["total"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Sin NaN: los huecos valen 0",
        code: `r = resolver(df.copy())
assert not r.isna().any().any(), "La tabla contiene NaN; usa fill_value=0"`,
      },
      {
        name: "Valores y orden correctos",
        code: `${ref1}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref1}
otro = pd.DataFrame({
    "reserva": ["A", "B", "C", "A", "C", "B", "D"],
    "mes": ["abr", "may", "abr", "jun", "jun", "abr", "may"],
    "kg": [5, 40, 12, 7, 3, 1, 22],
})
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "reestructurar",
  },
  {
    id: "dificil-2",
    level: "dificil",
    number: 2,
    title: "Derretir",
    icon: "Droplets",
    topic: "melt",
    description: `El cuidador anotó los kilos de bambú de cada panda en formato **ancho**: una columna \`panda\` y una columna por mes. Si un mes no se registró, hay \`NaN\`.

Completa \`resolver(df)\` para pasarlo a formato **largo** con exactamente las columnas \`["panda", "mes", "kg"]\`:

- Elimina las filas cuyo \`kg\` sea \`NaN\`.
- \`kg\` debe ser de tipo **entero**.
- Ordena por \`panda\` (alfabético) y, dentro de cada panda, por mes **en el orden original de las columnas** (no alfabético).
- El índice debe ser \`0, 1, 2, ...\`.

> Los meses pueden cambiar en los tests: no los escribas a mano.`,
    setup: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin"],
    "ene": [30, 42, np.nan],
    "feb": [28, np.nan, 15],
    "mar": [35, 40, 18],
})`,
    starterCode: `def resolver(df):
    largo = df.melt(id_vars="panda")
    return largo

resolver(df)`,
    solution: `def resolver(df):
    meses = [c for c in df.columns if c != "panda"]
    largo = (
        df.melt(id_vars="panda", var_name="mes", value_name="kg")
          .dropna(subset=["kg"])
          .astype({"kg": int})
    )
    largo["mes"] = pd.Categorical(largo["mes"], categories=meses, ordered=True)
    largo = largo.sort_values(["panda", "mes"]).reset_index(drop=True)
    largo["mes"] = largo["mes"].astype(str)
    return largo

resolver(df)`,
    hints: [
      '`df.melt(id_vars="panda", var_name="mes", value_name="kg")` pasa a formato largo.',
      'Para ordenar los meses según las columnas, conviértelos en un `pd.Categorical(..., categories=meses, ordered=True)` o usa un `map` a su posición.',
      "No olvides `dropna`, `astype(int)` y `reset_index(drop=True)`.",
    ],
    tests: [
      {
        name: "Columnas panda, mes, kg",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["panda", "mes", "kg"], f"Columnas obtenidas: {list(r.columns)}"`,
      },
      {
        name: "Sin NaN y kg entero",
        code: `r = resolver(df.copy())
assert r["kg"].notna().all(), "Quedan filas con kg NaN"
assert pd.api.types.is_integer_dtype(r["kg"]), f"kg debe ser entero (es {r['kg'].dtype})"`,
      },
      {
        name: "Orden por panda y mes original",
        code: `${ref2}
r = resolver(df.copy())
check_frame(r.astype({"mes": str}), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref2}
otro = pd.DataFrame({
    "panda": ["Zhu", "Ana", "Pei", "Kai"],
    "oct": [1.0, np.nan, 3.0, 4.0],
    "abr": [5.0, 6.0, np.nan, 8.0],
    "dic": [np.nan, 9.0, 10.0, 11.0],
})
r = resolver(otro.copy())
check_frame(r.astype({"mes": str}), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "reestructurar",
  },
  {
    id: "dificil-3",
    level: "dificil",
    number: 3,
    title: "Índices múltiples",
    icon: "Network",
    topic: "MultiIndex, stack/unstack",
    description: `\`df\` contiene nacimientos de pandas por \`reserva\` y \`año\` (puede haber varias filas por combinación).

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"serie"\`: una **Series** con la suma de \`nacimientos\` y un **MultiIndex** \`(reserva, año)\` (lo que da un \`groupby\` por dos columnas).
- \`"tabla"\`: esa serie convertida en tabla con \`unstack\`: reservas en filas, años en columnas, y \`0\` donde no hubo datos.
- \`"chengdu"\`: la sub-serie de la reserva \`"Chengdu"\`, indexada solo por \`año\` (pista: \`xs\` o \`loc\`).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "reserva": ["Chengdu", "Chengdu", "Wolong", "Chengdu", "Wolong", "Ya'an", "Chengdu"],
    "año": [2024, 2025, 2024, 2024, 2026, 2025, 2026],
    "nacimientos": [2, 3, 1, 1, 4, 2, 5],
})`,
    starterCode: `def resolver(df):
    serie = df.groupby("reserva")["nacimientos"].sum()
    return {
        "serie": serie,
        "tabla": None,
        "chengdu": None,
    }

resolver(df)`,
    solution: `def resolver(df):
    serie = df.groupby(["reserva", "año"])["nacimientos"].sum()
    return {
        "serie": serie,
        "tabla": serie.unstack("año", fill_value=0),
        "chengdu": serie.xs("Chengdu", level="reserva"),
    }

resolver(df)`,
    hints: [
      'Agrupa por dos columnas: `df.groupby(["reserva", "año"])["nacimientos"].sum()`.',
      '`serie.unstack("año", fill_value=0)` mueve el nivel año a las columnas.',
      '`serie.xs("Chengdu", level="reserva")` selecciona un valor de un nivel.',
    ],
    tests: [
      {
        name: "serie tiene un MultiIndex (reserva, año)",
        code: `r = resolver(df.copy())
s = r["serie"]
assert isinstance(s, pd.Series), "serie debe ser una Series"
assert isinstance(s.index, pd.MultiIndex), "El índice de serie debe ser un MultiIndex"
assert list(s.index.names) == ["reserva", "año"], f"Niveles: {list(s.index.names)}"`,
      },
      {
        name: "serie suma correctamente",
        code: `${ref3}
check_series(resolver(df.copy())["serie"], _ref(df.copy())["serie"])`,
      },
      {
        name: "tabla con unstack y ceros",
        code: `${ref3}
t = resolver(df.copy())["tabla"]
assert not t.isna().any().any(), "La tabla tiene NaN; usa fill_value=0"
check_frame(t, _ref(df.copy())["tabla"])`,
      },
      {
        name: "chengdu indexada por año",
        code: `${ref3}
check_series(resolver(df.copy())["chengdu"], _ref(df.copy())["chengdu"])`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref3}
otro = pd.DataFrame({
    "reserva": ["Chengdu", "Foping", "Chengdu", "Foping", "Qinling"],
    "año": [2020, 2020, 2022, 2021, 2022],
    "nacimientos": [7, 1, 2, 3, 9],
})
r, e = resolver(otro.copy()), _ref(otro.copy())
check_series(r["serie"], e["serie"])
check_frame(r["tabla"], e["tabla"])
check_series(r["chengdu"], e["chengdu"])`,
      },
    ],
    tutorialLink: "reestructurar",
  },
  {
    id: "dificil-4",
    level: "dificil",
    number: 4,
    title: "Transformar en grupo",
    icon: "Shuffle",
    topic: "groupby().transform",
    description: `\`df\` tiene el peso de cada panda y su reserva. Queremos comparar cada panda **con su propia reserva**, sin perder filas (por eso \`transform\` y no \`agg\`).

Completa \`resolver(df)\` para que añada estas columnas (en este orden) al final:

1. \`"peso_medio_reserva"\`: media de \`peso_kg\` de su reserva, **redondeada a 2** decimales.
2. \`"diferencia"\`: \`peso_kg\` − media de su reserva (usa la media **sin redondear**), redondeada a 2.
3. \`"pct_reserva"\`: porcentaje que representa su peso sobre el total de su reserva (\`peso / suma * 100\`), redondeado a 1.

Después devuelve **solo los pandas por encima de la media de su reserva** (\`diferencia > 0\`), manteniendo el **orden y el índice original**.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Kai"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong", "Chengdu", "Ya'an", "Ya'an"],
    "peso_kg": [80.5, 110.0, 45.2, 120.3, 95.1, 60.0, 88.4],
})`,
    starterCode: `def resolver(df):
    df["peso_medio_reserva"] = df.groupby("reserva")["peso_kg"].mean()
    return df

resolver(df)`,
    solution: `def resolver(df):
    g = df.groupby("reserva")["peso_kg"]
    media = g.transform("mean")
    df = df.assign(
        peso_medio_reserva=media.round(2),
        diferencia=(df["peso_kg"] - media).round(2),
        pct_reserva=(df["peso_kg"] / g.transform("sum") * 100).round(1),
    )
    return df[df["diferencia"] > 0]

resolver(df)`,
    hints: [
      '`df.groupby("reserva")["peso_kg"].mean()` devuelve una fila por reserva; `transform("mean")` devuelve un valor por fila.',
      'Guarda la media sin redondear en una variable y úsala para calcular la diferencia.',
      'Filtra al final con `df[df["diferencia"] > 0]` sin hacer `reset_index`.',
    ],
    tests: [
      {
        name: "Añade las 3 columnas en orden",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["panda", "reserva", "peso_kg", "peso_medio_reserva", "diferencia", "pct_reserva"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Solo pandas por encima de su media",
        code: `r = resolver(df.copy())
assert (r["diferencia"] > 0).all(), "Hay filas con diferencia <= 0"
assert sorted(r["panda"]) == sorted(["Mei", "Tao", "Yun", "Kai"]), f"Pandas obtenidos: {list(r['panda'])}"`,
      },
      {
        name: "Mantiene el índice original",
        code: `r = resolver(df.copy())
assert list(r.index) == [0, 3, 4, 6], f"Índice obtenido: {list(r.index)}"`,
      },
      {
        name: "Valores correctos",
        code: `${ref4}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref4}
otro = pd.DataFrame({
    "panda": list("abcdefgh"),
    "reserva": ["X", "Y", "X", "X", "Y", "Z", "Z", "Y"],
    "peso_kg": [10.0, 50.5, 33.3, 12.1, 70.0, 99.9, 1.0, 20.2],
}, index=[10, 20, 30, 40, 50, 60, 70, 80])
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "dificil-5",
    level: "dificil",
    number: 5,
    title: "Ventanas",
    icon: "AppWindow",
    topic: "rolling y shift",
    description: `\`df\` registra cuántos kg de bambú comió cada panda cada día, pero las filas vienen **desordenadas**.

Completa \`resolver(df)\` para que:

1. Ordene por \`panda\` y luego por \`fecha\`, y reinicie el índice (\`0, 1, 2, ...\`).
2. Añada \`"ayer"\`: los kg del día anterior **del mismo panda** (\`NaN\` en su primer día).
3. Añada \`"cambio"\`: \`kg − ayer\`.
4. Añada \`"media_3d"\`: media móvil de **3 días** de \`kg\` **dentro de cada panda** (los dos primeros días de cada panda son \`NaN\`), redondeada a 2.

Columnas finales: \`["panda", "fecha", "kg", "ayer", "cambio", "media_3d"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Mei", "Bao", "Mei", "Bao", "Mei", "Bao"],
    "fecha": pd.to_datetime(["2026-03-02", "2026-03-01", "2026-03-01", "2026-03-03",
                             "2026-03-04", "2026-03-02", "2026-03-03", "2026-03-04"]),
    "kg": [12.0, 15.5, 10.0, 14.0, 13.5, 16.0, 11.0, 15.0],
})`,
    starterCode: `def resolver(df):
    df = df.sort_values("fecha")
    df["ayer"] = df["kg"].shift(1)
    df["cambio"] = df["kg"] - df["ayer"]
    df["media_3d"] = df["kg"].rolling(3).mean()
    return df

resolver(df)`,
    solution: `def resolver(df):
    df = df.sort_values(["panda", "fecha"]).reset_index(drop=True)
    g = df.groupby("panda")["kg"]
    df["ayer"] = g.shift(1)
    df["cambio"] = df["kg"] - df["ayer"]
    df["media_3d"] = g.transform(lambda s: s.rolling(3).mean()).round(2)
    return df

resolver(df)`,
    hints: [
      'Ordena con `sort_values(["panda", "fecha"])` y luego `reset_index(drop=True)`.',
      '`df.groupby("panda")["kg"].shift(1)` desplaza dentro de cada panda.',
      'Para la media móvil por grupo: `groupby("panda")["kg"].transform(lambda s: s.rolling(3).mean())`.',
    ],
    tests: [
      {
        name: "Ordenado por panda y fecha",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["panda", "fecha", "kg", "ayer", "cambio", "media_3d"], f"Columnas: {list(r.columns)}"
assert list(r.index) == list(range(len(r))), "Reinicia el índice"
assert list(r["panda"]) == ["Bao"] * 4 + ["Mei"] * 4, "Ordena primero por panda"`,
      },
      {
        name: "shift no mezcla pandas",
        code: `r = resolver(df.copy())
primeros = r.groupby("panda").head(1)
assert primeros["ayer"].isna().all(), "El primer día de cada panda debe tener ayer = NaN"`,
      },
      {
        name: "Media móvil por panda",
        code: `r = resolver(df.copy())
assert r.groupby("panda")["media_3d"].apply(lambda s: s.iloc[:2].isna().all()).all(), "Los 2 primeros días de cada panda deben ser NaN"`,
      },
      {
        name: "Valores correctos",
        code: `${ref5}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref5}
fechas = pd.date_range("2026-01-01", periods=5, freq="D")
otro = pd.DataFrame({
    "panda": ["Zhu"] * 5 + ["Ana"] * 5 + ["Pei"] * 2,
    "fecha": list(fechas[::-1]) + list(fechas) + list(fechas[:2]),
    "kg": [1.0, 2.0, 3.0, 4.0, 5.0, 9.0, 8.0, 7.0, 7.5, 6.0, 3.3, 4.4],
}).sample(frac=1, random_state=1)
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "series-temporales",
  },
  {
    id: "dificil-6",
    level: "dificil",
    number: 6,
    title: "Remuestreo",
    icon: "CalendarClock",
    topic: "resample",
    description: `\`df\` contiene cada comida de un panda con su marca de tiempo (\`fecha\`, tipo datetime) y los \`kg\` comidos. Hay días en los que **no comió** (no aparecen).

Completa \`resolver(df)\` para que devuelva un resumen **diario** con:

- Índice: cada día entre la primera y la última comida (**incluyendo** los días sin comidas), llamado \`"fecha"\`.
- \`"total"\`: suma de kg del día (0 si no hubo comidas).
- \`"comidas"\`: número de comidas del día (0 si no hubo).
- \`"acumulado"\`: suma acumulada de \`total\`.

Columnas en ese orden.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "fecha": pd.to_datetime([
        "2026-05-01 08:10", "2026-05-01 13:45", "2026-05-01 19:20",
        "2026-05-02 09:00", "2026-05-04 07:30", "2026-05-04 18:00",
        "2026-05-05 12:15",
    ]),
    "kg": [4.5, 6.0, 3.5, 7.2, 5.0, 5.5, 8.1],
})`,
    starterCode: `def resolver(df):
    diario = df.groupby(df["fecha"].dt.date)["kg"].sum()
    return diario

resolver(df)`,
    solution: `def resolver(df):
    kg = df.set_index("fecha").sort_index()["kg"].resample("D")
    out = pd.DataFrame({"total": kg.sum(), "comidas": kg.count()})
    out["acumulado"] = out["total"].cumsum()
    return out

resolver(df)`,
    hints: [
      "`resample` necesita un índice de fechas: `df.set_index(\"fecha\")`.",
      '`.resample("D")` agrupa por día e incluye los días vacíos.',
      "Combina `sum()` y `count()` en un DataFrame y añade `cumsum()`.",
    ],
    tests: [
      {
        name: "DataFrame con columnas total, comidas, acumulado",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["total", "comidas", "acumulado"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Incluye los días sin comidas",
        code: `r = resolver(df.copy())
assert len(r) == 5, f"Se esperaban 5 días (del 1 al 5 de mayo) y hay {len(r)}"
assert isinstance(r.index, pd.DatetimeIndex), "El índice debe ser de fechas"
assert r.index.name == "fecha", "El índice debe llamarse 'fecha'"`,
      },
      {
        name: "Días vacíos valen 0",
        code: `r = resolver(df.copy())
d = r.loc["2026-05-03"]
assert d["total"] == 0 and d["comidas"] == 0, "El 3 de mayo debe tener total 0 y comidas 0"`,
      },
      {
        name: "Valores correctos",
        code: `${ref6}
check_frame(resolver(df.copy()), _ref(df.copy()), check_freq=False)`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref6}
otro = pd.DataFrame({
    "fecha": pd.to_datetime(["2025-12-30 23:59", "2025-12-28 10:00", "2026-01-02 00:01", "2025-12-30 01:00"]),
    "kg": [1.5, 2.0, 3.25, 4.0],
})
check_frame(resolver(otro.copy()), _ref(otro.copy()), check_freq=False)`,
      },
    ],
    tutorialLink: "series-temporales",
  },
  {
    id: "dificil-7",
    level: "dificil",
    number: 7,
    title: "Ranking",
    icon: "Trophy",
    topic: "rank y top-N por grupo",
    description: `Se celebraron las Olimpiadas del Bambú y \`df\` tiene los \`puntos\` de cada \`panda\` por \`reserva\`. ¡Hay empates!

Completa \`resolver(df)\` para obtener el **podio de cada reserva**:

1. Añade \`"rank_reserva"\`: posición dentro de su reserva, de **más a menos puntos**, con método **denso** (\`method="dense"\`: los empatados comparten puesto y el siguiente no salta), como **entero**.
2. Quédate con los que tengan \`rank_reserva <= 2\` (con empates puede haber más de 2 por reserva).
3. Ordena por \`reserva\`, \`rank_reserva\` y \`panda\` (todo ascendente) y reinicia el índice.

Columnas: \`["reserva", "panda", "puntos", "rank_reserva"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Kai", "Zhu", "Ana"],
    "reserva": ["Chengdu", "Chengdu", "Chengdu", "Chengdu", "Wolong", "Wolong", "Wolong", "Ya'an", "Ya'an"],
    "puntos": [88, 95, 88, 70, 60, 75, 60, 90, 85],
})`,
    starterCode: `def resolver(df):
    df["rank_reserva"] = df["puntos"].rank(ascending=False)
    return df.head(2)

resolver(df)`,
    solution: `def resolver(df):
    df = df.assign(
        rank_reserva=df.groupby("reserva")["puntos"]
                       .rank(method="dense", ascending=False)
                       .astype(int)
    )
    podio = df[df["rank_reserva"] <= 2]
    podio = podio.sort_values(["reserva", "rank_reserva", "panda"]).reset_index(drop=True)
    return podio[["reserva", "panda", "puntos", "rank_reserva"]]

resolver(df)`,
    hints: [
      '`df.groupby("reserva")["puntos"].rank(...)` calcula el ranking dentro de cada reserva.',
      'Usa `method="dense", ascending=False` y convierte con `.astype(int)`.',
      "Filtra, ordena por las tres columnas y `reset_index(drop=True)`.",
    ],
    tests: [
      {
        name: "Columnas correctas y rank entero",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["reserva", "panda", "puntos", "rank_reserva"], f"Columnas: {list(r.columns)}"
assert pd.api.types.is_integer_dtype(r["rank_reserva"]), "rank_reserva debe ser entero"`,
      },
      {
        name: "Ranking por reserva (no global)",
        code: `r = resolver(df.copy())
assert set(r["reserva"]) == {"Chengdu", "Wolong", "Ya'an"}, "Cada reserva debe tener su podio"`,
      },
      {
        name: "Empates con método denso",
        code: `r = resolver(df.copy())
ch = r[r["reserva"] == "Chengdu"]
assert list(ch["panda"]) == ["Bao", "Lin", "Mei"], f"Podio de Chengdu: {list(ch['panda'])}"
assert list(ch["rank_reserva"]) == [1, 2, 2], f"Ranks de Chengdu: {list(ch['rank_reserva'])}"`,
      },
      {
        name: "Resultado completo",
        code: `${ref7}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref7}
otro = pd.DataFrame({
    "panda": ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
    "reserva": ["B", "A", "B", "A", "A", "B", "A"],
    "puntos": [10, 50, 10, 50, 40, 5, 30],
})
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "dificil-8",
    level: "dificil",
    number: 8,
    title: "Cortes",
    icon: "Scissors",
    topic: "cut, qcut y crosstab",
    description: `Queremos clasificar a los pandas de \`df\` y ver cuántos hay de cada etapa en cada reserva.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"datos"\`: una copia de \`df\` con dos columnas nuevas:
  - \`"etapa"\` con \`pd.cut\` sobre \`edad\` usando intervalos **cerrados por la izquierda**: \`cría\` [0, 2), \`joven\` [2, 5), \`adulto\` [5, 15), \`anciano\` [15, ∞).
  - \`"cuartil_peso"\` con \`pd.qcut\` sobre \`peso_kg\` en **4 cuantiles** con etiquetas \`Q1\`, \`Q2\`, \`Q3\`, \`Q4\`.
- \`"tabla"\`: \`pd.crosstab\` con las etapas en filas y las reservas en columnas. Las filas deben respetar el orden **cría, joven, adulto, anciano** (mantén \`etapa\` como categórica).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei", "Kai", "Zhu"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Wolong", "Chengdu", "Wolong", "Chengdu", "Chengdu"],
    "edad": [0, 4, 2, 15, 7, 1, 22, 5],
    "peso_kg": [15.0, 70.5, 45.0, 120.0, 98.2, 30.1, 105.4, 88.8],
})`,
    starterCode: `def resolver(df):
    df["etapa"] = pd.cut(df["edad"], bins=4)
    return {
        "datos": df,
        "tabla": None,
    }

resolver(df)`,
    solution: `def resolver(df):
    datos = df.assign(
        etapa=pd.cut(df["edad"], bins=[0, 2, 5, 15, float("inf")], right=False,
                     labels=["cría", "joven", "adulto", "anciano"]),
        cuartil_peso=pd.qcut(df["peso_kg"], 4, labels=["Q1", "Q2", "Q3", "Q4"]),
    )
    return {
        "datos": datos,
        "tabla": pd.crosstab(datos["etapa"], datos["reserva"]),
    }

resolver(df)`,
    hints: [
      '`pd.cut(serie, bins=[0, 2, 5, 15, float("inf")], right=False, labels=[...])`.',
      '`pd.qcut(serie, 4, labels=["Q1", "Q2", "Q3", "Q4"])` divide en cuartiles.',
      '`pd.crosstab(datos["etapa"], datos["reserva"])` cuenta combinaciones.',
    ],
    tests: [
      {
        name: "Etapas con intervalos cerrados por la izquierda",
        code: `r = resolver(df.copy())
et = list(r["datos"]["etapa"].astype(str))
assert et == ["cría", "joven", "joven", "anciano", "adulto", "cría", "anciano", "adulto"], f"Etapas obtenidas: {et}"`,
      },
      {
        name: "Cuartiles de peso",
        code: `${ref8}
r = resolver(df.copy())
assert list(r["datos"]["cuartil_peso"].astype(str)) == list(_ref(df.copy())["datos"]["cuartil_peso"].astype(str)), "Los cuartiles no coinciden; usa pd.qcut con 4 cuantiles"`,
      },
      {
        name: "datos conserva todo lo demás",
        code: `${ref8}
check_frame(_norm_datos(resolver(df.copy())["datos"]), _norm_datos(_ref(df.copy())["datos"]))`,
      },
      {
        name: "Tabla cruzada en orden de etapas",
        code: `${ref8}
t = resolver(df.copy())["tabla"]
assert isinstance(t, pd.DataFrame), "tabla debe ser un DataFrame (usa pd.crosstab)"
check_frame(_norm_tabla(t), _norm_tabla(_ref(df.copy())["tabla"]))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref8}
otro = pd.DataFrame({
    "panda": list("abcdefghij"),
    "reserva": ["X", "Y", "Z", "X", "Y", "Z", "X", "Y", "Z", "X"],
    "edad": [30, 1, 3, 10, 0, 14, 2, 5, 16, 4],
    "peso_kg": [100.0, 12.0, 40.0, 80.0, 9.0, 95.0, 35.0, 60.0, 110.0, 50.0],
})
r, e = resolver(otro.copy()), _ref(otro.copy())
check_frame(_norm_datos(r["datos"]), _norm_datos(e["datos"]))
check_frame(_norm_tabla(r["tabla"]), _norm_tabla(e["tabla"]))`,
      },
    ],
    tutorialLink: "agregacion",
  },
  {
    id: "dificil-9",
    level: "dificil",
    number: 9,
    title: "Encadenamiento",
    icon: "Link",
    topic: "assign + pipe",
    description: `El código de pandas experto se escribe como una **cadena de métodos**, sin variables intermedias ni modificar el DataFrame original. Ya tienes definida la función \`normalizar(df, col)\`, que devuelve una copia con una columna nueva \`col + "_norm"\` escalada entre 0 y 1.

Completa \`resolver(df)\` usando **una sola cadena** que:

1. Con \`assign\`, cree \`"kg_por_hora"\` = \`kg_bambu / horas_sueno\`, redondeada a 2.
2. Se quede con las filas donde \`horas_sueno >= 8\` (prueba \`query\`).
3. Con \`pipe\`, aplique \`normalizar\` a la columna \`"kg_por_hora"\`.
4. Ordene por \`kg_por_hora_norm\` de mayor a menor y reinicie el índice.
5. Devuelva las columnas \`["panda", "reserva", "kg_por_hora", "kg_por_hora_norm"]\`.

> El \`df\` original **no** debe modificarse.`,
    setup: `import pandas as pd

def normalizar(df, col):
    x = df[col]
    return df.assign(**{col + "_norm": ((x - x.min()) / (x.max() - x.min())).round(3)})

df = pd.DataFrame({
    "panda": ["Mei", "Bao", "Lin", "Tao", "Yun", "Pei"],
    "reserva": ["Chengdu", "Wolong", "Chengdu", "Ya'an", "Wolong", "Ya'an"],
    "kg_bambu": [12.0, 18.5, 9.0, 20.0, 15.0, 11.0],
    "horas_sueno": [10, 12, 7, 9, 11, 8],
})`,
    starterCode: `def resolver(df):
    df["kg_por_hora"] = df["kg_bambu"] / df["horas_sueno"]
    return df

resolver(df)`,
    solution: `def resolver(df):
    return (
        df.assign(kg_por_hora=lambda d: (d["kg_bambu"] / d["horas_sueno"]).round(2))
          .query("horas_sueno >= 8")
          .pipe(normalizar, "kg_por_hora")
          .sort_values("kg_por_hora_norm", ascending=False)
          .reset_index(drop=True)
          [["panda", "reserva", "kg_por_hora", "kg_por_hora_norm"]]
    )

resolver(df)`,
    hints: [
      'Envuelve la cadena entre paréntesis para poder partirla en varias líneas.',
      '`assign(kg_por_hora=lambda d: ...)` crea columnas sin modificar el original.',
      '`.pipe(normalizar, "kg_por_hora")` equivale a `normalizar(df, "kg_por_hora")` dentro de la cadena.',
    ],
    tests: [
      {
        name: "No modifica el df original",
        code: `original = df.copy()
copia = df.copy()
resolver(copia)
check_frame(copia, original)`,
      },
      {
        name: "Usa pipe con normalizar",
        code: `g = resolver.__globals__
orig = g["normalizar"]
llamadas = []
def espia(d, col):
    llamadas.append(col)
    return orig(d, col)
g["normalizar"] = espia
try:
    resolver(df.copy())
finally:
    g["normalizar"] = orig
assert llamadas == ["kg_por_hora"], "Debes aplicar normalizar(…, 'kg_por_hora') una vez (con pipe)"`,
      },
      {
        name: "Filtra y ordena",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["panda", "reserva", "kg_por_hora", "kg_por_hora_norm"], f"Columnas: {list(r.columns)}"
assert "Lin" not in list(r["panda"]), "Lin duerme menos de 8 horas y no debe aparecer"
assert r["kg_por_hora_norm"].is_monotonic_decreasing, "Ordena de mayor a menor"`,
      },
      {
        name: "Valores correctos",
        code: `${ref9}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref9}
otro = pd.DataFrame({
    "panda": ["a", "b", "c", "d", "e"],
    "reserva": ["X", "Y", "X", "Z", "Y"],
    "kg_bambu": [5.0, 30.0, 14.0, 22.0, 7.5],
    "horas_sueno": [8, 15, 6, 10, 9],
})
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
      },
    ],
    tutorialLink: "experto",
  },
  {
    id: "dificil-10",
    level: "dificil",
    number: 10,
    title: "Gran final",
    icon: "Crown",
    topic: "Pipeline completo",
    description: `¡El reto del Maestro Panda! Tienes dos tablas:

- \`df\`: registros de alimentación **sucios** con \`panda\`, \`fecha\` (texto), \`kg\` (texto) y \`reserva_id\`.
- \`reservas\`: catálogo con \`reserva_id\` y \`reserva\` (nombre).

Completa \`resolver(df, reservas)\` siguiendo estos pasos **en orden**:

1. **Texto**: limpia \`panda\` quitando espacios sobrantes y poniéndolo en formato título (\`" mEI "\` → \`"Mei"\`).
2. **Números**: \`kg\` usa coma decimal (\`"12,5"\`) y tiene basura (\`"n/a"\`, \`""\`). Cambia la coma por punto, convierte a número (lo inválido → \`NaN\`) y **elimina** las filas sin kg.
3. **Fechas**: convierte \`fecha\` a datetime.
4. **Duplicados**: elimina filas duplicadas (ya limpias).
5. **Merge**: une con \`reservas\` por \`reserva_id\` conservando todos los registros; si la reserva no existe, \`reserva = "Desconocida"\`.
6. **Agrupa** por \`reserva\` y \`panda\` con: \`total_kg\` (suma, redondeada a 2), \`dias\` (nº de fechas distintas) y \`ultima\` (fecha más reciente).
7. **Ordena** por \`total_kg\` descendente y, en empate, por \`panda\` ascendente. Índice \`0, 1, 2, ...\`.

Columnas finales: \`["reserva", "panda", "total_kg", "dias", "ultima"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": [" mei", "Bao ", "MEI", "lin", "Mei", "bao", "Tao", "lin ", "mei"],
    "fecha": ["2026-02-01", "2026-02-01", "2026-02-02", "2026-02-01", "2026-02-02",
              "2026-02-03", "2026-02-03", "2026-02-04", "2026-02-05"],
    "kg": ["12,5", "15", "10,25", "n/a", "10,25", "14,75", "9", "8,5", ""],
    "reserva_id": [1, 2, 1, 1, 1, 2, 9, 1, 1],
})

reservas = pd.DataFrame({
    "reserva_id": [1, 2, 3],
    "reserva": ["Chengdu", "Wolong", "Ya'an"],
})`,
    starterCode: `def resolver(df, reservas):
    # 1. texto  2. números  3. fechas  4. duplicados
    # 5. merge  6. groupby  7. orden
    return df

resolver(df, reservas)`,
    solution: `def resolver(df, reservas):
    limpio = (
        df.assign(
            panda=df["panda"].str.strip().str.title(),
            kg=pd.to_numeric(df["kg"].str.replace(",", ".", regex=False), errors="coerce"),
            fecha=pd.to_datetime(df["fecha"]),
        )
        .dropna(subset=["kg"])
        .drop_duplicates()
        .merge(reservas, on="reserva_id", how="left")
        .fillna({"reserva": "Desconocida"})
    )
    resumen = (
        limpio.groupby(["reserva", "panda"], as_index=False)
              .agg(total_kg=("kg", "sum"), dias=("fecha", "nunique"), ultima=("fecha", "max"))
              .assign(total_kg=lambda d: d["total_kg"].round(2))
              .sort_values(["total_kg", "panda"], ascending=[False, True])
              .reset_index(drop=True)
    )
    return resumen

resolver(df, reservas)`,
    hints: [
      'Texto: `.str.strip().str.title()`. Números: `.str.replace(",", ".")` + `pd.to_numeric(..., errors="coerce")`.',
      'Merge con `how="left"` y luego `fillna({"reserva": "Desconocida"})`.',
      'Agregación con nombre: `.agg(total_kg=("kg", "sum"), dias=("fecha", "nunique"), ultima=("fecha", "max"))`.',
    ],
    tests: [
      {
        name: "Columnas finales",
        code: `r = resolver(df.copy(), reservas.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["reserva", "panda", "total_kg", "dias", "ultima"], f"Columnas: {list(r.columns)}"`,
      },
      {
        name: "Nombres de panda limpios",
        code: `r = resolver(df.copy(), reservas.copy())
assert sorted(set(r["panda"])) == ["Bao", "Lin", "Mei", "Tao"], f"Pandas: {sorted(set(r['panda']))}"`,
      },
      {
        name: "kg limpios y duplicados eliminados",
        code: `r = resolver(df.copy(), reservas.copy())
mei = r[r["panda"] == "Mei"].iloc[0]
assert abs(mei["total_kg"] - 22.75) < 1e-9, f"Mei debería sumar 22.75 kg (sin el duplicado ni el vacío) y suma {mei['total_kg']}"
assert mei["dias"] == 2, f"Mei comió en 2 días distintos, no {mei['dias']}"`,
      },
      {
        name: "Reserva desconocida",
        code: `r = resolver(df.copy(), reservas.copy())
tao = r[r["panda"] == "Tao"]
assert len(tao) == 1 and tao.iloc[0]["reserva"] == "Desconocida", "Tao (reserva_id 9) debe quedar en 'Desconocida'"`,
      },
      {
        name: "ultima es una fecha",
        code: `r = resolver(df.copy(), reservas.copy())
assert pd.api.types.is_datetime64_any_dtype(r["ultima"]), "ultima debe ser datetime (convierte fecha con pd.to_datetime)"`,
      },
      {
        name: "Resultado completo y ordenado",
        code: `${ref10}
check_frame(resolver(df.copy(), reservas.copy()), _ref(df.copy(), reservas.copy()))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref10}
otro = pd.DataFrame({
    "panda": ["  ana", "ANA", "kai", "Kai ", "ana", "zhu", "pei", "Pei", "kai"],
    "fecha": ["2025-07-01", "2025-07-01", "2025-07-02", "2025-07-02", "2025-07-09", "2025-07-03", "2025-07-04", "2025-07-05", "2025-07-02"],
    "kg": ["3,5", "3,5", "7", "7", "1,25", "x", "2", "8,75", "1"],
    "reserva_id": [5, 5, 6, 6, 5, 6, 7, 7, 6],
})
cat = pd.DataFrame({"reserva_id": [5, 6], "reserva": ["Foping", "Qinling"]})
check_frame(resolver(otro.copy(), cat.copy()), _ref(otro.copy(), cat.copy()))`,
      },
    ],
    tutorialLink: "experto",
  },
];
