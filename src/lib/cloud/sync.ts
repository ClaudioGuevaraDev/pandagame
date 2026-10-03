"use client";

import { useProgress } from "@/lib/progress/store";
import { getSupabase } from "./client";
import { useAuth } from "./auth";
import { mergeProgress, type SyncedProgress } from "./merge";

const PUSH_MS = 3_000;

function snapshot(): SyncedProgress {
  const { completed, attempts, code, tutorialRead, scenesSeen, hintsUsed, journalSeen, comicAutoplay } =
    useProgress.getState();
  return { completed, attempts, code, tutorialRead, scenesSeen, hintsUsed, journalSeen, comicAutoplay };
}

let syncedUser: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let dirty = false;

async function push(userId: string) {
  const supabase = getSupabase();
  if (!supabase || syncedUser !== userId) return;
  clearTimeout(timer);
  dirty = false;
  useAuth.setState({ sync: "saving" });
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: userId, state: snapshot(), updated_at: new Date().toISOString() });
  if (error) dirty = true;
  if (syncedUser === userId) useAuth.setState({ sync: error ? "error" : dirty ? "saving" : "saved" });
}

/**
 * Al iniciar sesión: trae el progreso de la nube, lo fusiona con el local y sube
 * el resultado. Desde ahí, cada cambio del progreso se sube con un pequeño retraso.
 */
export async function startSync(userId: string) {
  const supabase = getSupabase();
  if (!supabase || syncedUser === userId) return;
  syncedUser = null;
  useAuth.setState({ sync: "saving" });
  const { data, error } = await supabase.from("progress").select("state").eq("user_id", userId).maybeSingle();
  if (error) {
    useAuth.setState({ sync: "error" });
    return;
  }
  useProgress.setState(mergeProgress(snapshot(), (data?.state as Partial<SyncedProgress> | undefined) ?? null));
  syncedUser = userId;
  await push(userId);
}

export function stopSync() {
  syncedUser = null;
  clearTimeout(timer);
  useAuth.setState({ sync: "idle" });
}

/** Programa la subida tras un cambio del progreso local. */
export function schedulePush() {
  const userId = syncedUser;
  if (!userId) return;
  dirty = true;
  useAuth.setState({ sync: "saving" });
  clearTimeout(timer);
  timer = setTimeout(() => void push(userId), PUSH_MS);
}

/** Al cerrar la pestaña, sube lo pendiente sin esperar al retraso. */
export function flushPush() {
  if (syncedUser && dirty) void push(syncedUser);
}

/** Sube el progreso ya (por ejemplo, antes de recargar la página tras borrar los datos). */
export async function pushNow() {
  if (syncedUser) await push(syncedUser);
}
