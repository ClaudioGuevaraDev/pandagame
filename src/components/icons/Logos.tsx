import type { LevelId } from "@/content/types";
import { PALETTE } from "@/lib/theme";

type Props = { className?: string };

const INK = PALETTE.ink;
const PAPER = PALETTE.paper3;
const SEAL = PALETTE.seal;

/** Panda pintado a tinta sumi. */
export function PandaLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g filter="url(#brush-soft)">
        <ellipse cx="15" cy="15" rx="9.5" ry="9" fill={INK} />
        <ellipse cx="49" cy="15" rx="9.5" ry="9" fill={INK} />
        <path
          d="M32 10c14 0 25 9.5 25 23.5S46.5 58 32 58 7 47.5 7 33.5 18 10 32 10Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="2.6"
        />
        <path d="M17 29c3-6 10-6 11 0s-3 11-7 10-6-5-4-10Z" fill={INK} />
        <path d="M47 29c-3-6-10-6-11 0s3 11 7 10 6-5 4-10Z" fill={INK} />
        <circle cx="23" cy="31.5" r="2.4" fill={PAPER} />
        <circle cx="41" cy="31.5" r="2.4" fill={PAPER} />
        <path d="M28.5 41.5c1.5-2 5.5-2 7 0-1 2.2-6 2.2-7 0Z" fill={INK} />
        <path d="M27 47c2.5 2.6 7.5 2.6 10 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="16.5" cy="41" r="3" fill={SEAL} opacity="0.35" />
      <circle cx="47.5" cy="41" r="3" fill={SEAL} opacity="0.35" />
    </svg>
  );
}

/** Anillo de papel con borde a pincel, común a los logos de nivel. */
function SealRing({ children, tint }: { children: React.ReactNode; tint: string }) {
  return (
    <>
      <circle cx="32" cy="32" r="29" fill={PAPER} />
      <circle cx="32" cy="32" r="29" fill={tint} opacity="0.12" />
      <g clipPath="url(#ring-clip)">{children}</g>
      <circle cx="32" cy="32" r="28.5" fill="none" stroke={INK} strokeWidth="2.5" filter="url(#brush-soft)" />
    </>
  );
}

function RingClip() {
  return (
    <defs>
      <clipPath id="ring-clip">
        <circle cx="32" cy="32" r="28" />
      </clipPath>
    </defs>
  );
}

/** Bosque de Bambú. */
export function BambooLogo({ className }: Props) {
  const c = PALETTE.bamboo;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <RingClip />
      <SealRing tint={c}>
        <g filter="url(#brush-soft)">
          <path d="M25 62V8" stroke={c} strokeWidth="6" strokeLinecap="round" />
          <path d="M39 62V16" stroke={c} strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <path d="M21.5 24h7M21.5 40h7M35.8 30h6.5M35.8 46h6.5" stroke={INK} strokeWidth="1.8" />
          <path d="M25 22c-6-5-12-4-15 0 5 2 10 2 15 0Z" fill={INK} />
          <path d="M39 27c5-6 11-6 15-3-4 3-9 4-15 3Z" fill={INK} />
          <path d="M25 35c4-4 9-4 11-2-3 3-7 3-11 2Z" fill={INK} opacity="0.85" />
        </g>
      </SealRing>
    </svg>
  );
}

/** Río de Datos: olas seigaiha. */
export function RiverLogo({ className }: Props) {
  const c = PALETTE.river;
  const wave = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r="11" fill={PAPER} stroke={c} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="7.5" fill="none" stroke={c} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="4" fill="none" stroke={c} strokeWidth="2" />
    </g>
  );
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <RingClip />
      <SealRing tint={c}>
        <g filter="url(#brush-soft)">
          {[10, 32, 54].map((x) => wave(x, 36))}
          {[-1, 21, 43, 65].map((x) => wave(x, 44))}
          {[10, 32, 54].map((x) => wave(x, 52))}
          {[-1, 21, 43, 65].map((x) => wave(x, 60))}
          <path d="M14 20c6-6 14-6 18 0" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      </SealRing>
    </svg>
  );
}

/** Cumbre del Maestro Panda. */
export function MountainLogo({ className }: Props) {
  const c = PALETTE.summit;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <RingClip />
      <SealRing tint={c}>
        <g filter="url(#brush-soft)">
          <path d="M2 54 24 22l8 10 7-8 23 30Z" fill={c} />
          <path d="M24 22l6 8.5-3.5-1.5-3 3-3.5-3.5-3 1.5Z" fill={PAPER} />
          <path d="M39 24l5 6.5-3-1-2.5 2-2.5-2.5Z" fill={PAPER} />
          <path d="M8 44h16M36 48h20M14 51h12" stroke={PAPER} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <circle cx="47" cy="15" r="5" fill={SEAL} />
        </g>
      </SealRing>
    </svg>
  );
}

export function LevelLogo({ level, className }: Props & { level: LevelId }) {
  if (level === "facil") return <BambooLogo className={className} />;
  if (level === "medio") return <RiverLogo className={className} />;
  return <MountainLogo className={className} />;
}

/** Sello hanko bermellón (por defecto con 完, "completado"). */
export function Hanko({ className = "", char = "完" }: Props & { char?: string }) {
  return (
    <span className={`hanko ${className}`} aria-hidden="true">
      {char}
    </span>
  );
}

/** Ensō: círculo zen trazado de un pincelazo. */
export function Enso({ className, animated }: Props & { animated?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        d="M152 44C130 22 86 18 58 38 26 61 22 110 46 140c26 32 82 38 114 10 26-23 30-62 14-92"
        pathLength={1}
        fill="none"
        stroke={INK}
        strokeWidth="13"
        strokeLinecap="round"
        filter="url(#brush)"
        className={animated ? "enso-draw" : undefined}
        opacity="0.88"
      />
    </svg>
  );
}
