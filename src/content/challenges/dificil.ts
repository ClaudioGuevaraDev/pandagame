import type { Challenge } from "../types.ts";

// Funciones de referencia usadas por los tests (no se muestran al usuario).

const ref1 = `def _ref(df):
    d = df.assign(ingreso=df["unidades"] * df["precio"])
    t = d.pivot_table(index="tienda", columns="categoria", values="ingreso", aggfunc="sum", fill_value=0)
    t = (t.div(t.sum(axis=1), axis=0) * 100).round(1)
    t.columns.name = None
    return t`;

const ref2 = `def _ref(df):
    l = df.melt(id_vars="cria", var_name="_col", value_name="_v")
    p = l["_col"].str.split("_", expand=True)
    l["_m"] = p[0]
    l["anio"] = p[1].astype(int)
    t = l.pivot_table(index=["cria", "anio"], columns="_m", values="_v", aggfunc="first").reset_index()
    t.columns.name = None
    return t[["cria", "anio", "peso", "altura"]].sort_values(["cria", "anio"]).reset_index(drop=True)`;

const ref3 = `def _ref(df):
    s = df.groupby(["clinica", "trimestre"])["consultas"].sum()
    total = s.groupby(level="trimestre").transform("sum")
    return {
        "por_trimestre": s.swaplevel().sort_index(),
        "t2": s.xs("T2", level="trimestre"),
        "cuota": (s / total * 100).round(1),
        "tabla": s.unstack("trimestre", fill_value=0),
    }`;

const ref4 = `def _ref(df):
    d = df.copy()
    d["peso_g"] = d["peso_g"].fillna(d.groupby("sala")["peso_g"].transform("median"))
    g = d.groupby("sala")["peso_g"]
    d["z_sala"] = ((d["peso_g"] - g.transform("mean")) / g.transform("std")).round(2)
    d["puesto_sala"] = g.rank(method="min", ascending=False).astype(int)
    return d`;

const ref5 = `def _ref(df):
    d = df.sort_values(["cria", "dia"]).reset_index(drop=True)
    g = d.groupby("cria")["pasos"]
    d["var_pct"] = (g.pct_change() * 100).round(1)
    d["max_3"] = g.transform(lambda s: s.rolling(3, min_periods=1).max())
    sube = g.diff() > 0
    bloque = (~sube).groupby(d["cria"]).cumsum()
    d["racha"] = sube.astype(int).groupby([d["cria"], bloque]).cumsum()
    return d`;

const ref6 = `def _ref(df):
    r = df.set_index("momento").sort_index()["personas"].resample("W")
    out = pd.DataFrame({"visitantes": r.sum(), "grupos": r.count()})
    out["cambio"] = out["visitantes"].diff()
    out.index.name = "semana"
    return out`;

const ref7 = `def _ref(df, n=3):
    d = df.copy()
    d["posicion"] = d.groupby("categoria")["segundos"].rank(method="min").astype(int)
    d = d[d["posicion"] <= n].sort_values(["categoria", "posicion", "dorsal"]).reset_index(drop=True)
    return d[["categoria", "posicion", "dorsal", "corredor", "segundos"]]`;

