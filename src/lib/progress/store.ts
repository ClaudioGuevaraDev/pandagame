"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export type CompletedInfo = { at: string; attempts: number };

type ProgressState = {
  completed: Record<string, CompletedInfo>;
  /** Intentos de "Correr tests" por reto (completado o no). */
  attempts: Record<string, number>;
  code: Record<string, string>;
  tutorialRead: Record<string, boolean>;
  saveCode: (id: string, code: string) => void;
  resetCode: (id: string) => void;
  recordAttempt: (id: string, passed: boolean) => void;
  markLessonRead: (slug: string) => void;
  resetAll: () => void;
};

/**
 * localStorage tolerante a fallos: si el valor guardado está corrupto se descarta
 * (en vez de dejar la app sin hidratar) y si el almacenamiento no está disponible
 * (modo privado, cuota llena) el juego sigue funcionando sin guardar.
 */
const safeLocalStorage: StateStorage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) JSON.parse(value);
      return value;
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {}
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const initial = { completed: {}, attempts: {}, code: {}, tutorialRead: {} };

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      saveCode: (id, code) => set((s) => ({ code: { ...s.code, [id]: code } })),
      resetCode: (id) =>
        set((s) => {
          const code = { ...s.code };
          delete code[id];
          return { code };
        }),
      recordAttempt: (id, passed) =>
        set((s) => {
          const attempts = { ...s.attempts, [id]: (s.attempts[id] ?? 0) + 1 };
          if (!passed || s.completed[id]) return { attempts };
          return {
            attempts,
            completed: {
              ...s.completed,
              [id]: { at: new Date().toISOString(), attempts: attempts[id] },
            },
          };
        }),
      markLessonRead: (slug) =>
        set((s) => (s.tutorialRead[slug] ? s : { tutorialRead: { ...s.tutorialRead, [slug]: true } })),
      resetAll: () => {
        set(initial);
        // Elimina la clave de localStorage (no solo la vacía).
        useProgress.persist.clearStorage();
      },
    }),
    {
      name: "pandagame-progress",
      storage: createJSONStorage(() => safeLocalStorage),
      // v2: los retos se reescribieron; el código guardado de la v1 corresponde
      // a enunciados que ya no existen, así que se descarta (el avance se conserva).
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 2) return { ...initial, ...state, code: {} };
        return { ...initial, ...state };
      },
      partialize: ({ completed, attempts, code, tutorialRead }) => ({
        completed,
        attempts,
        code,
        tutorialRead,
      }),
    },
  ),
);

const subscribeHydration = (onChange: () => void) => useProgress.persist.onFinishHydration(onChange);
const getHydrated = () => useProgress.persist.hasHydrated();
const getServerHydrated = () => false;

/**
 * true cuando el estado ya se leyó de localStorage. En el servidor y en el primer
 * render de hidratación es false (evita desajustes); al navegar en el cliente ya es true.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, getHydrated, getServerHydrated);
}
