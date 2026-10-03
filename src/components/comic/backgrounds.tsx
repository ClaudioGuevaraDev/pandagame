import type { ReactNode } from "react";
import type { BackgroundName, PropName } from "@/content/story/types";
import { PALETTE } from "@/lib/theme";

/**
 * Fondos del cómic: se dibujan para cualquier proporción (w × h, con h = 300),
 * así la viñeta nunca recorta a los personajes.
 */

const P = PALETTE;
const NIGHT = "#24211d";
const NIGHT_2 = "#3a352d";

/** Pseudoaleatorio estable y entero (igual en el servidor y en el navegador). */
const rand = (i: number) => {
  let x = Math.imul(i + 1, 2654435761) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822507) >>> 0;
  x ^= x >>> 13;
  return Math.round(((x >>> 0) / 4294967296) * 1000) / 1000;
};
/** Redondea coordenadas calculadas con trigonometría (evita desajustes de hidratación). */
const r1 = (v: number) => Math.round(v * 10) / 10;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const GROUND = 0.9; // y del suelo como fracción del alto

function BambooStalk({ x, h, top, color, w = 9, leaves = true, i }: { x: number; h: number; top: number; color: string; w?: number; leaves?: boolean; i: number }) {
  const nodes = range(Math.floor((h - top) / 46));
  return (
    <g>
      <path d={`M${x} ${h}V${top}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {nodes.map((n) => (
        <path key={n} d={`M${x - w / 2 - 1} ${h - 30 - n * 46}h${w + 2}`} stroke={P.ink} strokeWidth="1.6" opacity="0.6" />
      ))}
      {leaves &&
        range(2).map((n) => {
          const y = top + 30 + n * 60 + rand(i + n) * 20;
          const dir = (i + n) % 2 ? 1 : -1;
          return (
            <path
              key={`l${n}`}
              d={`M${x} ${y}q${dir * 16} -12 ${dir * 32} -2q${-dir * 14} 9 ${-dir * 32} 2Z`}
              fill={color}
              opacity="0.9"
            />
          );
        })}
    </g>
  );
}

function Archivo({ w, h }: { w: number; h: number }) {
  const cols = Math.max(2, Math.round(w / 95));
  const cw = w / cols;
  return (
    <>
      <rect width={w} height={h} fill={P.paper2} />
      {range(cols).map((c) => (
        <g key={c} transform={`translate(${c * cw + 8} 0)`}>
          <rect x="0" y="0" width={cw - 16} height={h * GROUND} fill="#d9c7a1" stroke={P.ink} strokeWidth="2" />
          {range(4).map((r) => {
            const y = 30 + r * ((h * GROUND - 30) / 4);
            return (
              <g key={r}>
                <path d={`M0 ${y + 44}h${cw - 16}`} stroke={P.ink} strokeWidth="3" />
                {range(Math.floor((cw - 24) / 13)).map((k) => (
                  <g key={k}>
                    <rect x={6 + k * 13} y={y + 14 + rand(c * 31 + r * 7 + k) * 8} width="10" height={30 - rand(c + r + k) * 8} rx="2" fill={k % 3 === 0 ? "#efe3c6" : k % 3 === 1 ? "#e4d2ab" : P.paper3} stroke={P.ink} strokeWidth="1.2" />
                    <circle cx={11 + k * 13} cy={y + 17 + rand(c * 31 + r * 7 + k) * 8} r="2.2" fill={k % 4 === 0 ? P.seal : P.ink} opacity="0.75" />
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {/* Farol */}
      <g transform={`translate(${w * 0.82} 0)`}>
        <path d="M0 0v22" stroke={P.ink} strokeWidth="2" />
        <ellipse cx="0" cy="40" rx="15" ry="19" fill={P.seal} stroke={P.ink} strokeWidth="2.4" />
        <path d="M-15 40h30M-12 30h24M-12 50h24" stroke={P.ink} strokeWidth="1.2" opacity="0.6" />
        <circle cx="0" cy="40" r="40" fill="#f2c14e" opacity="0.12" />
      </g>
      <rect y={h * GROUND} width={w} height={h} fill="#c9b38a" />
      <path d={`M0 ${h * GROUND}H${w}`} stroke={P.ink} strokeWidth="3" />
    </>
  );
}

function Bosque({ w, h }: { w: number; h: number }) {
  const n = Math.max(4, Math.round(w / 45));
  return (
    <>
      <rect width={w} height={h} fill={P.paper3} />
      <circle cx={w * 0.78} cy={h * 0.22} r="26" fill={P.seal} opacity="0.85" />
      {range(n).map((i) => (
        <BambooStalk key={`b${i}`} i={i} x={(i + rand(i) * 0.6) * (w / n)} h={h} top={10 + rand(i + 9) * 40} color="#9fb88a" w={7} leaves />
      ))}
      {range(Math.ceil(n / 2)).map((i) => (
        <BambooStalk key={`f${i}`} i={i + 50} x={(i * 2 + 0.5 + rand(i + 3)) * (w / n)} h={h} top={-10} color={P.bamboo} w={12} leaves />
      ))}
      <path d={`M0 ${h * GROUND}q${w / 4}-10 ${w / 2} 0t${w / 2} 0V${h}H0Z`} fill="#b8c79a" stroke={P.ink} strokeWidth="2.5" />
    </>
  );
}

function Guarderia({ w, h }: { w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} fill="#e4cfa6" />
      {range(9).map((i) => (
        <path key={i} d={`M0 ${i * 34 + 10}H${w}`} stroke="#c6a979" strokeWidth="2" />
      ))}
      {/* Ventana redonda */}
      <g transform={`translate(${w * 0.5} ${h * 0.34})`}>
        <circle r="52" fill="#dfe8d0" stroke={P.ink} strokeWidth="4" />
        <path d="M-52 20c20-24 40-30 60-12s30 6 44-8V60h-104Z" fill="#9fb88a" />
        <path d="M-52 0h104M0-52v104" stroke={P.ink} strokeWidth="3" />
      </g>
      {/* Guirnalda */}
      <path d={`M0 18q${w / 4} 30 ${w / 2} 0t${w / 2} 0`} stroke={P.ink} strokeWidth="1.5" fill="none" />
      {range(Math.round(w / 40)).map((i) => {
        const x = i * 40 + 20;
        const t = (x % (w / 2)) / (w / 2);
        const y = r1(18 + Math.sin(t * Math.PI) * 15);
        return <path key={i} d={`M${x - 6} ${y}h12l-6 12Z`} fill={i % 2 ? P.seal : P.bamboo} />;
      })}
      <rect y={h * GROUND} width={w} height={h} fill="#b08b5a" />
      <path d={`M0 ${h * GROUND}H${w}`} stroke={P.ink} strokeWidth="3" />
    </>
  );
}

function Rio({ w, h }: { w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} fill={P.paper3} />
      <path d={`M0 ${h * 0.42}q${w * 0.2}-50 ${w * 0.4}-10t${w * 0.6}-20V${h}H0Z`} fill="#c8d3c0" />
      {/* Casitas en la orilla */}
      {range(Math.max(2, Math.round(w / 220))).map((i) => {
        const x = w * 0.15 + i * 220;
        return (
          <g key={i} transform={`translate(${x} ${h * 0.47})`}>
            <rect x="-18" y="-16" width="36" height="22" fill={P.paper2} stroke={P.ink} strokeWidth="2" />
            <path d="M-26-14l26-18 26 18Z" fill={P.ink} />
          </g>
        );
      })}
      <path d={`M0 ${h * 0.55}H${w}V${h}H0Z`} fill={P.river} opacity="0.85" />
      {range(6).map((r) =>
        range(Math.ceil(w / 60)).map((i) => (
          <path
            key={`${r}-${i}`}
            d={`M${i * 60 + (r % 2) * 30} ${h * 0.6 + r * 18}q10-8 20 0`}
            stroke={P.paper3}
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        )),
      )}
      <path d={`M0 ${h * GROUND}q${w / 3}-14 ${w} -4V${h}H0Z`} fill="#b8c79a" stroke={P.ink} strokeWidth="2.5" />
    </>
  );
}

function Cumbre({ w, h }: { w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} fill="#efe1d0" />
      <circle cx={w * 0.25} cy={h * 0.25} r="30" fill={P.seal} />
      <path d={`M0 ${h * 0.55}L${w * 0.2} ${h * 0.3}L${w * 0.38} ${h * 0.5}L${w * 0.6} ${h * 0.18}L${w * 0.85} ${h * 0.48}L${w} ${h * 0.36}V${h}H0Z`} fill="#b9a2c2" />
      <path d={`M${w * 0.52} ${h * 0.28}L${w * 0.6} ${h * 0.18}L${w * 0.68} ${h * 0.28}l-8 4-8-4-8 4Z`} fill={P.paper3} />
      <path d={`M0 ${h * 0.7}L${w * 0.3} ${h * 0.45}L${w * 0.55} ${h * 0.68}L${w * 0.8} ${h * 0.5}L${w} ${h * 0.66}V${h}H0Z`} fill={P.summit} />
      {range(3).map((i) => (
        <path key={i} d={`M${w * (0.1 + i * 0.32)} ${h * (0.36 + i * 0.05)}h${50 + i * 10}`} stroke={P.paper3} strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      ))}
      <path d={`M0 ${h * GROUND}q${w / 2}-18 ${w} 0V${h}H0Z`} fill="#8d7a92" stroke={P.ink} strokeWidth="2.5" />
    </>
  );
}

function Noche({ w, h }: { w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} fill={NIGHT} />
      {range(Math.round(w / 18)).map((i) => (
        <circle key={i} cx={rand(i) * w} cy={rand(i + 100) * h * 0.6} r={rand(i + 7) * 1.4 + 0.4} fill={P.paper3} opacity={0.4 + rand(i + 3) * 0.5} />
      ))}
      <circle cx={w * 0.72} cy={h * 0.3} r="62" fill={P.paper3} opacity="0.08" />
      <circle cx={w * 0.72} cy={h * 0.3} r="40" fill="#f6ecd0" />
      <circle cx={w * 0.72 - 10} cy={h * 0.3 - 8} r="6" fill="#e3d6b4" />
      <circle cx={w * 0.72 + 12} cy={h * 0.3 + 10} r="4" fill="#e3d6b4" />
      {range(Math.max(3, Math.round(w / 70))).map((i) => (
        <BambooStalk key={i} i={i + 20} x={(i + rand(i)) * 70} h={h} top={rand(i + 5) * 80} color={NIGHT_2} w={9} leaves />
      ))}
      <rect y={h * GROUND} width={w} height={h} fill="#171512" />
    </>
  );
}

function Almacen({ w, h }: { w: number; h: number }) {
  return (
    <>
      <rect width={w} height={h} fill="#5a4a38" />
      {range(Math.ceil(w / 40)).map((i) => (
        <path key={i} d={`M${i * 40} 0V${h}`} stroke="#4a3c2d" strokeWidth="3" />
      ))}
      {/* Luz de vela */}
      <circle cx={w * 0.18} cy={h * 0.5} r="90" fill="#f2c14e" opacity="0.14" />
      <rect x={w * 0.18 - 4} y={h * 0.5} width="8" height="18" fill={P.paper3} />
      <path d={`M${w * 0.18} ${h * 0.5 - 10}q5 6 0 10q-5-4 0-10Z`} fill="#f2c14e" />
      {/* Cajas y fardos */}
      {range(Math.max(2, Math.round(w / 160))).map((i) => {
        const x = w * 0.35 + i * 150;
        return (
          <g key={i} transform={`translate(${x} ${h * GROUND})`}>
            <rect x="-30" y="-56" width="60" height="56" fill="#9a7a4e" stroke={P.ink} strokeWidth="2.5" />
            <path d="M-30-56l60 56M30-56l-60 56" stroke={P.ink} strokeWidth="1.6" opacity="0.6" />
            <rect x="-22" y="-100" width="44" height="44" fill="#a98a5c" stroke={P.ink} strokeWidth="2.5" />
            <text x="0" y="-70" fontSize="18" textAnchor="middle" fill={P.ink} opacity="0.7" fontWeight="bold">
              竹
            </text>
          </g>
        );
      })}
      <rect y={h * GROUND} width={w} height={h} fill="#3b3024" />
    </>
  );
}

function Accion({ w, h, uid }: { w: number; h: number; uid: string }) {
  const cx = w / 2;
  const cy = h * 0.45;
  const n = 36;
  const R = Math.max(w, h);
  return (
    <>
      <rect width={w} height={h} fill={P.paper3} />
      <radialGradient id={`${uid}-burst`}>
        <stop offset="0" stopColor="#f2c14e" stopOpacity="0.9" />
        <stop offset="1" stopColor="#f2c14e" stopOpacity="0" />
      </radialGradient>
      <circle cx={cx} cy={cy} r={h * 0.55} fill={`url(#${uid}-burst)`} />
      {range(n).map((i) => {
        const a = (i / n) * Math.PI * 2 + rand(i) * 0.08;
        const r0 = h * (0.32 + rand(i + 4) * 0.12);
        const da = 0.02 + rand(i + 9) * 0.02;
        return (
          <path
            key={i}
            d={`M${r1(cx + Math.cos(a) * r0)} ${r1(cy + Math.sin(a) * r0)}L${r1(cx + Math.cos(a - da) * R)} ${r1(cy + Math.sin(a - da) * R)}L${r1(cx + Math.cos(a + da) * R)} ${r1(cy + Math.sin(a + da) * R)}Z`}
            fill={P.ink}
            opacity={0.85}
          />
        );
      })}
    </>
  );
}

export function Background({ name, w, h, uid }: { name: BackgroundName; w: number; h: number; uid: string }) {
  switch (name) {
    case "archivo":
      return <Archivo w={w} h={h} />;
    case "bosque":
      return <Bosque w={w} h={h} />;
    case "guarderia":
      return <Guarderia w={w} h={h} />;
    case "rio":
      return <Rio w={w} h={h} />;
    case "cumbre":
      return <Cumbre w={w} h={h} />;
    case "noche":
      return <Noche w={w} h={h} />;
    case "almacen":
      return <Almacen w={w} h={h} />;
    case "accion":
      return <Accion w={w} h={h} uid={uid} />;
  }
}

/** Fondos oscuros: el texto de las cajas sigue siendo claro sobre papel, pero las líneas cambian. */
export const DARK_BACKGROUNDS: ReadonlySet<BackgroundName> = new Set(["noche", "almacen"]);

// ── Objetos (caja de 40 × 40 centrada en 0,0) ──────────────────────────

const PROP_ART: Record<PropName, ReactNode> = {
  pincel: (
    <g>
      <path d="M-16 16L10-10" stroke="#9a7a4e" strokeWidth="6" strokeLinecap="round" />
      <path d="M10-10l4-4" stroke={P.seal} strokeWidth="6" />
      <path d="M14-14c4-4 8-6 10-4s0 6-4 10Z" fill={P.ink} />
      <path d="M-16 16L10-10" stroke={P.ink} strokeWidth="1.5" fill="none" />
    </g>
  ),
  pergamino: (
    <g>
      <rect x="-18" y="-12" width="36" height="24" fill={P.paper3} stroke={P.ink} strokeWidth="2" />
      <rect x="-22" y="-14" width="6" height="28" rx="3" fill="#9a7a4e" stroke={P.ink} strokeWidth="2" />
      <rect x="16" y="-14" width="6" height="28" rx="3" fill="#9a7a4e" stroke={P.ink} strokeWidth="2" />
      <path d="M-12-5h20M-12 0h24M-12 5h16" stroke={P.ink} strokeWidth="1.5" />
      <circle cx="10" cy="6" r="3" fill={P.seal} />
    </g>
  ),
  huella: (
    <g fill={P.ink}>
      <ellipse cx="0" cy="6" rx="8" ry="7" />
      {[-9, -3, 3, 9].map((x, i) => (
        <ellipse key={x} cx={x} cy={-6 - (i === 1 || i === 2 ? 3 : 0)} rx="2.6" ry="3.4" />
      ))}
      <ellipse cx="24" cy="-2" rx="6" ry="5.5" opacity="0.8" />
      {[17, 22, 27, 31].map((x, i) => (
        <ellipse key={x} cx={x} cy={-12 - (i === 1 || i === 2 ? 2 : 0)} rx="2" ry="2.6" opacity="0.8" />
      ))}
    </g>
  ),
  pagina: (
    <g>
      <path d="M-14-18h24l6 6v30h-30l4-6-4-6 4-6-4-6 4-6Z" fill={P.paper3} stroke={P.ink} strokeWidth="2" />
      <path d="M-8-10h16M-8-4h16M-8 2h16M-8 8h10" stroke={P.ink} strokeWidth="1.4" />
      <path d="M2-10v20" stroke={P.ink} strokeWidth="1" />
    </g>
  ),
  linterna: (
    <g>
      <circle r="22" fill="#f2c14e" opacity="0.25" />
      <path d="M-6-20h12M0-24v4" stroke={P.ink} strokeWidth="2" />
      <ellipse cx="0" cy="0" rx="11" ry="15" fill="#f2c14e" stroke={P.ink} strokeWidth="2.4" />
      <path d="M-11 0h22M-9-8h18M-9 8h18" stroke={P.ink} strokeWidth="1.2" opacity="0.6" />
    </g>
  ),
  lupa: (
    <g>
      <circle cx="-4" cy="-4" r="12" fill="#dfe8f0" fillOpacity="0.6" stroke={P.ink} strokeWidth="3" />
      <path d="M5 5l12 12" stroke="#9a7a4e" strokeWidth="6" strokeLinecap="round" />
      <path d="M-10-8q3-5 8-5" stroke={P.paper3} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  brujula: (
    <g>
      <circle r="16" fill={P.paper3} stroke={P.ink} strokeWidth="3" />
      <circle r="16" fill="none" stroke={P.bamboo} strokeWidth="2" strokeDasharray="2 4" />
      <path d="M0-12l4 12-4 12-4-12Z" fill={P.seal} stroke={P.ink} strokeWidth="1.2" />
      <path d="M0 0l4 0-4 12-4-12Z" fill={P.ink} />
    </g>
  ),
  catalejo: (
    <g transform="rotate(-20)">
      <rect x="-22" y="-5" width="16" height="10" fill="#9a7a4e" stroke={P.ink} strokeWidth="2" />
      <rect x="-6" y="-6.5" width="14" height="13" fill="#b08b5a" stroke={P.ink} strokeWidth="2" />
      <rect x="8" y="-8" width="14" height="16" fill={P.seal} stroke={P.ink} strokeWidth="2" />
    </g>
  ),
  sello: (
    <g>
      <rect x="-14" y="-14" width="28" height="28" rx="4" fill={P.seal} stroke={P.ink} strokeWidth="2" />
      <circle cx="0" cy="0" r="8" fill={P.paper3} />
      <circle cx="4" cy="-3" r="7" fill={P.seal} />
    </g>
  ),
  llave: (
    <g>
      <circle cx="-10" cy="0" r="8" fill="none" stroke="#c99a2e" strokeWidth="4" />
      <path d="M-2 0h22M14 0v6M19 0v5" stroke="#c99a2e" strokeWidth="4" strokeLinecap="round" />
      <circle cx="-10" cy="0" r="10" fill="none" stroke={P.ink} strokeWidth="1.2" />
    </g>
  ),
  mapa: (
    <g>
      <path d="M-20-14l13 4 14-4 13 4v26l-13-4-14 4-13-4Z" fill={P.paper3} stroke={P.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-7-10v26M7-14v26" stroke={P.ink} strokeWidth="1.2" opacity="0.5" />
      <path d="M-14 6q6-10 12-2t12-6" stroke={P.ink} strokeWidth="1.4" strokeDasharray="2 2" fill="none" />
      <path d="M10-6l4 4M14-6l-4 4" stroke={P.seal} strokeWidth="2.2" />
    </g>
  ),
  bambu: (
    <g>
      {[-12, -4, 4, 12].map((x, i) => (
        <path key={x} d={`M${x} 16V${-16 + i * 3}`} stroke={i % 2 ? P.bamboo : "#7fa060"} strokeWidth="7" strokeLinecap="round" />
      ))}
      <path d="M-17 4h34" stroke="#9a7a4e" strokeWidth="3" />
    </g>
  ),
};

export function Prop({ name }: { name: PropName }) {
  return <>{PROP_ART[name]}</>;
}
