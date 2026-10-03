import type { Lesson } from "../types.ts";

export const combinar: Lesson = {
  slug: "combinar",
  module: 6,
  title: "Combinar datos",
  summary: "Une tablas con concat, merge (tipos de join, claves, sufijos, validate, indicator) y join.",
  relatedChallenges: ["medio-8", "medio-9"],
  blocks: [
    {
      type: "markdown",
      content: `## Dos formas de combinar

| Operación | Qué hace | Analogía |
|---|---|---|
| \`pd.concat\` | **Apila** tablas una debajo de otra (o una al lado de otra) | Pegar hojas de Excel |
| \`pd.merge\` / \`df.merge\` | **Cruza** tablas por columnas clave | \`JOIN\` de SQL / \`BUSCARV\` |

## concat: apilar

\`pd.concat([df1, df2])\` une filas. Las columnas se alinean por nombre: si una tabla no tiene alguna columna, se rellena con \`NaN\`. Usa \`ignore_index=True\` para renumerar el índice.`,
    },
    {
      type: "code",
      title: "Apilar filas",
      code: `import pandas as pd

enero = pd.DataFrame({"nombre": ["Mei", "Bao"], "bambu_kg": [350, 520]})
febrero = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin"], "bambu_kg": [330, 500, 210]})
pd.concat([enero, febrero], ignore_index=True)`,
    },
    {
      type: "code",
      title: "concat con keys para saber el origen",
      code: `import pandas as pd

enero = pd.DataFrame({"nombre": ["Mei", "Bao"], "bambu_kg": [350, 520]})
febrero = pd.DataFrame({"nombre": ["Mei", "Lin"], "bambu_kg": [330, 210], "visitas": [120, 95]})
todo = pd.concat([enero, febrero], keys=["enero", "febrero"], names=["mes", None])
todo.reset_index(level="mes")`,
    },
    {
      type: "markdown",
      content: `## merge: cruzar por claves

\`izq.merge(der, on="clave", how=...)\` combina filas cuyas claves coinciden. El parámetro \`how\` decide qué pasa con las filas sin pareja:

| how | Conserva |
|---|---|
| \`"inner"\` (por defecto) | Solo claves presentes en **ambas** tablas |
| \`"left"\` | Todas las filas de la izquierda |
| \`"right"\` | Todas las filas de la derecha |
| \`"outer"\` | Todas las filas de ambas |

Las filas sin pareja reciben \`NaN\` en las columnas de la otra tabla.`,
    },
    {
      type: "code",
      title: "inner vs left",
      code: `import pandas as pd

pandas_ = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin", "Tao"], "reserva_id": [1, 2, 1, 9]})
reservas = pd.DataFrame({"reserva_id": [1, 2, 3], "reserva": ["Chengdu", "Wolong", "Ya'an"]})

print(pandas_.merge(reservas, on="reserva_id"))            # inner: Tao desaparece
pandas_.merge(reservas, on="reserva_id", how="left")       # left: Tao con NaN`,
    },
    {
      type: "code",
      title: "outer con indicator",
      code: `import pandas as pd

pandas_ = pd.DataFrame({"nombre": ["Mei", "Bao", "Lin", "Tao"], "reserva_id": [1, 2, 1, 9]})
reservas = pd.DataFrame({"reserva_id": [1, 2, 3], "reserva": ["Chengdu", "Wolong", "Ya'an"]})
r = pandas_.merge(reservas, on="reserva_id", how="outer", indicator=True)
print(r["_merge"].value_counts())
r`,
    },
    {
      type: "markdown",
      content: `\`indicator=True\` añade la columna \`_merge\` (\`both\`, \`left_only\`, \`right_only\`). Es la mejor herramienta para **auditar** un cruce: ¿qué claves no encontraron pareja?

## Claves con nombres distintos y sufijos

- Si la clave se llama distinto en cada tabla: \`left_on="id_panda", right_on="id"\`.
- Si ambas tablas tienen columnas con el mismo nombre (que no son clave), Pandas añade sufijos \`_x\` / \`_y\`. Cámbialos con \`suffixes=("_izq", "_der")\`.`,
    },
    {
      type: "code",
      title: "left_on / right_on y suffixes",
      code: `import pandas as pd

pandas_ = pd.DataFrame({"id": [1, 2, 3], "nombre": ["Mei", "Bao", "Lin"], "peso": [80.5, 110.0, 45.2]})
revision = pd.DataFrame({"id_panda": [1, 2, 3], "peso": [82.0, 108.5, 47.0]})
r = pandas_.merge(revision, left_on="id", right_on="id_panda", suffixes=("_antes", "_despues"))
r["cambio"] = r["peso_despues"] - r["peso_antes"]
r.drop(columns="id_panda")`,
    },
    {
      type: "markdown",
      content: `## validate: evita multiplicar filas por accidente

Si la clave está **duplicada** en una tabla, el merge multiplica filas (cada coincidencia genera una fila). A veces es lo que quieres (uno-a-muchos), pero a menudo es un bug silencioso. \`validate\` lanza un error si la relación no es la esperada:

- \`"one_to_one"\` (\`"1:1"\`), \`"one_to_many"\` (\`"1:m"\`), \`"many_to_one"\` (\`"m:1"\`).`,
    },
    {
      type: "code",
      title: "validate atrapa duplicados",
      code: `import pandas as pd

pandas_ = pd.DataFrame({"nombre": ["Mei", "Bao"], "reserva_id": [1, 2]})
reservas = pd.DataFrame({"reserva_id": [1, 1, 2], "reserva": ["Chengdu", "Chengdu (dup)", "Wolong"]})
try:
    pandas_.merge(reservas, on="reserva_id", validate="many_to_one")
except Exception as e:
    print("Error detectado:", type(e).__name__, "-", e)
pandas_.merge(reservas.drop_duplicates("reserva_id"), on="reserva_id", validate="many_to_one")`,
    },
    {
      type: "markdown",
      content: `## join: cruzar por índice

\`df.join(otro)\` es un atajo de \`merge\` que cruza por el **índice** (por defecto \`how="left"\`). Muy cómodo cuando ya tienes la clave como índice, por ejemplo después de un \`groupby\`.`,
    },
    {
      type: "code",
      title: "join con un resumen agrupado",
      code: `import pandas as pd

visitas = pd.DataFrame({
    "nombre": ["Mei", "Bao", "Mei", "Lin", "Bao", "Mei"],
    "visitantes": [120, 80, 150, 60, 90, 130],
})
fichas = pd.DataFrame({"edad": [4, 7, 2], "reserva": ["Chengdu", "Wolong", "Chengdu"]},
                      index=["Mei", "Bao", "Lin"])
total = visitas.groupby("nombre")["visitantes"].sum().rename("visitantes_total")
fichas.join(total)`,
    },
    {
      type: "markdown",
      content: `## Resumen

- \`concat\` apila; \`merge\` cruza por claves; \`join\` cruza por índice.
- Elige \`how\` conscientemente: \`inner\`, \`left\`, \`right\`, \`outer\`.
- \`indicator=True\` audita el cruce; \`validate\` evita duplicaciones silenciosas.
- \`left_on\`/\`right_on\` para claves con distinto nombre y \`suffixes\` para columnas repetidas.

## Siguiente paso

En **Reestructurar** aprenderás a cambiar la forma de las tablas: de largo a ancho y viceversa.`,
    },
  ],
};
