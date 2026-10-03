import type { LevelId } from "@/content/types";

type Props = { className?: string };

/** Cara de panda: logo de PandaGame. */
export function PandaLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="#18181b" />
      <circle cx="50" cy="14" r="10" fill="#18181b" />
      <circle cx="32" cy="35" r="25" fill="#fafafa" />
      <ellipse cx="22" cy="32" rx="7" ry="9" transform="rotate(-25 22 32)" fill="#18181b" />
      <ellipse cx="42" cy="32" rx="7" ry="9" transform="rotate(25 42 32)" fill="#18181b" />
      <circle cx="23" cy="31" r="2.6" fill="#fafafa" />
      <circle cx="41" cy="31" r="2.6" fill="#fafafa" />
      <ellipse cx="32" cy="43" rx="4.5" ry="3.2" fill="#18181b" />
      <path d="M27 48 Q32 52 37 48" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Bosque de Bambú. */
export function BambooLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#064e3b" />
      <g stroke="#34d399" strokeWidth="6" strokeLinecap="round">
        <path d="M24 54 V14" />
        <path d="M40 54 V22" />
      </g>
      <g stroke="#064e3b" strokeWidth="2">
        <path d="M20 26 H28 M20 40 H28 M36 34 H44 M36 46 H44" />
      </g>
      <path d="M24 20 Q14 16 10 22 Q18 24 24 20Z" fill="#a3e635" />
      <path d="M40 28 Q50 22 54 28 Q46 31 40 28Z" fill="#a3e635" />
      <path d="M24 32 Q32 28 34 32 Q28 35 24 32Z" fill="#a3e635" />
    </svg>
  );
}

/** Río de Datos. */
export function RiverLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#0c4a6e" />
      <g fill="none" strokeLinecap="round" strokeWidth="5">
        <path d="M10 24 Q18 18 26 24 T42 24 T56 22" stroke="#38bdf8" />
        <path d="M8 36 Q16 30 24 36 T40 36 T56 34" stroke="#22d3ee" />
        <path d="M10 48 Q18 42 26 48 T42 48 T54 46" stroke="#7dd3fc" />
      </g>
    </svg>
  );
}

/** Cumbre del Maestro Panda. */
export function MountainLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#3b0764" />
      <path d="M6 50 L24 22 L34 36 L42 26 L58 50 Z" fill="#a78bfa" />
      <path d="M24 22 L30 31 L26 30 L22 33 L19 30 Z" fill="#f5f3ff" />
      <path d="M42 26 L47 33 L43 32 L39 34 Z" fill="#f5f3ff" />
      <path d="M24 22 V10" stroke="#f0abfc" strokeWidth="2" />
      <path d="M24 10 L33 13 L24 16 Z" fill="#f0abfc" />
    </svg>
  );
}

export function LevelLogo({ level, className }: Props & { level: LevelId }) {
  if (level === "facil") return <BambooLogo className={className} />;
  if (level === "medio") return <RiverLogo className={className} />;
  return <MountainLogo className={className} />;
}
