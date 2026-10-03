import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  KeyRound,
  Lightbulb,
  BookMarked,
  BookOpenText,
  Play,
  RotateCcw,
  Search,
  Telescope,
  Trash2,
} from "lucide-react";
import { FEATURES } from "@/lib/features";
import { Hanko } from "./icons/Logos";

type Item = {
  /** Réplica visual del control (no interactiva). */
  sample: ReactNode;
  name: string;
  shortcut?: string;
  description: ReactNode;
};

const BUTTONS: Item[] = [
  {
    sample: (
      <span className="btn btn-ink px-4 py-1.5 text-sm">
        <Play className="h-4 w-4 fill-current" /> Ejecutar
      </span>
    ),
    name: "Ejecutar",
    shortcut: "Ctrl + Enter",
    description: (
      <>
        Corre tu código con los datos del reto y muestra el resultado en la pestaña <b>Salida</b>. Si la última línea
        es un DataFrame o una Series, la verás como tabla. No cuenta como intento: úsalo tanto como quieras para
        explorar.
      </>
    ),
  },
  {
    sample: (
      <span className="btn btn-seal px-4 py-1.5 text-sm">
        <FlaskConical className="h-4 w-4" /> Correr tests
      </span>
    ),
    name: "Correr tests",
    shortcut: "Ctrl + Shift + Enter",
    description: (
      <>
        Comprueba tu solución contra todos los tests del reto, incluidos algunos con <b>datos ocultos</b> distintos a
        los del ejemplo. Si pasan todos, ganas el sello <Hanko className="mx-0.5 inline-flex h-5 w-5 align-middle text-[10px]" />{" "}
        y se desbloquea el siguiente reto. Cada vez que lo pulsas cuenta como un intento.
      </>
    ),
  },
  {
    sample: (
      <span className="btn-ghost px-3 py-1.5 text-sm">
        <RotateCcw className="h-4 w-4" /> Restaurar
      </span>
    ),
    name: "Restaurar",
    description: "Vuelve al código inicial del reto. Pide confirmación porque borra lo que hayas escrito en ese reto.",
  },
  {
    sample: (
      <span className="btn btn-paper px-3 py-1.5 text-sm">
        <Lightbulb className="h-4 w-4" /> Ver pista
      </span>
    ),
    name: "Ver pista",
    description:
      "Muestra una pista. Cada reto tiene varias, de la más general a la más concreta. Se desbloquean con los Pergaminos de pistas de la historia (tras los retos 3, 10 y 20); hasta entonces el botón aparece con candado.",
  },
  {
    sample: (
      <span className="btn btn-paper px-3 py-1.5 text-sm">
        <Search className="h-4 w-4" /> Ver datos
      </span>
    ),
    name: "Ver datos",
    description:
      "Aparece con la Lupa de Bao (tras el reto 8): abre una ventana con las tablas y variables que el reto prepara antes de tu código.",
  },
  {
    sample: (
      <span className="btn btn-paper px-3 py-1.5 text-sm">
        <BookOpen className="h-4 w-4" /> Repasar en el tutorial
      </span>
    ),
    name: "Repasar en el tutorial",
    description: "Abre la lección del tutorial que explica la técnica que practica el reto.",
  },
  ...(FEATURES.showSolution
    ? [
        {
          sample: (
            <span className="btn btn-paper px-3 py-1.5 text-sm">
              <KeyRound className="h-4 w-4" /> Ver solución
            </span>
          ),
          name: "Ver solución",
          description: "Aparece tras varios intentos fallidos y reemplaza tu código por una solución de referencia.",
        },
      ]
    : []),
  {
    sample: (
      <span className="btn-ghost p-1.5">
        <ArrowLeft className="h-5 w-5" />
      </span>
    ),
    name: "Volver al mapa",
    description: "La flecha de la esquina superior izquierda del reto te lleva de vuelta al mapa.",
  },
];

