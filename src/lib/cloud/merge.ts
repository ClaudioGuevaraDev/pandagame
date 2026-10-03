/**
 * Fusión del progreso local con el guardado en la nube. Es pura (sin imports de
 * la app) para poder probarla desde scripts/validate.mts.
 */
export type SyncedProgress = {
  completed: Record<string, { at: string; attempts: number }>;
  attempts: Record<string, number>;
  code: Record<string, string>;
  tutorialRead: Record<string, boolean>;
  scenesSeen: Record<string, boolean>;
  hintsUsed: Record<string, number>;
  journalSeen: number;
  comicAutoplay: boolean;
};

const maxRecord = (a: Record<string, number> = {}, b: Record<string, number> = {}) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

/**
 * Nada se pierde al iniciar sesión en otro dispositivo:
 * - retos completados: unión (si ambos lo tienen, gana el primero en el tiempo);
 * - intentos, pistas y diario: el máximo;
 * - lecciones y escenas: unión;
 * - código: el de este dispositivo si existe, si no el de la nube;
 * - preferencias (avance automático): las de este dispositivo.
 */
export function mergeProgress(local: SyncedProgress, remote: Partial<SyncedProgress> | null): SyncedProgress {
  if (!remote) return local;
  const completed = { ...(remote.completed ?? {}) };
  for (const [id, info] of Object.entries(local.completed)) {
    const other = completed[id];
    completed[id] = !other || info.at < other.at ? info : other;
  }
  return {
    completed,
    attempts: maxRecord(local.attempts, remote.attempts),
    code: { ...(remote.code ?? {}), ...local.code },
    tutorialRead: { ...(remote.tutorialRead ?? {}), ...local.tutorialRead },
    scenesSeen: { ...(remote.scenesSeen ?? {}), ...local.scenesSeen },
    hintsUsed: maxRecord(local.hintsUsed, remote.hintsUsed),
    journalSeen: Math.max(local.journalSeen, remote.journalSeen ?? 0),
    comicAutoplay: local.comicAutoplay,
  };
}
