"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { ALL_CHALLENGES } from "@/content/challenges";
import { LESSONS } from "@/content/tutorial";
import { useProgress } from "@/lib/progress/store";

const CONFIRM_WORD = "BORRAR";

export function ResetProgressDialog({ onClose }: { onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const done = useProgress((s) => Object.keys(s.completed).length);
  const saved = useProgress((s) => Object.keys(s.code).length);
  const read = useProgress((s) => Object.keys(s.tutorialRead).length);
  const resetAll = useProgress((s) => s.resetAll);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  const reset = () => {
    if (!confirmed) return;
    resetAll();
    // Recarga completa al inicio: no queda código, resultados ni estado de Python en memoria.
    window.location.replace("/");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        className="w-full max-w-sm rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <Trash2 className="h-7 w-7" />
        </div>
        <h2 id="reset-title" className="mt-4 text-center text-2xl font-black text-zinc-50">
          Borrar todo el progreso
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Se eliminarán todos los datos guardados en este navegador. No se puede deshacer.
        </p>

        <ul className="mt-5 space-y-1.5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          <li className="flex justify-between">
            <span>Retos completados</span>
            <span className="font-bold tabular-nums">
              {done}/{ALL_CHALLENGES.length}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Retos con código guardado</span>
            <span className="font-bold tabular-nums">{saved}</span>
          </li>
          <li className="flex justify-between">
            <span>Lecciones leídas</span>
            <span className="font-bold tabular-nums">
              {read}/{LESSONS.length}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Intentos y pistas</span>
            <span className="font-bold">todos</span>
          </li>
        </ul>

        <label className="mt-5 block text-sm text-zinc-400">
          Escribe <b className="font-mono text-zinc-100">{CONFIRM_WORD}</b> para confirmar
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && reset()}
            className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-zinc-100 outline-none focus:border-red-500"
            placeholder={CONFIRM_WORD}
          />
        </label>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={reset}
            disabled={!confirmed}
            className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white shadow-[0_6px_0_0_#991b1b] transition hover:bg-red-400 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_0_#991b1b]"
          >
            Borrar todo
          </button>
          <button onClick={onClose} className="rounded-2xl px-5 py-2.5 font-bold text-zinc-300 hover:bg-zinc-800">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
