"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      version: 1,
      partialize: ({ completed, attempts, code, tutorialRead }) => ({
        completed,
        attempts,
        code,
        tutorialRead,
      }),
    },
  ),
);

/** true cuando el estado ya se leyó de localStorage (evita desajustes de hidratación). */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const done = () => setHydrated(true);
    const unsub = useProgress.persist.onFinishHydration(done);
    if (useProgress.persist.hasHydrated()) done();
    return unsub;
  }, []);
  return hydrated;
}
