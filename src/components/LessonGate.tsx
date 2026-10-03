"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, Map as MapIcon } from "lucide-react";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { isLessonUnlocked, lessonUnlock, unlockSource } from "@/lib/story/unlocks";

/**
 * Las lecciones se desbloquean con la historia. El contenido sigue en el HTML
 * (para buscadores y para quien llega sin JavaScript); en el juego se tapa.
 */
export function LessonGate({ slug, children }: { slug: string; children: ReactNode }) {
  const hydrated = useHasHydrated();
  const unlocked = useProgress((s) => isLessonUnlocked(slug, s.completed));
  const locked = hydrated && !unlocked;
  const u = lessonUnlock(slug);
  return (
    <>
      {locked && u && (
        <div className="paper-card ink-in mt-8 flex flex-col items-center p-8 text-center" role="status">
          <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-ink-3 text-ink-3">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="font-display mt-4 text-2xl font-extrabold text-ink">Pergamino sellado</h2>
          <p className="mt-2 max-w-md text-ink-2">
            La Maestra Lin te entregará esta lección en la historia, tras {unlockSource(u)}.
          </p>
          <Link href="/jugar" className="btn btn-seal mt-6 px-5 py-2.5">
            <MapIcon className="h-4 w-4" /> Ir al mapa
          </Link>
        </div>
      )}
      <div hidden={locked}>{children}</div>
    </>
  );
}
