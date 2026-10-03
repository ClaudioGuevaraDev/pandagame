import type { Scene } from "../types.ts";

/** Prólogo y Nivel 1 · Bosque de Bambú. */
export const prologoYBosque: Scene[] = [
  {
    id: "prologo",
    title: "La noche de los números imposibles",
    after: null,
    panels: [
      {
        layout: "wide",
        bg: "noche",
        camera: "pan",
        narration: "Santuario de las Montañas Brumosas. Medianoche.",
        cast: [{ who: "sombra", pose: "run", x: 70, scale: 0.8 }],
        sfx: { text: "fiuuu…", x: 40, y: 62, rotate: -8 },
      },
      {
        bg: "archivo",
        narration: "A la mañana siguiente, en el Gran Archivo…",
        cast: [{ who: "lin", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "lin", text: "¿Doscientos mil tallos de bambú… comidos por una sola cría? Imposible." }],
      },
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡Maestra Lin! ¡Faltan páginas en el registro de la guardería!" }],
        sfx: { text: "¡PLAF!", x: 78, y: 70, rotate: 10 },
      },
      {
        layout: "wide",
        bg: "archivo",
        cast: [
          { who: "bao", pose: "idle", mood: "worried", x: 30 },
          { who: "lin", pose: "point", mood: "determined", x: 70, flip: true },
        ],
        prop: { name: "pincel", x: 50, y: 58 },
        balloons: [
          { who: "lin", text: "Alguien está alterando los registros del santuario, Bao." },
          { who: "lin", text: "Toma el Pincel de datos. Con él, cada tabla te contará su verdad." },
        ],
      },
      {
        layout: "wide",
        bg: "bosque",
        camera: "zoom",
        narration: "Así empezó la investigación del aprendiz más joven del Archivo.",
        cast: [{ who: "bao", pose: "cheer", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡Descubriré quién está detrás de esto!" }],
      },
    ],
  },
  {
    id: "capitulo-1",
    title: "Primeras filas",
    after: "facil-1",
    panels: [
      {
        bg: "guarderia",
        narration: "El registro de la guardería, reconstruido fila a fila.",
        cast: [
          { who: "bao", pose: "write", mood: "happy", x: 35 },
          { who: "cria", pose: "cheer", mood: "happy", x: 75, flip: true },
        ],
        balloons: [{ who: "bao", text: "¡Mi primera tabla! Nube, Kiwi, Momo… todas las crías en su sitio." }],
      },
      {
        bg: "archivo",
        cast: [{ who: "lin", pose: "idle", x: 50 }],
        balloons: [
          { who: "lin", text: "Bien. Pero un buen archivista primero mira y después cuenta." },
          { who: "lin", text: "La tienda de recuerdos dice que su inventario no cuadra. Échale un vistazo." },
        ],
      },
    ],
  },
  {
    id: "capitulo-2",
    title: "El inventario que no cuadra",
    after: "facil-2",
    panels: [
      {
        bg: "guarderia",
        narration: "En la tienda de recuerdos…",
        cast: [{ who: "bao", pose: "think", mood: "worried", x: 50 }],
        balloons: [{ who: "bao", kind: "think", text: "Faltan peluches de panda… y nadie anotó ninguna venta." }],
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "point", x: 30 },
          { who: "bao", pose: "idle", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "pergamino", x: 52, y: 55 },
        balloons: [
          { who: "lin", text: "Para seguir un rastro hay que saber qué mirar." },
          { who: "lin", text: "Este pergamino enseña a seleccionar columnas y filas. Estúdialo." },
        ],
      },
    ],
  },
  {
    id: "capitulo-3",
    title: "El visitante de medianoche",
    after: "facil-3",
    panels: [
      {
        bg: "archivo",
        camera: "zoom",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [
          { who: "bao", kind: "shout", text: "¡En el registro de visitas hay alguien que entró de noche… sin pagar!" },
        ],
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "idle", mood: "happy", x: 30 },
          { who: "bao", pose: "cheer", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "pergamino", x: 52, y: 52 },
        balloons: [
          { who: "lin", text: "Te ganaste el Pergamino de pistas. Si te atascas, ábrelo: te susurrará una pista por reto." },
        ],
      },
      {
        layout: "wide",
        bg: "guarderia",
        narration: "Mientras tanto, en la guardería, las cuidadoras anotaban cuánto jugaba cada cría…",
        cast: [
          { who: "cria", pose: "cheer", mood: "happy", x: 35 },
          { who: "cria", pose: "run", mood: "happy", x: 65 },
        ],
      },
    ],
  },
  {
    id: "capitulo-4",
    title: "Huellas en el barro",
    after: "facil-4",
    panels: [
      {
        layout: "wide",
        bg: "bosque",
        narration: "Las crías que más jugaron lo hicieron junto al bambú del este.",
        cast: [{ who: "bao", pose: "think", x: 35 }],
        prop: { name: "huella", x: 72, y: 82 },
        balloons: [{ who: "bao", kind: "think", text: "Si ellas jugaron aquí… ¿quién dejó estas huellas?" }],
      },
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", text: "No son de panda. Son más pequeñas… y con garras." }],
        sfx: { text: "¡!", x: 80, y: 30, rotate: 8 },
      },
      {
        bg: "bosque",
        cast: [{ who: "bao", pose: "write", mood: "determined", x: 50 }],
        balloons: [{ who: "bao", text: "La clínica revisa a todos los animales. Tal vez sepan de quién son." }],
      },
    ],
  },
  {
    id: "capitulo-5",
    title: "La brújula de bambú",
    after: "facil-5",
    panels: [
      {
        bg: "guarderia",
        narration: "En la clínica no reconocieron las huellas, pero la veterinaria tenía un regalo.",
        cast: [{ who: "bao", pose: "surprise", mood: "happy", x: 50 }],
        prop: { name: "brujula", x: 50, y: 30 },
        balloons: [{ who: "bao", text: "¿Una brújula de bambú?" }],
      },
      {
        bg: "guarderia",
        cast: [{ who: "bao", pose: "cheer", mood: "happy", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡Apunta a los métodos de pandas mientras escribo!" }],
        sfx: { text: "¡CLIC!", x: 22, y: 30, rotate: -10 },
      },
      {
        layout: "wide",
        bg: "bosque",
        narration: "Esa tarde era el torneo de trepar árboles. Todo el santuario estaría allí… incluido el culpable.",
        cast: [{ who: "kiko", pose: "cheer", mood: "happy", x: 60 }],
        balloons: [{ who: "kiko", kind: "shout", text: "¡Nadie trepa más rápido que Kiko!" }],
      },
    ],
  },
  {
    id: "capitulo-6",
    title: "La página arrancada",
    after: "facil-6",
    panels: [
      {
        bg: "bosque",
        cast: [
          { who: "kiko", pose: "cheer", mood: "happy", x: 35 },
          { who: "bao", pose: "idle", mood: "happy", x: 72, flip: true },
        ],
        balloons: [{ who: "kiko", text: "¡Primer puesto en juveniles! ¿Viste la tabla? ¡Arriba del todo!" }],
      },
      {
        bg: "accion",
        camera: "zoom",
        narration: "Bajo el árbol del torneo, Bao encontró algo.",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 35 }],
        prop: { name: "pagina", x: 72, y: 55, scale: 1.3 },
        sfx: { text: "¡CRAC!", x: 75, y: 20, rotate: 12 },
      },
      {
        layout: "wide",
        bg: "archivo",
        cast: [
          { who: "lin", pose: "think", x: 30 },
          { who: "bao", pose: "idle", mood: "worried", x: 70, flip: true },
        ],
        balloons: [
          { who: "lin", text: "Tallos, kilos y precios… pero falta el total." },
          { who: "lin", text: "Quien la arrancó no quería que nadie hiciera la cuenta. Hazla tú." },
        ],
      },
    ],
  },
  {
    id: "capitulo-7",
    title: "La cuenta que faltaba",
    after: "facil-7",
    panels: [
      {
        bg: "archivo",
        cast: [{ who: "bao", pose: "point", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", text: "Con la columna calculada se ve: ¡el inventario oficial dice mucho menos de lo que debería haber!" }],
      },
      {
        bg: "archivo",
        cast: [{ who: "lin", pose: "idle", mood: "worried", x: 50 }],
        balloons: [{ who: "lin", text: "Entonces no es un error. Alguien se está llevando bambú." }],
      },
      {
        layout: "wide",
        bg: "noche",
        camera: "pan",
        narration: "Esa misma noche, alguien volvió a entrar en la tienda de recuerdos…",
        cast: [{ who: "sombra", pose: "run", x: 62 }],
        sfx: { text: "tip… tap… tip…", x: 28, y: 75, rotate: -4 },
      },
    ],
  },
  {
    id: "capitulo-8",
    title: "La lupa",
    after: "facil-8",
    panels: [
      {
        bg: "guarderia",
        cast: [{ who: "bao", pose: "think", x: 50 }],
        balloons: [
          { who: "bao", kind: "think", text: "Columnas con nombres raros, columnas «tmp_»… como si alguien quisiera esconder las ventas." },
        ],
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "point", x: 30 },
          { who: "bao", pose: "cheer", mood: "happy", x: 72, flip: true },
        ],
        prop: { name: "lupa", x: 52, y: 50 },
        balloons: [
          { who: "lin", text: "Usa esta lupa: te dejará ver los datos de cada reto antes de tocarlos." },
          { who: "bao", kind: "shout", text: "¡La Lupa de Bao!" },
        ],
      },
      {
        layout: "wide",
        bg: "archivo",
        narration: "El libro de visitas guardaba el siguiente secreto.",
        prop: { name: "pergamino", x: 50, y: 60, scale: 1.4 },
      },
    ],
  },
  {
    id: "capitulo-9",
    title: "Visitas de luna llena",
    after: "facil-9",
    panels: [
      {
        bg: "archivo",
        cast: [{ who: "bao", pose: "surprise", mood: "surprised", x: 50 }],
        balloons: [{ who: "bao", text: "Casi todos los visitantes vienen de pocos países… pero hay uno «desconocido» cada noche de luna llena." }],
      },
      {
        bg: "noche",
        narration: "Bao tomó una linterna y salió a vigilar.",
        cast: [{ who: "bao", pose: "idle", mood: "determined", x: 45 }],
        prop: { name: "linterna", x: 62, y: 55 },
        balloons: [{ who: "bao", text: "Esta vez no se me escapa." }],
      },
      {
        layout: "wide",
        bg: "guarderia",
        narration: "Pero antes, la clínica pidió ayuda con el resumen del fin de semana.",
        cast: [{ who: "cria", pose: "idle", mood: "sad", x: 50 }],
      },
    ],
  },
  {
    id: "capitulo-10",
    title: "La figura encapuchada",
    after: "facil-10",
    panels: [
      {
        layout: "wide",
        bg: "noche",
        narration: "Noche de luna llena. Bao vigilaba el almacén del bosque.",
        cast: [{ who: "bao", pose: "think", mood: "worried", x: 30 }],
        prop: { name: "linterna", x: 44, y: 55 },
      },
      {
        bg: "accion",
        camera: "shake",
        cast: [{ who: "sombra", pose: "run", x: 50 }],
        balloons: [{ who: "bao", kind: "shout", text: "¡ALTO AHÍ!" }],
        sfx: { text: "¡ZAS!", x: 20, y: 30, rotate: -12 },
      },
      {
        bg: "rio",
        narration: "La figura huyó hacia el río y dejó caer un fajo de registros mojados.",
        cast: [{ who: "sombra", pose: "run", x: 78, scale: 0.6 }],
        prop: { name: "pagina", x: 30, y: 80 },
      },
      {
        bg: "archivo",
        cast: [
          { who: "lin", pose: "idle", mood: "happy", x: 30 },
          { who: "bao", pose: "idle", mood: "determined", x: 72, flip: true },
        ],
        prop: { name: "pergamino", x: 52, y: 50 },
        balloons: [{ who: "lin", text: "Has dominado el Bosque de Bambú. Toma el segundo Pergamino de pistas." }],
      },
      {
        layout: "wide",
        bg: "rio",
        camera: "zoom",
        cast: [{ who: "bao", pose: "point", mood: "determined", x: 40 }],
        balloons: [
          { who: "bao", text: "Iré al Río de Datos. Allí los registros están repartidos entre las aldeas… y llenos de huecos." },
        ],
      },
    ],
  },
];
