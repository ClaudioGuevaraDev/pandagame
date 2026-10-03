"use client";

import { getSupabase } from "./client";
import { useAuth } from "./auth";

/** Una respuesta del jugador (fila de la tabla `answers`). */
export type AnswerEvent =
  | { kind: "challenge_run"; challenge_id: string; code: string; error: string | null; stdout: string }
  | {
      kind: "challenge_test";
      challenge_id: string;
      code: string;
      passed: boolean;
      tests_passed: number | null;
      tests_total: number;
      error: string | null;
      stdout: string;
      attempt: number;
    }
  | { kind: "tutorial_run"; lesson_slug: string; snippet: number; code: string; error: string | null; stdout: string }
  | { kind: "hint"; challenge_id: string; hint: number }
  | { kind: "solution"; challenge_id: string };

type Queued = AnswerEvent & { client_at: string };

export const ANSWERS_KEY = "pandagame-answers";
const MAX_QUEUE = 500;
const MAX_CODE = 20_000;
const MAX_STDOUT = 2_000;
const FLUSH_MS = 2_000;

function read(): Queued[] {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Queued[]) : [];
  } catch {
    return [];
  }
}

function write(queue: Queued[]) {
  try {
    if (queue.length) localStorage.setItem(ANSWERS_KEY, JSON.stringify(queue));
    else localStorage.removeItem(ANSWERS_KEY);
  } catch {}
}

const clip = (s: string | null | undefined, max: number) => (s && s.length > max ? s.slice(0, max) : s);

/**
 * Registra una respuesta. Se guarda primero en este navegador (así no se pierde
 * sin conexión ni lo que se hizo antes de iniciar sesión) y se sube en lotes
 * cuando hay sesión.
 */
export function track(event: AnswerEvent) {
  const e = { ...event, client_at: new Date().toISOString() } as Queued;
  if ("code" in e) e.code = clip(e.code, MAX_CODE)!;
  if ("stdout" in e) e.stdout = clip(e.stdout, MAX_STDOUT)!;
  if ("error" in e) e.error = clip(e.error, MAX_STDOUT) ?? null;
  write([...read(), e].slice(-MAX_QUEUE));
  scheduleFlush();
}

let timer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;

export function scheduleFlush(delay = FLUSH_MS) {
  clearTimeout(timer);
  timer = setTimeout(() => void flushAnswers(), delay);
}

/** Sube la cola pendiente si hay sesión; lo enviado se quita de la cola. */
export async function flushAnswers() {
  const supabase = getSupabase();
  if (!supabase || flushing || useAuth.getState().status !== "in") return;
  const batch = read();
  if (!batch.length) return;
  flushing = true;
  try {
    const { error } = await supabase.from("answers").insert(batch);
    if (error) throw error;
    // Durante la subida pudieron llegar respuestas nuevas: se quitan solo las enviadas.
    write(read().slice(batch.length));
  } catch {
    // Se reintenta en el próximo track() o al recuperar la conexión.
  } finally {
    flushing = false;
  }
}
