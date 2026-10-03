import type { Lesson } from "../types.ts";

export const comoFuncionanLosRetos: Lesson = {
  slug: "como-funcionan-los-retos",
  module: 0,
  title: "Cómo funcionan los retos",
  summary: "La historia de Bao, el camino de 30 retos, lo que se desbloquea al avanzar y para qué sirve cada botón.",
  relatedChallenges: ["facil-1"],
  blocks: [
    {
      type: "markdown",
      content: `## La historia

Eres **Bao**, el aprendiz más joven del Gran Archivo del santuario. Alguien está alterando los registros del bambú y la Maestra Lin te encarga investigar con el *Pincel de datos*, es decir, con pandas.

Cada reto es un paso de la investigación: el recuadro amarillo sobre el enunciado (la **misión**) te cuenta qué está pasando. Al superar un reto se desbloquea una **escena de cómic** que sigue la historia. Puedes saltarla, y volver a verla cuando quieras desde el mapa (los iconos de viñetas entre retos) o desde el **Diario**.

## El camino

El juego tiene **3 niveles con 10 retos cada uno**: *Bosque de Bambú* (fácil), *Río de Datos* (medio) y *Cumbre del Maestro Panda* (difícil). Los ves todos en el **Mapa**, como un sendero:

- Un reto con el sello rojo **完** ya está superado.
- El reto con el anillo rojo y el panda que dice *¡Estás aquí!* es el que te toca.
- Los retos con candado están bloqueados.

Los retos se desbloquean **en orden**: para abrir uno tienes que superar el anterior, y para entrar a un nivel tienes que completar el nivel previo. Un reto se supera cuando pasan **todos** sus tests.

## Cómo se ve un reto

A la izquierda está el **enunciado**: qué datos tienes, qué debes devolver y la lista de tests que tu solución tiene que pasar. A la derecha está el **editor**, donde escribes Python, y debajo los **resultados**.

En el móvil, las tres partes son pestañas: *Reto*, *Código* y *Resultado*.

## Escribe tu solución en \`resolver\`

Casi todos los retos te dan un DataFrame \`df\` ya cargado y te piden completar una función:

\`\`\`python
def resolver(df):
    # tu código aquí
    return ...

resolver(df)
\`\`\`

- La función debe **devolver** (\`return\`) lo que pide el enunciado: un DataFrame, una Series, un número o un diccionario.
- La última línea, \`resolver(df)\`, sirve para que al pulsar *Ejecutar* veas el resultado como tabla.
- Los tests llaman a tu función **también con otros datos**, que no ves. Por eso no sirve escribir la respuesta a mano: tu código tiene que funcionar con cualquier tabla con esas columnas.

Pruébalo aquí: este ejemplo devuelve las frutas con más de 2 kg.`,
    },
    {
      type: "code",
      title: "Un resolver de ejemplo",
      code: `import pandas as pd

df = pd.DataFrame({
    "fruta": ["kiwi", "higo", "pera", "uva"],
    "kg": [1.5, 3.0, 2.5, 0.8],
})

def resolver(df):
    return df[df["kg"] > 2]

resolver(df)`,
    },
    {
      type: "markdown",
      content: `## Para qué sirve cada botón`,
    },
    { type: "guide" },
    {
      type: "markdown",
      content: `## Lo que se desbloquea al avanzar

Al principio Bao no tiene herramientas: las va ganando en la historia.

| Recompensa | Cuándo | Qué hace |
|---|---|---|
| Pergamino de pistas I | Tras el reto 3 | Desbloquea la primera pista de cada reto |
| Brújula de bambú | Tras el reto 5 | Autocompletado de pandas en el editor |
| Lupa de Bao | Tras el reto 8 | Botón *Ver datos*: muestra las tablas de entrada |
| Pergamino de pistas II | Tras el reto 10 | Segunda pista de cada reto |
| Catalejo | Tras el reto 15 | Compara la tabla esperada con la tuya, celda por celda |
| Pergamino de pistas III | Tras el reto 20 | Todas las pistas |
| Pincel del maestro | Tras el reto 20 | Permite pegar código en los retos |

Las **lecciones del tutorial** también se abren con la historia: la Maestra Lin te entrega cada pergamino justo antes del primer reto que lo necesita. Las que aún no tienes aparecen con candado.

En el **Diario de Bao** (arriba, junto al Tutorial) ves los objetos y ventajas que llevas, los **logros** conseguidos y la galería de escenas.

## Reglas del juego

- **Al principio no se puede pegar código** en el editor de los retos: la idea es que lo escribas tú. Se desbloquea con el *Pincel del maestro*. Sí puedes copiar desde el editor, y en los ejemplos del tutorial puedes pegar lo que quieras para experimentar.
- **Tu progreso se guarda en este navegador** automáticamente: los retos superados, tus intentos y el código de cada reto. No hace falta cuenta. Si cambias de navegador o borras sus datos, empiezas de cero.
- El código tiene un **límite de 10 segundos** por ejecución.

## Consejos

1. **Ejecuta antes de correr los tests.** Mira la tabla que devuelves y compárala con lo que pide el enunciado: columnas, orden e índice.
2. **Lee el mensaje del test que falla.** Suele mostrar el resultado esperado y el que obtuviste.
3. **Pide las pistas de a una** (cuando tengas el pergamino). Van de la más general a la más concreta. Si completas un nivel entero sin abrir ninguna, ganas un logro.
4. **Repasa la lección** con el botón *Repasar en el tutorial*. Los ejemplos del tutorial enseñan la técnica, pero ningún reto es igual a un ejemplo: tendrás que aplicarla a un caso nuevo.

## Resumen

- 30 retos en 3 niveles que se desbloquean en orden. Superas un reto cuando pasan todos sus tests.
- Cada reto avanza la historia de Bao y puede darte pistas, herramientas o lecciones nuevas.
- Escribe tu solución dentro de \`resolver(df)\` y haz que funcione con cualquier dato.
- *Ejecutar* para explorar, *Correr tests* para comprobar.

## Siguiente paso

Empieza por el módulo **一 Fundamentos** o ve directo al **Mapa** y juega el primer reto.`,
    },
  ],
};
