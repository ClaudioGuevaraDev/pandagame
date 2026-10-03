import type { ReactNode } from "react";
import type { CharacterId, Mood, Pose } from "@/content/story/types";
import { PALETTE } from "@/lib/theme";

/**
 * Personajes del cómic, dibujados a tinta en una caja de 100 × 140 con los pies
 * en y = 140 y mirando a la derecha. La viñeta los escala, coloca y voltea.
 */
export const CHARACTER_BOX = { w: 100, h: 140 } as const;

const INK = PALETTE.ink;
const PAPER = PALETTE.paper3;
const SEAL = PALETTE.seal;
const SW = 2.6;

type Props = { pose: Pose; mood: Mood };

// ── Piezas compartidas ──────────────────────────────────────────────────

/** Ojos: (x, y) es el centro de cada ojo. `light` = ojos claros sobre fondo oscuro. */
function Eyes({ l, r, mood, light = false }: { l: [number, number]; r: [number, number]; mood: Mood; light?: boolean }) {
  const fill = light ? PAPER : INK;
  const pupil = light ? INK : PAPER;
  const one = ([x, y]: [number, number], side: -1 | 1) => {
    switch (mood) {
      case "happy":
        return <path d={`M${x - 3.5} ${y + 1}q3.5-4.5 7 0`} stroke={fill} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
      case "surprised":
        return (
          <>
            <circle cx={x} cy={y} r="3.6" fill={fill} />
            <circle cx={x} cy={y} r="1.3" fill={pupil} />
          </>
        );
      case "sad":
        return (
          <>
            <circle cx={x} cy={y + 1} r="2.2" fill={fill} />
            <path d={`M${x - 4} ${y - 4 - side * 1.5}l8 ${side * 3}`} stroke={fill} strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case "worried":
        return (
          <>
            <circle cx={x} cy={y} r="2.3" fill={fill} />
            <path d={`M${x - 3.5} ${y - 4.5 - side * 1.2}l7 ${side * 2.4}`} stroke={fill} strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case "determined":
        return (
          <>
            <circle cx={x} cy={y + 0.5} r="2.4" fill={fill} />
            <path d={`M${x - 4} ${y - 5 + side * 1.8}l8 ${-side * 3.2}`} stroke={fill} strokeWidth="2.2" strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <circle cx={x} cy={y} r="2.5" fill={fill} />
            <circle cx={x + 0.8} cy={y - 0.8} r="0.8" fill={pupil} />
          </>
        );
    }
  };
  return (
    <>
      {one(l, -1)}
      {one(r, 1)}
    </>
  );
}

function Mouth({ x, y, mood, color = INK }: { x: number; y: number; mood: Mood; color?: string }) {
  switch (mood) {
    case "happy":
      return <path d={`M${x - 5} ${y - 1}q5 7 10 0Z`} fill={color} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />;
    case "surprised":
      return <ellipse cx={x} cy={y + 1.5} rx="2.6" ry="3.4" fill={color} />;
    case "sad":
      return <path d={`M${x - 4} ${y + 2}q4-4 8 0`} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    case "worried":
      return <path d={`M${x - 4.5} ${y + 1}q1.5-2 3 0t3 0`} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    case "determined":
      return <path d={`M${x - 4} ${y + 1}h8`} stroke={color} strokeWidth="2" strokeLinecap="round" />;
    default:
      return <path d={`M${x - 4} ${y}q2 2.5 4 0q2 2.5 4 0`} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
  }
}

/** Brazo como trazo grueso con mano redonda. */
function Arm({ d, end, color, width = 10 }: { d: string; end: [number, number]; color: string; width?: number }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={width + SW * 1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={end[0]} cy={end[1]} r={width / 2 + 1.2} fill={color} stroke={INK} strokeWidth={SW * 0.8} />
    </>
  );
}

type ArmSet = { back: ReactNode; front: ReactNode };

/** Brazos según la pose. sx/sy: hombros (atrás, delante). */
function arms(pose: Pose, color: string, back: [number, number], front: [number, number], width = 10): ArmSet {
  const [bx, by] = back;
  const [fx, fy] = front;
  const A = (d: string, end: [number, number]) => <Arm d={d} end={end} color={color} width={width} />;
  switch (pose) {
    case "think":
      return {
        back: A(`M${bx} ${by}q-6 14-2 26`, [bx + 4, by + 26]),
        front: A(`M${fx} ${fy}q10 6 2-22`, [fx - 6, fy - 22]),
      };
    case "surprise":
      return {
        back: A(`M${bx} ${by}q-12-6-16-22`, [bx - 16, by - 22]),
        front: A(`M${fx} ${fy}q12-6 16-22`, [fx + 16, fy - 22]),
      };
    case "point":
      return {
        back: A(`M${bx} ${by}q-6 14-2 26`, [bx + 4, by + 26]),
        front: A(`M${fx} ${fy}q14-2 26-10`, [fx + 26, fy - 10]),
      };
    case "cheer":
      return {
        back: A(`M${bx} ${by}q-18-4-24-32`, [bx - 24, by - 32]),
        front: A(`M${fx} ${fy}q18-4 24-32`, [fx + 24, fy - 32]),
      };
    case "write":
      return {
        back: A(`M${bx} ${by}q4 16 18 18`, [bx + 18, by + 18]),
        front: A(`M${fx} ${fy}q8 12 18 10`, [fx + 18, fy + 10]),
      };
    case "run":
      return {
        back: A(`M${bx} ${by}q-14 4-20 16`, [bx - 20, by + 16]),
        front: A(`M${fx} ${fy}q14-4 20-16`, [fx + 20, fy - 16]),
      };
    case "sad":
      return {
        back: A(`M${bx} ${by}q-2 16 4 28`, [bx + 4, by + 28]),
        front: A(`M${fx} ${fy}q2 16-4 28`, [fx - 4, fy + 28]),
      };
    default:
      return {
        back: A(`M${bx} ${by}q-8 12-6 26`, [bx - 6, by + 26]),
        front: A(`M${fx} ${fy}q8 12 6 26`, [fx + 6, fy + 26]),
      };
  }
}

/** Inclinación del cuerpo y de la cabeza según la pose. */
const BODY_TILT: Partial<Record<Pose, number>> = { run: 10, sad: -4 };
const HEAD_TILT: Partial<Record<Pose, number>> = { think: -8, sad: 8, cheer: -4, surprise: 0 };

function Legs({ pose, color }: { pose: Pose; color: string }) {
  if (pose === "run")
    return (
      <>
        <path d="M40 118l-14 18" stroke={INK} strokeWidth="14" strokeLinecap="round" />
        <path d="M40 118l-14 18" stroke={color} strokeWidth="9" strokeLinecap="round" />
        <path d="M60 118l12 16" stroke={INK} strokeWidth="14" strokeLinecap="round" />
        <path d="M60 118l12 16" stroke={color} strokeWidth="9" strokeLinecap="round" />
      </>
    );
  return (
    <>
      <ellipse cx="37" cy="133" rx="11" ry="7.5" fill={color} stroke={INK} strokeWidth={SW} />
      <ellipse cx="63" cy="133" rx="11" ry="7.5" fill={color} stroke={INK} strokeWidth={SW} />
    </>
  );
}

// ── Bao (panda) y las crías ─────────────────────────────────────────────

function Panda({ pose, mood, cub = false }: Props & { cub?: boolean }) {
  const a = arms(pose, INK, [30, 86], [70, 86], cub ? 9 : 11);
  const tilt = BODY_TILT[pose] ?? 0;
  const head = HEAD_TILT[pose] ?? 0;
  return (
    <g transform={`rotate(${tilt} 50 130)`}>
      <Legs pose={pose} color={INK} />
      {a.back}
      {/* Cuerpo */}
      <ellipse cx="50" cy="104" rx="29" ry="30" fill={PAPER} stroke={INK} strokeWidth={SW} />
      <path d="M22 96c8-14 48-14 56 0-6-6-50-6-56 0Z" fill={INK} />
      {cub ? null : <path d="M42 112q8 5 16 0" stroke={PALETTE.rule} strokeWidth="2" fill="none" />}
      {/* Cabeza */}
      <g transform={`rotate(${head} 50 52)`}>
        <circle cx="25" cy="26" r="10.5" fill={INK} />
        <circle cx="75" cy="26" r="10.5" fill={INK} />
        <ellipse cx="50" cy="50" rx={cub ? 30 : 31} ry={cub ? 28 : 27} fill={PAPER} stroke={INK} strokeWidth={SW} />
        <ellipse cx="38" cy="50" rx="8" ry="9.5" fill={INK} transform="rotate(25 38 50)" />
        <ellipse cx="62" cy="50" rx="8" ry="9.5" fill={INK} transform="rotate(-25 62 50)" />
        <Eyes l={[39, 49]} r={[63, 49]} mood={mood} light />
        <ellipse cx="51" cy="60" rx="3.6" ry="2.6" fill={INK} />
        <Mouth x={51} y={66} mood={mood} />
        <circle cx="30" cy="62" r="3.4" fill={SEAL} opacity="0.35" />
        <circle cx="72" cy="62" r="3.4" fill={SEAL} opacity="0.35" />
        {!cub && (
          // Cinta de aprendiz del Archivo
          <path d="M22 38q28-10 56 0" stroke={SEAL} strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
      </g>
      {a.front}
      {pose === "write" && (
        <g>
          <path d="M84 120l14-22" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M84 120l-3 6 5-3Z" fill={INK} />
        </g>
      )}
    </g>
  );
}

// ── Maestra Lin (grulla) ────────────────────────────────────────────────

function Crane({ pose, mood }: Props) {
  const head = HEAD_TILT[pose] ?? 0;
  const wingFront =
    pose === "point" ? "M58 84c14-8 30-14 40-12-8 6-18 12-30 14Z"
    : pose === "cheer" || pose === "surprise" ? "M60 82c10-14 18-30 30-36-2 14-12 30-24 40Z"
    : pose === "think" ? "M60 86c8-6 14-18 20-34 4 10-6 28-16 36Z"
    : "M42 82c14-6 30-2 36 10-12 4-28 4-36-10Z";
  const wingBack =
    pose === "cheer" || pose === "surprise" ? "M40 82c-10-14-18-30-30-36 2 14 12 30 24 40Z" : null;
  return (
    <g>
      {/* Patas */}
      <path d="M46 100v38M56 100l2 38" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M40 139h10M52 139h12" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      {wingBack && <path d={wingBack} fill={PAPER} stroke={INK} strokeWidth={SW} />}
      {/* Cola */}
      <path d="M30 90c-10 2-16 10-18 18 8-2 14-4 20-10Z" fill={INK} />
      {/* Cuerpo */}
      <path d="M28 90c4-14 22-20 36-14 8 4 10 14 6 22-8 10-30 12-42-8Z" fill={PAPER} stroke={INK} strokeWidth={SW} />
      {/* Cuello */}
      <path d="M62 80c4-14 0-28 2-42" stroke={INK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <g transform={`rotate(${head} 64 32)`}>
        <circle cx="66" cy="30" r="11" fill={PAPER} stroke={INK} strokeWidth={SW} />
        <path d="M60 21q6-6 12 0" stroke={SEAL} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Pico */}
        {mood === "surprised" || pose === "surprise" ? (
          <>
            <path d="M75 29l18-4-16 3Z" fill={PALETTE.ink2} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M75 33l16 6-16-3Z" fill={PALETTE.ink2} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          </>
        ) : (
          <path d="M75 29l20 3-20 3Z" fill={PALETTE.ink2} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        )}
        <Eyes l={[63, 30]} r={[69, 30]} mood={mood} />
        {/* Anteojos de archivista */}
        <circle cx="68.5" cy="30" r="4.6" fill="none" stroke={INK} strokeWidth="1.2" />
      </g>
      <path d={wingFront} fill={PAPER} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d={wingFront} fill="none" stroke={INK} strokeWidth="1" strokeDasharray="2 5" opacity="0.5" />
    </g>
  );
}

// ── Kiko (mono) ─────────────────────────────────────────────────────────

const MONKEY = "#8a5a3b";
const MONKEY_FACE = "#e2bf94";

function Monkey({ pose, mood }: Props) {
  const a = arms(pose, MONKEY, [32, 88], [68, 88], 8);
  const tilt = BODY_TILT[pose] ?? 0;
  const head = HEAD_TILT[pose] ?? 0;
  return (
    <g transform={`rotate(${tilt} 50 130)`}>
      {/* Cola enroscada */}
      <path d="M34 120c-22 4-30-20-16-30 8-6 18 0 12 8" stroke={INK} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M34 120c-22 4-30-20-16-30 8-6 18 0 12 8" stroke={MONKEY} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Legs pose={pose} color={MONKEY} />
      {a.back}
      <ellipse cx="50" cy="106" rx="22" ry="25" fill={MONKEY} stroke={INK} strokeWidth={SW} />
      <ellipse cx="50" cy="110" rx="13" ry="15" fill={MONKEY_FACE} />
      <g transform={`rotate(${head} 50 56)`}>
        <circle cx="25" cy="56" r="10" fill={MONKEY} stroke={INK} strokeWidth={SW} />
        <circle cx="75" cy="56" r="10" fill={MONKEY} stroke={INK} strokeWidth={SW} />
        <circle cx="25" cy="56" r="5" fill={MONKEY_FACE} />
        <circle cx="75" cy="56" r="5" fill={MONKEY_FACE} />
        <circle cx="50" cy="54" r="25" fill={MONKEY} stroke={INK} strokeWidth={SW} />
        {/* Mechón */}
        <path d="M44 30q4-10 10-2 2-8 8-4" stroke={INK} strokeWidth="2.4" fill={MONKEY} strokeLinecap="round" />
        <path d="M30 56c0-14 10-16 20-10 10-6 20-4 20 10 0 16-12 20-20 20s-20-4-20-20Z" fill={MONKEY_FACE} stroke={INK} strokeWidth="1.6" />
        <Eyes l={[42, 54]} r={[58, 54]} mood={mood} />
        <path d="M47 62h6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <Mouth x={50} y={67} mood={mood === "neutral" ? "happy" : mood} />
      </g>
      {a.front}
    </g>
  );
}

// ── Goro (tanuki) y la figura encapuchada ───────────────────────────────

const TANUKI = "#7b6a58";
const TANUKI_LIGHT = "#d8c9ae";

/** Cola rayada de tanuki (también asoma bajo la capa de la figura encapuchada). */
function TanukiTail({ x = 26, y = 118 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-35)`}>
      <ellipse cx="-12" cy="0" rx="16" ry="8" fill={TANUKI} stroke={INK} strokeWidth={SW} />
      <path d="M-20 -7v14M-12 -8v16M-4 -7v14" stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Tanuki({ pose, mood }: Props) {
  const a = arms(pose, TANUKI, [26, 92], [74, 92], 9);
  const tilt = BODY_TILT[pose] ?? 0;
  const head = HEAD_TILT[pose] ?? 0;
  return (
    <g transform={`rotate(${tilt} 50 130)`}>
      <TanukiTail />
      <Legs pose={pose} color={INK} />
      {a.back}
      <ellipse cx="50" cy="104" rx="31" ry="31" fill={TANUKI} stroke={INK} strokeWidth={SW} />
      <ellipse cx="50" cy="110" rx="19" ry="20" fill={TANUKI_LIGHT} />
      <g transform={`rotate(${head} 50 56)`}>
        <path d="M24 40l2-16 12 8Z" fill={INK} />
        <path d="M76 40l-2-16-12 8Z" fill={INK} />
        <ellipse cx="50" cy="56" rx="29" ry="25" fill={TANUKI} stroke={INK} strokeWidth={SW} />
        {/* Antifaz */}
        <path d="M24 54c4-10 14-10 20-4 4-4 8-4 12 0 6-6 16-6 20 4-6 8-16 8-22 2h-8c-6 6-16 6-22-2Z" fill={INK} />
        <path d="M38 66c4-6 20-6 24 0 0 8-6 12-12 12s-12-4-12-12Z" fill={TANUKI_LIGHT} />
        <Eyes l={[36, 55]} r={[64, 55]} mood={mood} light />
        <ellipse cx="50" cy="67" rx="3.4" ry="2.4" fill={INK} />
        <Mouth x={50} y={73} mood={mood} />
      </g>
      {a.front}
      {pose === "write" && <path d="M86 112l12-20" stroke={INK} strokeWidth="3" strokeLinecap="round" />}
    </g>
  );
}

function Hooded({ pose }: Props) {
  const run = pose === "run";
  return (
    <g transform={run ? "rotate(14 50 130)" : undefined}>
      <TanukiTail x={30} y={126} />
      {run && <path d="M6 70h-16M2 88h-22M8 106h-14" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />}
      <path
        d={run ? "M50 18c22 0 30 24 30 44l14 72c-26 8-62 8-84 0l12-72c0-20 6-44 28-44Z" : "M50 18c22 0 30 24 30 44l8 74c-24 6-52 6-76 0l8-74c0-20 8-44 30-44Z"}
        fill={INK}
        stroke={INK}
        strokeWidth={SW}
      />
      <path d="M34 56c6-18 26-18 32 0-6 12-26 12-32 0Z" fill={PALETTE.ink2} />
      <circle cx="44" cy="56" r="2.6" fill={SEAL} />
      <circle cx="56" cy="56" r="2.6" fill={SEAL} />
      {run && <path d="M90 128l14 2M88 118l16-2" stroke={INK} strokeWidth="3" strokeLinecap="round" />}
    </g>
  );
}

// ── Componente público ──────────────────────────────────────────────────

export function Character({ who, pose = "idle", mood = "neutral" }: { who: CharacterId; pose?: Pose; mood?: Mood }) {
  switch (who) {
    case "bao":
      return <Panda pose={pose} mood={mood} />;
    case "cria":
      return <Panda pose={pose} mood={mood} cub />;
    case "lin":
      return <Crane pose={pose} mood={mood} />;
    case "kiko":
      return <Monkey pose={pose} mood={mood} />;
    case "goro":
      return <Tanuki pose={pose} mood={mood} />;
    case "sombra":
      return <Hooded pose={pose} mood={mood} />;
  }
}

/** Escala relativa de cada personaje (las crías son pequeñas, la grulla es alta). */
export const CHARACTER_SCALE: Record<CharacterId, number> = {
  bao: 1,
  cria: 0.62,
  lin: 1.12,
  kiko: 0.92,
  goro: 1,
  sombra: 1,
};

export const CHARACTER_NAMES: Record<CharacterId, string> = {
  bao: "Bao",
  cria: "Cría",
  lin: "Maestra Lin",
  kiko: "Kiko",
  goro: "Goro",
  sombra: "Figura encapuchada",
};
