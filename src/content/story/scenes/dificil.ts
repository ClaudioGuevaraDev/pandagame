import type { Scene } from "../types.ts";

/** Nivel 3 · Cumbre del Maestro Panda y final. */
export const cumbre: Scene[] = [
  {
    id: "capitulo-21",
    title: "El libro mayor",
    after: "dificil-1",
    panels: [
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Con la tabla dinámica de la tienda se ve claro: las ventas caen en cada luna llena." }],
      },
      {
        bg: "cumbre",
        cast: [{ who: "lin", pose: "point", x: 50 }],
        balloons: [
          { who: "lin", text: "Las mediciones de las crías también están aquí arriba… guardadas en un formato imposible de leer." },
        ],
      },
    ],
  },
  {
    id: "capitulo-22",
    title: "Nunca es suficiente",
    after: "dificil-2",
    panels: [
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "cheer", mood: "happy", x: 50 }],
        balloons: [{ who: "bao", text: "¡En formato largo se entiende todo! Las crías crecen bien: no hay hambruna." }],
      },
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Entonces… ¿por qué alguien cree que la habrá?" }],
      },
      {
        layout: "wide",
        bg: "almacen",
        narration: "Muy lejos de allí, alguien contaba sacos de bambú a la luz de una vela.",
        cast: [{ who: "goro", pose: "write", mood: "worried", x: 45 }],
        prop: { name: "bambu", x: 78, y: 72 },
        balloons: [{ who: "goro", kind: "think", text: "Nunca es suficiente… nunca es suficiente…" }],
      },
    ],
  },
  {
    id: "capitulo-23",
    title: "La llave",
    after: "dificil-3",
    panels: [
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "point", x: 50 }],
        balloons: [{ who: "bao", text: "Las clínicas atienden menos consultas cada trimestre… porque las crías están sanas." }],
      },
      {
        bg: "accion",
        camera: "zoom",
        narration: "Entre los registros de la clínica, Bao halló una llave con la marca del almacén de invierno.",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 35 }],
        prop: { name: "llave", x: 72, y: 50, scale: 1.3 },
        sfx: { text: "¡CLINC!", x: 78, y: 18, rotate: 10 },
      },
    ],
  },
  {
    id: "capitulo-24",
    title: "Lo que falta",
    after: "dificil-4",
    panels: [
      {
        bg: "guarderia",
        cast: [
          { who: "bao", pose: "idle", mood: "happy", x: 30 },
          { who: "cria", pose: "cheer", mood: "happy", x: 68, flip: true },
        ],
        balloons: [{ who: "bao", text: "Con los huecos rellenados por sala, todas las crías tienen buen peso." }],
      },
      {
        bg: "guarderia",
        cast: [{ who: "bao", pose: "think", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Lo que falta no es comida… es información correcta." }],
      },
      {
        layout: "wide",
        bg: "noche",
        narration: "Los podómetros de las crías podrían mostrar quién se movió de noche.",
        cast: [{ who: "sombra", pose: "idle", x: 75, scale: 0.6 }],
      },
    ],
  },
  {
    id: "capitulo-25",
    title: "Pasos en la oscuridad",
    after: "dificil-5",
    panels: [
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [
          { who: "bao", kind: "think", text: "La media móvil es estable… salvo un collar: el de Kiko, el robado, que alguien lleva de noche." },
        ],
      },
      {
        bg: "noche",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", text: "Va del almacén de invierno al Archivo cada noche de luna… y vuelve." }],
      },
    ],
  },
  {
    id: "capitulo-26",
    title: "Las tres de la madrugada",
    after: "dificil-6",
    panels: [
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡Por horas se ve! Alguien entra siempre a las tres de la madrugada." }],
      },
      {
        bg: "bosque",
        cast: [
          { who: "kiko", pose: "point", mood: "happy", x: 30 },
          { who: "bao", pose: "idle", x: 72, flip: true },
        ],
        balloons: [{ who: "kiko", text: "¡Mañana es la carrera de crías! Todo el santuario estará despierto. Nadie podrá esconderse." }],
      },
    ],
  },
  {
    id: "capitulo-27",
    title: "El almacén de invierno",
    after: "dificil-7",
    panels: [
      {
        layout: "wide",
        bg: "bosque",
        narration: "Mientras las crías corrían, Bao ordenó los almacenes por bambú guardado.",
        cast: [{ who: "bao", pose: "point", x: 35 }],
        prop: { name: "mapa", x: 68, y: 55, scale: 1.2 },
      },
      {
        bg: "almacen",
        cast: [{ who: "bao", pose: "think", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "El almacén de invierno encabeza el ranking… con el triple que los demás." }],
      },
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "goro", pose: "surprise", mood: "worried", x: 50 }],
        balloons: [{ who: "goro", kind: "shout", text: "¡No es lo que parece!" }],
        sfx: { text: "¡GLUP!", x: 22, y: 25, rotate: -10 },
      },
    ],
  },
  {
    id: "capitulo-28",
    title: "La confesión de Goro",
    after: "dificil-8",
    panels: [
      {
        bg: "almacen",
        cast: [{ who: "goro", pose: "sad", mood: "sad", x: 50 }],
        balloons: [
          { who: "goro", text: "Hace un año leí los registros y el bambú bajaba cada mes. Creí que vendría una hambruna." },
        ],
      },
      {
        bg: "almacen",
        cast: [
          { who: "bao", pose: "idle", x: 30 },
          { who: "goro", pose: "sad", mood: "sad", x: 72, flip: true },
        ],
        balloons: [
          { who: "bao", text: "¿Por eso guardabas bambú y borrabas registros?" },
          { who: "goro", text: "Quería salvar a las crías del invierno…" },
        ],
      },
      {
        layout: "wide",
        bg: "guarderia",
        narration: "Pero las fiebres por turno eran normales: nadie estaba enfermo. Goro no creería en palabras. Necesitaba ver los datos.",
        cast: [{ who: "bao", pose: "think", mood: "determined", x: 50 }],
      },
    ],
  },
  {
    id: "capitulo-29",
    title: "Una cadena limpia",
    after: "dificil-9",
    panels: [
      {
        bg: "archivo",
        cast: [{ who: "lin", pose: "idle", mood: "happy", x: 50 }],
        balloons: [{ who: "lin", text: "Una cadena limpia, sin trucos. Así se escribe un análisis que convence." }],
      },
      {
        bg: "archivo",
        cast: [{ who: "bao", pose: "write", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", text: "Lo juntaré todo: inventarios, raciones y crías. Un solo pipeline." }],
      },
      {
        layout: "wide",
        bg: "cumbre",
        camera: "zoom",
        narration: "Había llegado la hora del gran final.",
        sfx: { text: "¡GONG!", x: 50, y: 55, rotate: -6 },
      },
    ],
  },
  {
    id: "capitulo-30",
    title: "Maestro Panda",
    after: "dificil-10",
    panels: [
      {
        layout: "wide",
        bg: "cumbre",
        narration: "En la cumbre, ante todo el santuario, Bao mostró su resultado.",
        cast: [
          { who: "goro", pose: "idle", mood: "worried", x: 18 },
          { who: "bao", pose: "point", mood: "determined", x: 45, flip: true },
          { who: "lin", pose: "idle", x: 68, flip: true },
          { who: "kiko", pose: "idle", x: 88, flip: true },
        ],
        balloons: [{ who: "bao", text: "Hay bambú de sobra para tres inviernos." }],
      },
      {
        bg: "cumbre",
        camera: "zoom",
        cast: [{ who: "goro", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "goro", text: "Entonces… ¿los números bajaban porque yo mismo escondía el bambú?" }],
      },
      {
        bg: "cumbre",
        cast: [{ who: "bao", pose: "idle", mood: "happy", x: 50 }],
        balloons: [{ who: "bao", text: "Exacto. Tus propios registros alterados te asustaron a ti." }],
      },
      {
        bg: "almacen",
        narration: "Goro devolvió el bambú y prometió llevar sus cuentas con pandas.",
        cast: [
          { who: "goro", pose: "cheer", mood: "happy", x: 35 },
          { who: "cria", pose: "cheer", mood: "happy", x: 70, flip: true },
        ],
        prop: { name: "bambu", x: 85, y: 78, scale: 0.8 },
      },
      {
        bg: "cumbre",
        cast: [
          { who: "lin", pose: "point", mood: "happy", x: 30 },
          { who: "bao", pose: "surprise", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "sello", x: 52, y: 45 },
        balloons: [{ who: "lin", text: "Bao, aprendiz del Gran Archivo: desde hoy eres Maestro Panda." }],
      },
      {
        layout: "wide",
        bg: "cumbre",
        camera: "zoom",
        narration: "Fin… por ahora.",
        cast: [
          { who: "kiko", pose: "cheer", mood: "happy", x: 22 },
          { who: "bao", pose: "cheer", mood: "happy", x: 50 },
          { who: "cria", pose: "cheer", mood: "happy", x: 76, flip: true },
        ],
        sfx: { text: "¡VIVA!", x: 80, y: 25, rotate: 8 },
      },
    ],
  },
];
