import type { Scene } from "../types.ts";

/** Nivel 2 · Río de Datos. */
export const rio: Scene[] = [
  {
    id: "capitulo-11",
    title: "Huecos a propósito",
    after: "medio-1",
    panels: [
      {
        bg: "rio",
        cast: [{ who: "bao", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Fichas sin nombre, temperaturas borradas… Alguien quitó datos a propósito." }],
      },
      {
        bg: "rio",
        cast: [
          { who: "bao", pose: "surprise", mood: "surprised", x: 28 },
          { who: "kiko", pose: "point", mood: "happy", x: 72, flip: true },
        ],
        balloons: [
          { who: "kiko", text: "¡Ey, panda! ¿Buscas al ladrón de bambú?" },
          { who: "kiko", text: "Yo que tú miraría el registro de vacunas. Hay cosas… repetidas." },
        ],
      },
    ],
  },
  {
    id: "capitulo-12",
    title: "Refuerzos fantasma",
    after: "medio-2",
    panels: [
      {
        bg: "archivo",
        camera: "zoom",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 40 }],
        prop: { name: "pagina", x: 74, y: 55 },
        balloons: [{ who: "bao", kind: "shout", text: "¡Refuerzos que nunca se pusieron! Filas duplicadas con lotes inventados." }],
      },
      {
        bg: "rio",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Kiko sabía de los duplicados… ¿cómo lo sabía?" }],
      },
      {
        layout: "wide",
        bg: "rio",
        camera: "pan",
        narration: "Kiko se alejó silbando, con un bolsillo sospechosamente lleno.",
        cast: [{ who: "kiko", pose: "run", mood: "happy", x: 65 }],
        sfx: { text: "fiu, fiu ♪", x: 35, y: 35, rotate: -6 },
      },
    ],
  },
  {
    id: "capitulo-13",
    title: "Cajas que faltan",
    after: "medio-3",
    panels: [
      {
        bg: "guarderia",
        cast: [{ who: "bao", pose: "write", mood: "happy", x: 50 }],
        balloons: [{ who: "bao", text: "Con los tipos correctos, por fin puedo sumar el inventario de la tienda…" }],
      },
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "…¡y faltan tres cajas de collares GPS!" }],
      },
      {
        layout: "wide",
        bg: "bosque",
        cast: [
          { who: "lin", pose: "point", x: 30 },
          { who: "bao", pose: "idle", x: 70, flip: true },
        ],
        balloons: [
          { who: "lin", text: "Los collares registran por dónde pasa cada animal. Sus códigos delatarán a quien se llevó uno." },
        ],
      },
    ],
  },
  {
    id: "capitulo-14",
    title: "El collar de Qin",
    after: "medio-4",
    panels: [
      {
        bg: "rio",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", text: "Un collar del centro Qin pasó junto al almacén cada noche de luna." }],
      },
      {
        bg: "rio",
        cast: [
          { who: "bao", pose: "think", x: 28 },
          { who: "kiko", pose: "surprise", mood: "surprised", x: 72, flip: true },
        ],
        balloons: [
          { who: "bao", text: "Kiko… tú eres de Qin." },
          { who: "kiko", kind: "shout", text: "¡Ese collar me lo robaron hace semanas!" },
        ],
      },
      {
        layout: "wide",
        bg: "guarderia",
        narration: "Para saber si Kiko mentía, Bao necesitaba saber cuánto bambú come de verdad cada animal.",
        prop: { name: "bambu", x: 50, y: 70 },
      },
    ],
  },
  {
    id: "capitulo-15",
    title: "El catalejo",
    after: "medio-5",
    panels: [
      {
        bg: "guarderia",
        cast: [{ who: "bao", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Las raciones no explican el bambú que falta. Alguien guarda mucho más de lo que come." }],
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "point", x: 30 },
          { who: "bao", pose: "cheer", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "catalejo", x: 52, y: 48 },
        balloons: [
          { who: "lin", text: "Toma el Catalejo. Cuando un test falle, compara la tabla esperada con la tuya, celda por celda." },
        ],
      },
      {
        layout: "wide",
        bg: "bosque",
        cast: [{ who: "kiko", pose: "cheer", mood: "determined", x: 55 }],
        balloons: [{ who: "kiko", kind: "shout", text: "¡Hoy es el torneo por equipos! Si gano, me creerás, ¿no?" }],
      },
    ],
  },
  {
    id: "capitulo-16",
    title: "La coartada",
    after: "medio-6",
    panels: [
      {
        bg: "bosque",
        cast: [{ who: "bao", pose: "point", x: 50 }],
        balloons: [{ who: "bao", text: "Según los tiempos por equipo, Kiko trepó toda la última noche de luna llena." }],
      },
      {
        bg: "bosque",
        cast: [
          { who: "kiko", pose: "cheer", mood: "happy", x: 30 },
          { who: "bao", pose: "idle", mood: "happy", x: 72, flip: true },
        ],
        balloons: [
          { who: "kiko", kind: "shout", text: "¡Te lo dije! ¡Inocente… y rapidísimo!" },
          { who: "bao", text: "Tu coartada es sólida. Perdona, Kiko." },
        ],
      },
      {
        layout: "wide",
        bg: "noche",
        narration: "Entonces, ¿quién llevaba el collar robado? Las estaciones del bosque quizá vieron algo.",
        cast: [{ who: "sombra", pose: "idle", x: 80, scale: 0.6 }],
      },
    ],
  },
  {
    id: "capitulo-17",
    title: "Calor en la noche",
    after: "medio-7",
    panels: [
      {
        bg: "bosque",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [
          { who: "bao", kind: "think", text: "Cada noche de luna, la temperatura junto al almacén sube de golpe… como si alguien encendiera un fuego." },
        ],
      },
      {
        bg: "archivo",
        cast: [{ who: "lin", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "lin", text: "O como si alguien trabajara ahí dentro toda la noche." }],
      },
      {
        layout: "wide",
        bg: "rio",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 40 }],
        balloons: [{ who: "bao", text: "Los pedidos de bambú cruzan el río. Si los uno con sus proveedores, veré a dónde van." }],
      },
    ],
  },
  {
    id: "capitulo-18",
    title: "Proveedores fantasma",
    after: "medio-8",
    panels: [
      {
        bg: "accion",
        camera: "zoom",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡Pedidos con códigos de proveedor que no existen!" }],
      },
      {
        bg: "rio",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Y todos se entregan en el mismo lugar: el «almacén de invierno»." }],
      },
      {
        bg: "rio",
        cast: [
          { who: "kiko", pose: "point", x: 30 },
          { who: "bao", pose: "idle", mood: "surprised", x: 72, flip: true },
        ],
        balloons: [{ who: "kiko", text: "¿El almacén de invierno? Ese lo cuida Goro, el tanuki. Nunca deja entrar a nadie." }],
      },
    ],
  },
  {
    id: "capitulo-19",
    title: "La caja sin registrar",
    after: "medio-9",
    panels: [
      {
        layout: "wide",
        bg: "almacen",
        narration: "Al apilar los inventarios de los dos almacenes apareció una caja que nadie había registrado.",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 35 }],
        prop: { name: "sello", x: 68, y: 62 },
      },
      {
        bg: "almacen",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        prop: { name: "sello", x: 72, y: 45, scale: 0.8 },
        balloons: [{ who: "bao", kind: "think", text: "Un sello con forma de luna…" }],
      },
      {
        bg: "almacen",
        camera: "zoom",
        cast: [{ who: "goro", pose: "surprise", mood: "worried", x: 50 }],
        balloons: [{ who: "goro", text: "¿Q-qué haces en mi almacén, aprendiz? Aquí solo hay provisiones de invierno." }],
      },
    ],
  },
  {
    id: "capitulo-20",
    title: "Rumbo a la cumbre",
    after: "medio-10",
    panels: [
      {
        bg: "archivo",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", text: "Los padrinazgos que terminaron de golpe… todos al día siguiente de una luna llena." }],
      },
      {
        bg: "archivo",
        cast: [{ who: "lin", pose: "think", mood: "worried", x: 50 }],
        balloons: [
          { who: "lin", text: "Alguien hace que el bambú parezca escaso. Y si el santuario cree que hay escasez…" },
          { who: "lin", text: "…nadie pregunta por qué se guarda tanto." },
        ],
      },
      {
        layout: "wide",
        bg: "noche",
        camera: "pan",
        narration: "Esa noche, la figura encapuchada subió hacia la cumbre.",
        cast: [{ who: "sombra", pose: "run", x: 70, scale: 0.75 }],
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "cheer", mood: "happy", x: 30 },
          { who: "bao", pose: "idle", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "pincel", x: 52, y: 48 },
        balloons: [
          { who: "lin", text: "Cruzaste el Río de Datos. Toma el último pergamino de pistas… y el Pincel del maestro." },
          { who: "lin", text: "Desde ahora podrás pegar tu propio código en el editor." },
        ],
      },
      {
        bg: "cumbre",
        camera: "zoom",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 40 }],
        balloons: [{ who: "bao", text: "El libro mayor del santuario está en la cumbre. Ahí terminará todo." }],
      },
    ],
  },
];