const ref8 = `def _ref(df):
    d = df.copy()
    d["rango"] = pd.cut(d["temperatura"], bins=[35, 37, 38.5, 40, 43], right=False,
                        labels=["baja", "normal", "alta", "fiebre"])
    d["talla"] = pd.qcut(d["peso_kg"], 3, labels=["ligero", "medio", "pesado"])
    tabla = (pd.crosstab(d["turno"], d["rango"], normalize="index") * 100).round(1)
    return {"datos": d, "tabla": tabla}

def _norm_tabla(t):
    t = t.copy()
    t.index = pd.Index([str(x) for x in t.index], name=t.index.name)
    t.columns = pd.Index([str(x) for x in t.columns], name=t.columns.name)
    return t

def _norm_datos(d):
    d = d.copy()
    for c in ["rango", "talla"]:
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
    d = d.merge(reservas, on="id_reserva", how="left")
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
    description: `La tienda de recuerdos del santuario tiene tres puestos (\`tienda\`) que venden peluches, tazas y postales. Cada fila de \`df\` es una venta con sus \`unidades\` y el \`precio\` unitario.

La directora no quiere saber cuánto se vendió, sino **de qué vive cada puesto**: qué **porcentaje de los ingresos** de cada tienda aporta cada categoría.

Completa \`resolver(df)\` para que devuelva una tabla donde:

- El **índice** es \`tienda\` y hay **una columna por categoría** (en orden alfabético, como las ordena \`pivot_table\`).
- Cada celda es el porcentaje de los ingresos (\`unidades * precio\`) de esa tienda que viene de esa categoría, **redondeado a 1 decimal**. Cada fila suma ~100.
- Si una tienda no vendió una categoría, el porcentaje es \`0\`.
- El nombre del eje de columnas debe quedar vacío (\`tabla.columns.name = None\`).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "tienda": ["Entrada", "Mirador", "Entrada", "Cafetería", "Mirador",
               "Entrada", "Cafetería", "Mirador", "Cafetería"],
    "categoria": ["peluches", "tazas", "tazas", "peluches", "peluches",
                  "postales", "tazas", "postales", "postales"],
    "unidades": [10, 4, 6, 3, 8, 20, 5, 15, 10],
    "precio": [12.0, 8.0, 8.0, 12.0, 12.0, 1.5, 8.0, 1.5, 1.5],
})`,
    starterCode: `def resolver(df):
    return df.pivot_table(index="tienda", columns="categoria", values="unidades", aggfunc="sum")

resolver(df)`,
    solution: `def resolver(df):
    ventas = df.assign(ingreso=df["unidades"] * df["precio"])
    tabla = ventas.pivot_table(index="tienda", columns="categoria", values="ingreso",
                               aggfunc="sum", fill_value=0)
    tabla = (tabla.div(tabla.sum(axis=1), axis=0) * 100).round(1)
    tabla.columns.name = None
    return tabla

resolver(df)`,
    hints: [
      "Primero calcula el ingreso de cada venta en una columna nueva (por ejemplo con `assign`).",
      "Con `pivot_table` y `aggfunc=\"sum\"` obtienes el ingreso por tienda y categoría; `fill_value=0` rellena las combinaciones que no existen.",
      "Para pasar a porcentaje de la fila, divide cada fila por su propio total: `div(..., axis=0)` con la suma por filas.",
    ],
    tests: [
      {
        name: "Una fila por tienda y una columna por categoría",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.index) == ["Cafetería", "Entrada", "Mirador"], f"Índice: {list(r.index)}"
assert list(r.columns) == ["peluches", "postales", "tazas"], f"Columnas: {list(r.columns)}"
assert r.columns.name is None, "Deja vacío el nombre del eje de columnas"`,
      },
      {
        name: "Cada tienda suma 100 %",
        code: `r = resolver(df.copy())
sumas = r.sum(axis=1)
assert ((sumas - 100).abs() <= 0.2).all(), f"Cada fila debe sumar ~100 y suma {sumas.to_dict()}"`,
      },
      {
        name: "Porcentajes de ingresos (no de unidades)",
        code: `r = resolver(df.copy())
assert r.loc["Entrada", "peluches"] == 60.6, f"Peluches aporta el 60.6 % de los ingresos de Entrada, no {r.loc['Entrada', 'peluches']}"`,
      },
      {
        name: "Tabla completa",
        code: `${ref1}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos (con combinaciones vacías)",
        code: `${ref1}
otro = pd.DataFrame({
    "tienda": ["Puente", "Puente", "Lago", "Lago", "Bosque"],
    "categoria": ["gorras", "llaveros", "gorras", "imanes", "imanes"],
    "unidades": [3, 10, 2, 8, 5],
    "precio": [9.0, 2.5, 9.0, 3.0, 3.0],
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
    description: `La guardería mide a sus crías una vez al año. Alguien guardó todo en formato **ancho**, mezclando la medida y el año en el nombre de la columna: \`peso_2024\`, \`altura_2024\`, \`peso_2025\`, \`altura_2025\`…

Completa \`resolver(df)\` para devolver una tabla **larga y ordenada** con:

- Una fila por **cría y año**.
- Columnas exactamente \`["cria", "anio", "peso", "altura"]\`.
- \`anio\` como **número entero**.
- Ordenada por \`cria\` y luego por \`anio\`, con índice \`0, 1, 2, ...\`.

> Ojo: las columnas pueden traer cualquier año, no solo 2024 y 2025. No hay valores faltantes.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Kiko", "Nube", "Lupe"],
    "peso_2024": [35.5, 41.0, 28.25],
    "altura_2024": [62, 70, 55],
    "peso_2025": [52.0, 60.5, 44.0],
    "altura_2025": [78, 85, 71],
})`,
    starterCode: `def resolver(df):
    return df.melt(id_vars="cria")

resolver(df)`,
    solution: `def resolver(df):
    largo = df.melt(id_vars="cria", var_name="medida_anio", value_name="valor")
    partes = largo["medida_anio"].str.split("_", expand=True)
    largo = largo.assign(medida=partes[0], anio=partes[1].astype(int))
    tabla = largo.pivot_table(index=["cria", "anio"], columns="medida",
                              values="valor", aggfunc="first").reset_index()
    tabla.columns.name = None
    return tabla[["cria", "anio", "peso", "altura"]].sort_values(["cria", "anio"]).reset_index(drop=True)

resolver(df)`,
    hints: [
      "Con `melt` pasas todas las columnas de medidas a filas; el nombre de la columna original queda en una columna de texto.",
      "Separa ese texto en dos partes (medida y año) con `.str.split(\"_\", expand=True)` y convierte el año a entero.",
      "Ahora la medida debe volver a ser columna: un `pivot_table` con índice `[\"cria\", \"anio\"]` y `columns` = la medida.",
    ],
    tests: [
      {
        name: "Columnas y tamaño",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["cria", "anio", "peso", "altura"], f"Columnas: {list(r.columns)}"
assert len(r) == 6, f"3 crías × 2 años = 6 filas, no {len(r)}"`,
      },
      {
        name: "anio es entero",
        code: `r = resolver(df.copy())
assert pd.api.types.is_integer_dtype(r["anio"]), f"anio debe ser entero y es {r['anio'].dtype}"`,
      },
      {
        name: "Orden por cría y año",
        code: `r = resolver(df.copy())
assert list(zip(r["cria"], r["anio"]))[:2] == [("Kiko", 2024), ("Kiko", 2025)], "Ordena por cria y luego por anio"
assert list(r.index) == list(range(len(r))), "Reinicia el índice"`,
      },
      {
        name: "Valores correctos",
        code: `${ref2}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Funciona con datos ocultos (otros años)",
        code: `${ref2}
otro = pd.DataFrame({
    "cria": ["Sora", "Dango"],
    "altura_2023": [50, 47],
    "peso_2023": [20.0, 18.5],
    "altura_2026": [90, 88],
    "peso_2026": [70.25, 66.0],
    "altura_2024": [64, 60],
    "peso_2024": [39.0, 35.5],
})
check_frame(resolver(otro.copy()), _ref(otro.copy()))`,
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
    description: `La red de clínicas veterinarias registra cada jornada con su \`clinica\`, el \`trimestre\` (\`"T1"\`…\`"T4"\`) y el número de \`consultas\`. El código inicial ya construye la Series \`s\` con las consultas totales por \`(clinica, trimestre)\`: un **MultiIndex** de dos niveles.

Completa \`resolver(df)\` para que devuelva un **diccionario** con:

- \`"por_trimestre"\`: la misma Series \`s\` pero con los niveles **intercambiados** (primero \`trimestre\`, luego \`clinica\`) y ordenada por el índice.
- \`"t2"\`: las consultas del trimestre \`"T2"\` de cada clínica (selecciona sobre el **segundo** nivel; el resultado tiene índice \`clinica\`).
- \`"cuota"\`: qué **porcentaje** de las consultas de su trimestre hizo cada clínica, redondeado a 1 decimal, con el mismo índice que \`s\`.
- \`"tabla"\`: \`s\` en formato ancho: una fila por clínica y una columna por trimestre, con \`0\` donde una clínica no tuvo consultas ese trimestre.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "clinica": ["Norte", "Sur", "Norte", "Este", "Sur", "Norte", "Este", "Sur", "Este", "Norte", "Sur"],
    "trimestre": ["T1", "T1", "T2", "T2", "T2", "T3", "T3", "T3", "T1", "T1", "T4"],
    "consultas": [12, 7, 15, 9, 11, 8, 14, 6, 5, 4, 10],
})`,
    starterCode: `def resolver(df):
    s = df.groupby(["clinica", "trimestre"])["consultas"].sum()
    return {"por_trimestre": s, "t2": None, "cuota": None, "tabla": None}

resolver(df)`,
    solution: `def resolver(df):
    s = df.groupby(["clinica", "trimestre"])["consultas"].sum()
    total_trimestre = s.groupby(level="trimestre").transform("sum")
    return {
        "por_trimestre": s.swaplevel().sort_index(),
        "t2": s.xs("T2", level="trimestre"),
        "cuota": (s / total_trimestre * 100).round(1),
        "tabla": s.unstack("trimestre", fill_value=0),
    }

resolver(df)`,
    hints: [
      "`swaplevel()` intercambia los niveles de un MultiIndex; después ordena con `sort_index()`.",
      "`xs(valor, level=\"nombre_del_nivel\")` selecciona por un nivel que no es el primero.",
      "Para el total de cada trimestre, agrupa la Series por ese nivel: `s.groupby(level=\"trimestre\")` y usa `transform` para que conserve el índice original. Para la tabla ancha, `unstack` mueve un nivel a las columnas.",
    ],
    tests: [
      {
        name: "Devuelve las tres claves",
        code: `r = resolver(df.copy())
assert isinstance(r, dict) and set(r) == {"por_trimestre", "t2", "cuota", "tabla"}, "Devuelve un dict con por_trimestre, t2, cuota y tabla"`,
      },
      {
        name: "por_trimestre tiene los niveles intercambiados",
        code: `${ref3}
r = resolver(df.copy())
assert list(r["por_trimestre"].index.names) == ["trimestre", "clinica"], f"Niveles: {list(r['por_trimestre'].index.names)}"
check_series(r["por_trimestre"], _ref(df.copy())["por_trimestre"])`,
      },
      {
        name: "t2 selecciona sobre el segundo nivel",
        code: `${ref3}
r = resolver(df.copy())
check_series(r["t2"], _ref(df.copy())["t2"], check_names=False)`,
      },
      {
        name: "Las cuotas de cada trimestre suman 100",
        code: `${ref3}
r = resolver(df.copy())
check_series(r["cuota"], _ref(df.copy())["cuota"], check_names=False)
sumas = r["cuota"].groupby(level="trimestre").sum()
assert ((sumas - 100).abs() <= 0.2).all(), f"Cada trimestre debe sumar ~100: {sumas.to_dict()}"`,
      },
      {
        name: "Tabla ancha con unstack",
        code: `${ref3}
r = resolver(df.copy())
t = r["tabla"]
assert isinstance(t, pd.DataFrame), "tabla debe ser un DataFrame"
assert list(t.columns) == ["T1", "T2", "T3", "T4"], f"Columnas: {list(t.columns)}"
assert t.loc["Este", "T4"] == 0, "Rellena con 0 los trimestres sin consultas"
check_frame(t, _ref(df.copy())["tabla"])`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref3}
otro = pd.DataFrame({
    "clinica": ["Río", "Valle", "Río", "Cima", "Valle", "Cima", "Río"],
    "trimestre": ["T2", "T2", "T3", "T2", "T1", "T1", "T2"],
    "consultas": [3, 9, 4, 6, 2, 7, 5],
})
r, e = resolver(otro.copy()), _ref(otro.copy())
check_series(r["por_trimestre"], e["por_trimestre"])
check_series(r["t2"], e["t2"], check_names=False)
check_series(r["cuota"], e["cuota"], check_names=False)
check_frame(r["tabla"], e["tabla"])`,
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
    description: `En la guardería las crías se pesan por \`sala\`. Algunos pesos (\`peso_g\`) no se anotaron y quedaron vacíos.

Completa \`resolver(df)\` para devolver una **copia** de \`df\` (mismas filas y en el mismo orden) donde:

1. Los \`peso_g\` vacíos se rellenan con la **mediana de su sala** (calculada con los pesos conocidos).
2. Una columna \`z_sala\`: cuántas desviaciones estándar se aleja cada cría de la media de su sala, \`(peso - media_sala) / desviacion_sala\`, **redondeada a 2**. Calcúlala con los pesos ya rellenados.
3. Una columna \`puesto_sala\`: el puesto de cada cría dentro de su sala por peso, de **mayor a menor**. Los empates comparten el puesto más bajo (\`1, 2, 2, 4\`) y es un **entero**.

Columnas finales: \`["cria", "sala", "peso_g", "z_sala", "puesto_sala"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Kiko", "Nube", "Lupe", "Tofu", "Sora", "Dango", "Yuzu", "Momo"],
    "sala": ["A", "A", "A", "B", "B", "B", "B", "A"],
    "peso_g": [820.0, None, 760.0, 1010.0, 950.0, None, 1100.0, 900.0],
})`,
    starterCode: `def resolver(df):
    df = df.copy()
    df["peso_g"] = df["peso_g"].fillna(df["peso_g"].median())
    return df

resolver(df)`,
    solution: `def resolver(df):
    d = df.copy()
    mediana_sala = d.groupby("sala")["peso_g"].transform("median")
    d["peso_g"] = d["peso_g"].fillna(mediana_sala)
    por_sala = d.groupby("sala")["peso_g"]
    d["z_sala"] = ((d["peso_g"] - por_sala.transform("mean")) / por_sala.transform("std")).round(2)
    d["puesto_sala"] = por_sala.rank(method="min", ascending=False).astype(int)
    return d

resolver(df)`,
    hints: [
      "`groupby(\"sala\")[\"peso_g\"].transform(\"median\")` devuelve una Series alineada con cada fila: úsala dentro de `fillna`.",
      "Después de rellenar, vuelve a agrupar: la media y la desviación (`\"std\"`) por sala también salen con `transform`.",
      "El puesto dentro del grupo se calcula con `rank` sobre el groupby; mira el parámetro `method` para los empates.",
    ],
    tests: [
      {
        name: "No quedan pesos vacíos y se usa la mediana de la sala",
        code: `r = resolver(df.copy())
assert r["peso_g"].notna().all(), "No deben quedar pesos vacíos"
nube = r.loc[r["cria"] == "Nube", "peso_g"].iloc[0]
assert nube == 820.0, f"Nube (sala A) debe recibir la mediana de su sala, 820.0, y tiene {nube}"`,
      },
      {
        name: "Columnas y orden de filas",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["cria", "sala", "peso_g", "z_sala", "puesto_sala"], f"Columnas: {list(r.columns)}"
assert list(r["cria"]) == list(df["cria"]), "Mantén las filas en su orden original"`,
      },
      {
        name: "Puesto con empates",
        code: `r = resolver(df.copy())
puestos = dict(zip(r["cria"], r["puesto_sala"]))
assert puestos["Momo"] == 1 and puestos["Kiko"] == 2 and puestos["Nube"] == 2 and puestos["Lupe"] == 4, f"Puestos sala A: {puestos}"
assert pd.api.types.is_integer_dtype(r["puesto_sala"]), "puesto_sala debe ser entero"`,
      },
      {
        name: "Valores completos",
        code: `${ref4}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "No modifica el df original",
        code: `original = df.copy()
copia = df.copy()
resolver(copia)
check_frame(copia, original)`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref4}
otro = pd.DataFrame({
    "cria": ["a", "b", "c", "d", "e", "f", "g"],
    "sala": ["X", "Y", "X", "Y", "X", "Y", "Y"],
    "peso_g": [500.0, 700.0, None, 650.0, 540.0, None, 720.0],
})
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
    description: `Cada cría lleva un podómetro. \`df\` tiene una fila por \`cria\` y \`dia\` (1, 2, 3…) con los \`pasos\` de ese día, **desordenadas**.

Completa \`resolver(df)\` para devolver la tabla ordenada por \`cria\` y \`dia\` (índice \`0, 1, 2, ...\`) con tres columnas nuevas, calculadas **por cría**:

- \`var_pct\`: variación porcentual de los pasos respecto al día anterior, × 100 y **redondeada a 1** (el primer día de cada cría queda vacío).
- \`max_3\`: el máximo de pasos de los últimos 3 días, incluido el actual (los primeros días usan los que haya).
- \`racha\`: cuántos días **seguidos** lleva subiendo hasta hoy. Si hoy no subió respecto a ayer (o es su primer día), vale \`0\`; si subió, es la racha de ayer + 1.

Columnas finales: \`["cria", "dia", "pasos", "var_pct", "max_3", "racha"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Nube", "Kiko", "Kiko", "Nube", "Kiko", "Nube", "Kiko", "Nube", "Kiko", "Kiko", "Nube"],
    "dia": [3, 2, 1, 1, 4, 5, 3, 2, 6, 5, 4],
    "pasos": [900, 1200, 1000, 800, 1400, 700, 1500, 800, 1800, 1600, 1000],
})`,
    starterCode: `def resolver(df):
    return df.sort_values(["cria", "dia"])

resolver(df)`,
    solution: `def resolver(df):
    d = df.sort_values(["cria", "dia"]).reset_index(drop=True)
    pasos = d.groupby("cria")["pasos"]
    d["var_pct"] = (pasos.pct_change() * 100).round(1)
    d["max_3"] = pasos.transform(lambda s: s.rolling(3, min_periods=1).max())
    sube = pasos.diff() > 0
    tramo = (~sube).groupby(d["cria"]).cumsum()
    d["racha"] = sube.astype(int).groupby([d["cria"], tramo]).cumsum()
    return d

resolver(df)`,
    hints: [
      "Ordena primero. Sobre `groupby(\"cria\")[\"pasos\"]` tienes `pct_change()` y `diff()`, y con `transform` puedes aplicar un `rolling(3, min_periods=1)`.",
      "Para la racha, marca los días que suben (`diff() > 0`). Cada día que **no** sube empieza un tramo nuevo: un `cumsum` de esos días numera los tramos.",
      "Dentro de cada combinación (cría, tramo), la suma acumulada de los días que suben es exactamente la racha.",
    ],
    tests: [
      {
        name: "Ordenado por cría y día",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["cria", "dia", "pasos", "var_pct", "max_3", "racha"], f"Columnas: {list(r.columns)}"
assert list(zip(r["cria"], r["dia"]))[:3] == [("Kiko", 1), ("Kiko", 2), ("Kiko", 3)], "Ordena por cria y dia"
assert list(r.index) == list(range(len(r))), "Reinicia el índice"`,
      },
      {
        name: "Variación porcentual por cría",
        code: `r = resolver(df.copy())
kiko = r[r["cria"] == "Kiko"]["var_pct"].tolist()
assert pd.isna(kiko[0]), "El primer día de cada cría no tiene variación"
assert kiko[1:] == [20.0, 25.0, -6.7, 14.3, 12.5], f"var_pct de Kiko: {kiko}"
nube = r[r["cria"] == "Nube"]["var_pct"].tolist()
assert pd.isna(nube[0]), "No mezcles crías: el primer día de Nube no tiene variación"`,
      },
      {
        name: "Máximo de 3 días",
        code: `r = resolver(df.copy())
assert r[r["cria"] == "Nube"]["max_3"].tolist() == [800, 800, 900, 1000, 1000], f"max_3 de Nube: {r[r['cria'] == 'Nube']['max_3'].tolist()}"`,
      },
      {
        name: "Rachas de subida",
        code: `r = resolver(df.copy())
assert r[r["cria"] == "Kiko"]["racha"].tolist() == [0, 1, 2, 0, 1, 2], f"racha de Kiko: {r[r['cria'] == 'Kiko']['racha'].tolist()}"
assert r[r["cria"] == "Nube"]["racha"].tolist() == [0, 0, 1, 2, 0], "Si los pasos se repiten no cuenta como subida"`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref5}
otro = pd.DataFrame({
    "cria": ["x", "y", "x", "y", "x", "y", "x", "x", "y"],
    "dia": [2, 1, 1, 3, 3, 2, 5, 4, 4],
    "pasos": [50, 10, 40, 30, 60, 20, 90, 70, 25],
})
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
    description: `La taquilla del santuario registra cada entrada vendida: el \`momento\` exacto (datetime) y cuántas \`personas\` entraron en ese grupo. Las filas pueden venir **desordenadas**.

Completa \`resolver(df)\` para obtener un **resumen semanal** (semanas que terminan en domingo, la frecuencia \`"W"\`) con:

- **Índice**: el final de cada semana, llamado \`semana\`.
- \`visitantes\`: total de personas de la semana.
- \`grupos\`: cuántas entradas se vendieron.
- \`cambio\`: diferencia de \`visitantes\` respecto a la semana anterior (la primera queda vacía).

Las semanas **sin ventas** también deben aparecer, con \`visitantes = 0\` y \`grupos = 0\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "momento": pd.to_datetime([
        "2026-04-14 11:00", "2026-04-06 10:15", "2026-04-28 10:10", "2026-04-09 09:05",
        "2026-05-02 13:20", "2026-04-07 12:40", "2026-04-27 15:45", "2026-04-12 16:30",
    ]),
    "personas": [5, 4, 7, 6, 4, 2, 2, 3],
})`,
    starterCode: `def resolver(df):
    return df.set_index("momento").resample("ME").sum()

resolver(df)`,
    solution: `def resolver(df):
    semanas = df.set_index("momento").sort_index()["personas"].resample("W")
    resumen = pd.DataFrame({"visitantes": semanas.sum(), "grupos": semanas.count()})
    resumen["cambio"] = resumen["visitantes"].diff()
    resumen.index.name = "semana"
    return resumen

resolver(df)`,
    hints: [
      "`resample` necesita un índice de fechas: usa `set_index(\"momento\")` (y ordénalo).",
      "Con `resample(\"W\")` sobre la columna de personas, `sum()` y `count()` ya devuelven 0 en las semanas vacías.",
      "La variación respecto a la semana anterior es un `diff()` sobre la columna de visitantes.",
    ],
    tests: [
      {
        name: "Columnas e índice semanal",
        code: `r = resolver(df.copy())
assert isinstance(r, pd.DataFrame), "Debe devolver un DataFrame"
assert list(r.columns) == ["visitantes", "grupos", "cambio"], f"Columnas: {list(r.columns)}"
assert r.index.name == "semana", f"El índice debe llamarse 'semana', no {r.index.name!r}"
assert all(d.dayofweek == 6 for d in r.index), "Cada semana debe terminar en domingo (frecuencia 'W')"`,
      },
      {
        name: "Semanas sin ventas con 0",
        code: `r = resolver(df.copy())
vacias = r[r["grupos"] == 0]
assert len(vacias) >= 1, "Debe aparecer la semana sin ventas"
assert (vacias["visitantes"] == 0).all(), "Una semana sin ventas tiene 0 visitantes"`,
      },
      {
        name: "Totales y cambio",
        code: `${ref6}
check_frame(resolver(df.copy()), _ref(df.copy()), check_freq=False)`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref6}
otro = pd.DataFrame({
    "momento": pd.to_datetime(["2025-11-03 09:00", "2025-11-30 18:00", "2025-11-05 12:00", "2025-12-08 10:30"]),
    "personas": [3, 8, 1, 6],
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
    description: `¡Carrera de crías! Cada corredor tiene un \`dorsal\`, su \`corredor\` (nombre), su \`categoria\` y su tiempo en \`segundos\` (**menos es mejor**).

Completa \`resolver(df, n=3)\` para obtener el **podio de cada categoría**:

1. Calcula \`posicion\` dentro de su categoría por tiempo: el más rápido es 1. Los **empates** comparten posición y la siguiente se salta (\`1, 1, 1, 4\`). Debe ser un **entero**.
2. Quédate con los corredores con \`posicion <= n\` (si hay empates en el corte, entran todos).
3. Ordena por \`categoria\`, \`posicion\` y, para desempatar, por \`dorsal\` ascendente. Índice \`0, 1, 2, ...\`.
4. Columnas: \`["categoria", "posicion", "dorsal", "corredor", "segundos"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "dorsal": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    "corredor": ["Kiko", "Nube", "Lupe", "Tofu", "Sora", "Dango", "Yuzu", "Momo", "Kumo", "Hana"],
    "categoria": ["crías", "adultos", "crías", "adultos", "crías",
                  "adultos", "crías", "adultos", "crías", "adultos"],
    "segundos": [42.5, 38.0, 40.1, 38.0, 42.5, 45.3, 39.9, 41.0, 44.0, 38.0],
})`,
    starterCode: `def resolver(df, n=3):
    return df.sort_values("segundos").head(n)

resolver(df)`,
    solution: `def resolver(df, n=3):
    d = df.copy()
    d["posicion"] = d.groupby("categoria")["segundos"].rank(method="min").astype(int)
    podio = d[d["posicion"] <= n]
    podio = podio.sort_values(["categoria", "posicion", "dorsal"]).reset_index(drop=True)
    return podio[["categoria", "posicion", "dorsal", "corredor", "segundos"]]

resolver(df)`,
    hints: [
      "`rank` también funciona sobre un groupby: así cada categoría tiene su propio ranking.",
      "Menos segundos es mejor, así que el orden por defecto (ascendente) ya sirve. Para que los empates compartan el puesto más bajo y se salte el siguiente, revisa `method`.",
      "Filtra con `posicion <= n` y ordena por las tres columnas que pide el enunciado.",
    ],
    tests: [
      {
        name: "Columnas y posición entera",
        code: `r = resolver(df.copy())
assert list(r.columns) == ["categoria", "posicion", "dorsal", "corredor", "segundos"], f"Columnas: {list(r.columns)}"
assert pd.api.types.is_integer_dtype(r["posicion"]), "posicion debe ser entero"`,
      },
      {
        name: "Empates comparten posición",
        code: `r = resolver(df.copy())
adultos = r[r["categoria"] == "adultos"]
assert adultos["posicion"].tolist() == [1, 1, 1], f"Tres adultos empatan en 38.0 s: {adultos['posicion'].tolist()}"
assert adultos["dorsal"].tolist() == [12, 14, 20], "Desempata por dorsal ascendente"`,
      },
      {
        name: "Entran todos los empatados en el corte",
        code: `r = resolver(df.copy())
crias = r[r["categoria"] == "crías"]
assert crias["corredor"].tolist() == ["Yuzu", "Lupe", "Kiko", "Sora"], f"Podio de crías: {crias['corredor'].tolist()}"`,
      },
      {
        name: "Resultado completo",
        code: `${ref7}
check_frame(resolver(df.copy()), _ref(df.copy()))`,
      },
      {
        name: "Respeta n con datos ocultos",
        code: `${ref7}
otro = pd.DataFrame({
    "dorsal": [5, 3, 8, 1, 9, 2, 7],
    "corredor": ["a", "b", "c", "d", "e", "f", "g"],
    "categoria": ["X", "X", "Y", "Y", "X", "Y", "X"],
    "segundos": [30.0, 28.5, 50.0, 49.0, 28.5, 49.0, 31.0],
})
check_frame(resolver(otro.copy(), n=2), _ref(otro.copy(), n=2))
check_frame(resolver(otro.copy(), n=1), _ref(otro.copy(), n=1))`,
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
    description: `La veterinaria toma la \`temperatura\` de las crías en tres \`turno\`s (mañana, tarde, noche) y quiere ver en qué turno hay más fiebre.

Completa \`resolver(df)\` para devolver un **diccionario** con:

- \`"datos"\`: una copia de \`df\` con dos columnas nuevas:
  - \`rango\`: la temperatura clasificada en intervalos **cerrados a la izquierda**: \`[35, 37)\` → \`"baja"\`, \`[37, 38.5)\` → \`"normal"\`, \`[38.5, 40)\` → \`"alta"\`, \`[40, 43)\` → \`"fiebre"\`. Así, 37.0 es \`"normal"\` y 40.0 es \`"fiebre"\`.
  - \`talla\`: el \`peso_kg\` repartido en **3 grupos de igual tamaño** por cuantiles: \`"ligero"\`, \`"medio"\`, \`"pesado"\`.
- \`"tabla"\`: una tabla cruzada con los turnos en las filas y los rangos en las columnas, donde cada celda es el **porcentaje de las crías de ese turno** en ese rango, redondeado a 1 decimal (cada fila suma 100).`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "cria": ["Kiko", "Nube", "Lupe", "Tofu", "Sora", "Dango", "Yuzu", "Momo", "Kumo"],
    "turno": ["mañana", "tarde", "noche", "mañana", "tarde", "noche", "mañana", "tarde", "noche"],
    "temperatura": [36.8, 37.0, 38.5, 37.9, 39.2, 36.4, 40.0, 38.4, 37.5],
    "peso_kg": [3.2, 4.1, 2.8, 5.0, 3.9, 4.4, 2.5, 3.6, 4.8],
})`,
    starterCode: `def resolver(df):
    d = df.copy()
    d["rango"] = pd.cut(d["temperatura"], bins=[35, 37, 38.5, 40, 43],
                        labels=["baja", "normal", "alta", "fiebre"])
    return {"datos": d, "tabla": pd.crosstab(d["turno"], d["rango"])}

resolver(df)`,
    solution: `def resolver(df):
    d = df.copy()
    d["rango"] = pd.cut(d["temperatura"], bins=[35, 37, 38.5, 40, 43], right=False,
                        labels=["baja", "normal", "alta", "fiebre"])
    d["talla"] = pd.qcut(d["peso_kg"], 3, labels=["ligero", "medio", "pesado"])
    porcentajes = pd.crosstab(d["turno"], d["rango"], normalize="index")
    return {"datos": d, "tabla": (porcentajes * 100).round(1)}

resolver(df)`,
    hints: [
      "Por defecto `pd.cut` cierra los intervalos por la **derecha**; hay un parámetro para cambiarlo.",
      "`pd.qcut(serie, 3, labels=[...])` reparte en grupos con la misma cantidad de elementos.",
      "`pd.crosstab` acepta `normalize=\"index\"` para obtener proporciones por fila; luego pásalas a porcentaje.",
    ],
    tests: [
      {
        name: "Devuelve datos y tabla",
        code: `r = resolver(df.copy())
assert isinstance(r, dict) and set(r) == {"datos", "tabla"}, "Devuelve un dict con 'datos' y 'tabla'"
assert {"rango", "talla"} <= set(r["datos"].columns), "Faltan las columnas rango y/o talla"`,
      },
      {
        name: "Intervalos cerrados a la izquierda",
        code: `r = resolver(df.copy())["datos"]
rango = dict(zip(r["cria"], r["rango"].astype(str)))
assert rango["Nube"] == "normal", f"37.0 debe ser 'normal' y es {rango['Nube']!r}"
assert rango["Yuzu"] == "fiebre", f"40.0 debe ser 'fiebre' y es {rango['Yuzu']!r}"
assert rango["Lupe"] == "alta", f"38.5 debe ser 'alta' y es {rango['Lupe']!r}"`,
      },
      {
        name: "Tallas por cuantiles",
        code: `r = resolver(df.copy())["datos"]
conteo = r["talla"].astype(str).value_counts().to_dict()
assert conteo == {"ligero": 3, "medio": 3, "pesado": 3}, f"Cada talla debe tener 3 crías: {conteo}"`,
      },
      {
        name: "Tabla en porcentajes por turno",
        code: `${ref8}
r = resolver(df.copy())
t = r["tabla"]
assert ((t.sum(axis=1) - 100).abs() <= 0.2).all(), f"Cada turno debe sumar 100 %: {t.sum(axis=1).to_dict()}"
check_frame(_norm_tabla(t), _norm_tabla(_ref(df.copy())["tabla"]))
check_frame(_norm_datos(r["datos"]), _norm_datos(_ref(df.copy())["datos"]))`,
      },
      {
        name: "Funciona con datos ocultos",
        code: `${ref8}
otro = pd.DataFrame({
    "cria": list("abcdef"),
    "turno": ["noche", "noche", "tarde", "tarde", "noche", "tarde"],
    "temperatura": [35.0, 38.49, 40.5, 37.0, 39.99, 36.99],
    "peso_kg": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
})
r, e = resolver(otro.copy()), _ref(otro.copy())
check_frame(_norm_tabla(r["tabla"]), _norm_tabla(e["tabla"]))
check_frame(_norm_datos(r["datos"]), _norm_datos(e["datos"]))`,
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
    "panda": ["Kiko", "Nube", "Lupe", "Tofu", "Sora", "Dango"],
    "reserva": ["Foping", "Qinling", "Foping", "Baoxing", "Qinling", "Baoxing"],
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
assert "Lupe" not in list(r["panda"]), "Lupe duerme menos de 8 horas y no debe aparecer"
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

- \`df\`: registros de alimentación **sucios** con \`panda\`, \`fecha\` (texto), \`kg\` (texto) y \`id_reserva\`.
- \`reservas\`: catálogo con \`id_reserva\` y \`reserva\` (nombre).

Completa \`resolver(df, reservas)\` siguiendo estos pasos **en orden**:

1. **Texto**: limpia \`panda\` quitando espacios sobrantes y poniéndolo en formato título (\`" kIKO "\` → \`"Kiko"\`).
2. **Números**: \`kg\` usa coma decimal (\`"12,5"\`) y tiene basura (\`"n/a"\`, \`""\`). Cambia la coma por punto, convierte a número (lo inválido → \`NaN\`) y **elimina** las filas sin kg.
3. **Fechas**: convierte \`fecha\` a datetime.
4. **Duplicados**: elimina filas duplicadas (ya limpias).
5. **Merge**: une con \`reservas\` por \`id_reserva\` conservando todos los registros; si la reserva no existe, \`reserva = "Desconocida"\`.
6. **Agrupa** por \`reserva\` y \`panda\` con: \`total_kg\` (suma, redondeada a 2), \`dias\` (nº de fechas distintas) y \`ultima\` (fecha más reciente).
7. **Ordena** por \`total_kg\` descendente y, en empate, por \`panda\` ascendente. Índice \`0, 1, 2, ...\`.

Columnas finales: \`["reserva", "panda", "total_kg", "dias", "ultima"]\`.`,
    setup: `import pandas as pd

df = pd.DataFrame({
    "panda": [" kiko", "Nube ", "KIKO", "lupe", "Kiko", "nube", "Tofu", "lupe ", "kiko"],
    "fecha": ["2026-02-01", "2026-02-01", "2026-02-02", "2026-02-01", "2026-02-02",
              "2026-02-03", "2026-02-03", "2026-02-04", "2026-02-05"],
    "kg": ["12,5", "15", "10,25", "n/a", "10,25", "14,75", "9", "8,5", ""],
    "id_reserva": [1, 2, 1, 1, 1, 2, 9, 1, 1],
})

reservas = pd.DataFrame({
    "id_reserva": [1, 2, 3],
    "reserva": ["Foping", "Qinling", "Baoxing"],
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
        .merge(reservas, on="id_reserva", how="left")
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
assert sorted(set(r["panda"])) == ["Kiko", "Lupe", "Nube", "Tofu"], f"Pandas: {sorted(set(r['panda']))}"`,
      },
      {
        name: "kg limpios y duplicados eliminados",
        code: `r = resolver(df.copy(), reservas.copy())
kiko = r[r["panda"] == "Kiko"].iloc[0]
assert abs(kiko["total_kg"] - 22.75) < 1e-9, f"Kiko debería sumar 22.75 kg (sin el duplicado ni el vacío) y suma {kiko['total_kg']}"
assert kiko["dias"] == 2, f"Kiko comió en 2 días distintos, no {kiko['dias']}"`,
      },
      {
        name: "Reserva desconocida",
        code: `r = resolver(df.copy(), reservas.copy())
tofu = r[r["panda"] == "Tofu"]
assert len(tofu) == 1 and tofu.iloc[0]["reserva"] == "Desconocida", "Tofu (id_reserva 9) debe quedar en 'Desconocida'"`,
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
    "panda": ["  ana", "ANA", "kai", "Kai ", "ana", "zhu", "rui", "Rui", "kai"],
    "fecha": ["2025-07-01", "2025-07-01", "2025-07-02", "2025-07-02", "2025-07-09", "2025-07-03", "2025-07-04", "2025-07-05", "2025-07-02"],
    "kg": ["3,5", "3,5", "7", "7", "1,25", "x", "2", "8,75", "1"],
    "id_reserva": [5, 5, 6, 6, 5, 6, 7, 7, 6],
})
cat = pd.DataFrame({"id_reserva": [5, 6], "reserva": ["Laohegou", "Tangjiahe"]})
check_frame(resolver(otro.copy(), cat.copy()), _ref(otro.copy(), cat.copy()))`,
      },
    ],
    tutorialLink: "experto",
  },
];
