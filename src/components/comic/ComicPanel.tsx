"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { Balloon, Panel } from "@/content/story/types";
import { Background, DARK_BACKGROUNDS as DARK, GROUND, Prop } from "./backgrounds";
import { CHARACTER_BOX, CHARACTER_NAMES, CHARACTER_SCALE, Character } from "./characters";

const H = 300;
const TYPE_MS = 24;

type Props = {
  panel: Panel;
  /** Muestra la narración completa sin animación de escritura. */
  instant: boolean;
  /** Se llama cuando termina de escribirse la narración. */
  onTyped?: () => void;
  className?: string;
};

/** Texto plano de la viñeta (para lectores de pantalla y tests). */
export function panelText(panel: Panel): string {
  return [
    panel.narration && `Narrador: ${panel.narration}`,
    ...(panel.balloons ?? []).map((b) => `${CHARACTER_NAMES[b.who]}: ${b.text}`),
    panel.sfx && `(${panel.sfx.text})`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Mide la caja de la viñeta para dibujar el arte con su proporción exacta. */
function useAspect(ref: React.RefObject<HTMLElement | null>, initial: number) {
  const [aspect, setAspect] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setAspect(width / height);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return aspect;
}

function useTypewriter(text: string, instant: boolean, onDone?: () => void) {
  const [n, setN] = useState(instant ? text.length : 0);
  const done = instant || n >= text.length;
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  useEffect(() => {
    if (done) {
      doneRef.current?.();
      return;
    }
    const t = setTimeout(() => setN((x) => x + 1), TYPE_MS);
    return () => clearTimeout(t);
  }, [n, done]);
  return done ? text.length : n;
}

const CAMERA = { zoom: "comic-cam-zoom", pan: "comic-cam-pan", shake: "comic-cam-shake" } as const;

export function ComicPanel({ panel, instant, onTyped, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const aspect = useAspect(boxRef, panel.layout === "wide" ? 2.6 : 1.3);
  const W = Math.round(H * aspect);

  const narration = panel.narration ?? "";
  const typed = useTypewriter(narration, instant, onTyped);
  const narrationDone = typed >= narration.length;

  const cast = panel.cast ?? [];
  const ground = H * GROUND + 6;
  const base = (0.56 * H) / CHARACTER_BOX.h;
  // Si hay muchos personajes en una viñeta estrecha, se encogen para no taparse.
  const fit = cast.length ? Math.min(1, (W * 0.92) / (cast.length * CHARACTER_BOX.w * base)) : 1;

  return (
    <div
      ref={boxRef}
      className={`comic-panel relative overflow-hidden border-[3px] border-ink bg-paper-3 ${className}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id={`${uid}-dots`} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1.1" fill="#1d1b18" />
          </pattern>
          <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`${uid}-mask`}>
            <rect width={W} height={H} fill={`url(#${uid}-fade)`} />
          </mask>
        </defs>
        <g className={panel.camera ? CAMERA[panel.camera] : undefined} style={{ transformOrigin: "50% 60%" }}>
          <Background name={panel.bg} w={W} h={H} uid={uid} />
          {/* Velo de papel: el fondo queda atrás y los personajes resaltan */}
          <rect width={W} height={H} fill="#fbf6ea" opacity={DARK.has(panel.bg) ? 0.06 : 0.3} />
          {/* Trama de puntos en una esquina, como en la imprenta */}
          <rect width={W} height={H} fill={`url(#${uid}-dots)`} opacity="0.13" mask={`url(#${uid}-mask)`} />
          {panel.prop && (
            <g
              transform={`translate(${(panel.prop.x / 100) * W} ${(panel.prop.y / 100) * H}) scale(${(panel.prop.scale ?? 1) * 2.1 * Math.min(1, W / 420)})`}
            >
              <Prop name={panel.prop.name} />
            </g>
          )}
          {cast.map((m, i) => {
            const s = base * fit * CHARACTER_SCALE[m.who] * (m.scale ?? 1);
            const x = (m.x / 100) * W;
            return (
              <g
                key={i}
                transform={`translate(${x} ${ground}) scale(${m.flip ? -s : s} ${s}) translate(${-CHARACTER_BOX.w / 2} ${-CHARACTER_BOX.h})`}
              >
                <Character who={m.who} pose={m.pose} mood={m.mood} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Texto real (no SVG): legible, seleccionable y escalable */}
      <div className="comic-text absolute inset-0 flex flex-col items-stretch gap-[0.5em] p-[0.7em]" aria-hidden="true">
        {narration && (
          <p className="comic-caption self-start">
            <span>{narration.slice(0, typed)}</span>
            <span className="invisible">{narration.slice(typed)}</span>
          </p>
        )}
        {(panel.balloons ?? []).map((b, i) => (
          <SpeechBalloon key={i} balloon={b} index={i} panel={panel} visible={narrationDone} instant={instant} />
        ))}
      </div>

      {panel.sfx && narrationDone && (
        <span
          className="comic-sfx comic-pop pointer-events-none absolute"
          style={{
            left: `${panel.sfx.x}%`,
            top: `${panel.sfx.y}%`,
            rotate: `${panel.sfx.rotate ?? 0}deg`,
            animationDelay: instant ? "0ms" : "150ms",
          }}
          aria-hidden="true"
        >
          {panel.sfx.text}
        </span>
      )}
    </div>
  );
}

function SpeechBalloon({
  balloon,
  index,
  panel,
  visible,
  instant,
}: {
  balloon: Balloon;
  index: number;
  panel: Panel;
  visible: boolean;
  instant: boolean;
}) {
  const speaker = panel.cast?.find((c) => c.who === balloon.who);
  // Se alinea hacia el lado de quien habla; la cola apunta a su posición.
  const x = speaker?.x ?? 92;
  const align = x < 40 ? "self-start" : x > 60 ? "self-end" : "self-center";
  const tail = x < 40 ? "left-[22%]" : x > 60 ? "right-[22%]" : "left-[calc(50%-6px)]";
  const kind = balloon.kind ?? "say";
  return (
    <p
      className={`comic-balloon comic-balloon-${kind} comic-pop relative max-w-[78%] ${align} ${visible ? "" : "invisible"}`}
      style={{ animationDelay: instant ? "0ms" : `${index * 380}ms`, animationPlayState: visible ? "running" : "paused" }}
    >
      {balloon.text}
      {kind === "think" ? (
        <span className={`absolute -bottom-[1.1em] ${tail} flex flex-col items-center gap-[0.15em]`}>
          <span className="block h-[0.55em] w-[0.55em] rounded-full border-2 border-ink bg-[var(--balloon)]" />
          <span className="block h-[0.32em] w-[0.32em] rounded-full border-2 border-ink bg-[var(--balloon)]" />
        </span>
      ) : (
        <span className={`comic-tail absolute -bottom-[7px] h-3 w-3 ${tail}`} />
      )}
    </p>
  );
}