const INDICATORS: Item[] = [
  {
    sample: (
      <span className="block max-w-[12rem] border-2 border-ink bg-[#f6d77a] px-2 py-1 text-xs font-bold italic text-ink">
        La figura encapuchada huyó hacia el río…
      </span>
    ),
    name: "Misión",
    description: "El recuadro amarillo sobre el enunciado: el contexto de la historia en este reto.",
  },
  {
    sample: (
      <span className="btn btn-seal px-4 py-1.5 text-sm">
        <BookOpenText className="h-4 w-4" /> Continuar la historia
      </span>
    ),
    name: "Continuar la historia",
    description:
      "Al superar un reto aparece este botón: abre la escena de cómic que sigue (y las recompensas que ganaste). Las viñetas avanzan solas (⏸ pausa el avance automático) y también con clic, Espacio o →; «Saltar» va directo al final.",
  },
  {
    sample: (
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
        <Telescope className="h-4 w-4" /> Catalejo: compara celda por celda
      </span>
    ),
    name: "Catalejo",
    description:
      "Con el Catalejo (tras el reto 15), cuando un test falla puedes ver la tabla esperada junto a la tuya, con las celdas distintas marcadas en rojo.",
  },
  {
    sample: (
      <span className="flex gap-4 border-b border-rule px-1 text-sm font-bold">
        <span className="border-b-[3px] border-ink pb-1 text-ink">Salida</span>
        <span className="pb-1 text-ink-3">
          Tests <span className="text-seal-ink">2/4</span>
        </span>
      </span>
    ),
    name: "Pestañas Salida y Tests",
    description: (
      <>
        <b>Salida</b> muestra lo que imprime tu código, la tabla resultante y los errores (con la línea donde
        ocurrieron). <b>Tests</b> lista cada test con ✓ o ✗ y, si falla, el motivo: léelo, suele decir exactamente qué
        se esperaba.
      </>
    ),
  },
  {
    sample: (
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink-2">
        <span className="h-2 w-2 rounded-full bg-bamboo" /> Python listo
      </span>
    ),
    name: "Estado de Python",
    description:
      "Python y pandas se ejecutan en tu navegador. La primera vez tardan unos segundos en cargar; espera a ver «Python listo». Si tu código tarda más de 10 segundos (por ejemplo, un bucle infinito) se detiene solo.",
  },
  {
    sample: (
      <span className="flex items-center gap-1">
        <span className="font-display mr-1 text-sm font-extrabold text-bamboo-ink">一</span>
        <span className="h-2 w-2 rounded-[2px] bg-seal" />
        <span className="h-2 w-2 rounded-[2px] bg-seal" />
        <span className="h-3 w-3 rounded-full border-2 border-seal bg-paper-3" />
        <span className="h-2 w-2 rounded-full border border-ink-3/60" />
        <span className="h-2 w-2 rounded-full border border-ink-3/60" />
      </span>
    ),
    name: "Mini-mapa",
    description:
      "En pantallas grandes, arriba a la derecha: un punto por reto. Rojo = completado, círculo = el reto actual, vacío = bloqueado. Puedes saltar a cualquier reto desbloqueado.",
  },
  {
    sample: (
      <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
        <BookMarked className="h-4 w-4" /> Diario
      </span>
    ),
    name: "Diario de Bao",
    description:
      "En el encabezado: tus objetos y ventajas, los logros y la galería de escenas. Un punto rojo avisa cuando hay recompensas nuevas.",
  },
  {
    sample: (
      <span className="btn-ghost p-2">
        <Trash2 className="h-4 w-4" />
      </span>
    ),
    name: "Borrar todo el progreso",
    description:
      "La papelera del encabezado borra tu avance, tu código, las lecciones leídas, las escenas vistas y las recompensas de este navegador. Pide escribir BORRAR para confirmar.",
  },
];

function GuideList({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-6">
      <h3 className="font-display text-xl font-extrabold text-ink">{title}</h3>
      <dl className="mt-3 divide-y divide-rule border-y-2 border-ink">
        {items.map((it) => (
          <div key={it.name} className="grid gap-3 py-4 sm:grid-cols-[13rem_1fr] sm:items-start">
            <dt className="flex flex-col items-start gap-1.5">
              <span aria-hidden="true" className="pointer-events-none select-none">
                {it.sample}
              </span>
              <span className="sr-only">{it.name}</span>
              {it.shortcut && (
                <kbd className="rounded border border-rule bg-paper-3 px-1.5 py-0.5 font-mono text-xs text-ink-2">
                  {it.shortcut}
                </kbd>
              )}
            </dt>
            <dd className="text-[15px] leading-relaxed text-ink-2">{it.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Guía visual de los controles de un reto, para el tutorial. */
export function ChallengeGuide() {
  return (
    <div className="my-8">
      <GuideList title="Botones del reto" items={BUTTONS} />
      <GuideList title="Indicadores y otros controles" items={INDICATORS} />
    </div>
  );
}
