"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ALL_CHALLENGES } from "@/content/challenges";
import { LESSONS } from "@/content/tutorial";
import { useProgress } from "@/lib/progress/store";
import { Dialog } from "./Dialog";

const CONFIRM_WORD = "BORRAR";

export function ResetProgressDialog({ onClose }: { onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const done = useProgress((s) => Object.keys(s.completed).length);
  const saved = useProgress((s) => Object.keys(s.code).length);
  const read = useProgress((s) => Object.keys(s.tutorialRead).length);
  const resetAll = useProgress((s) => s.resetAll);

  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  const reset = () => {
    if (!confirmed) return;
    resetAll();
    // Recarga completa al inicio: no queda código, resultados ni estado de Python en memoria.
    window.location.replace("/");
  };

  return (
    <Dialog onClose={onClose} labelledBy="reset-title" describedBy="reset-desc" className="p-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-seal text-seal">
        <Trash2 className="h-6 w-6" />
      </div>
      <h2 id="reset-title" className="font-display mt-4 text-center text-2xl font-extrabold text-ink">
        Borrar todo el progreso
      </h2>
      <p id="reset-desc" className="mt-1 text-center text-sm text-ink-2">
        Se eliminarán todos los datos guardados en este navegador. No se puede deshacer.
      </p>

      <ul className="mt-5 divide-y divide-rule border-y-2 border-ink text-sm text-ink-2 [&>li]:py-1.5">
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

      <label className="mt-5 block text-sm text-ink-2">
        Escribe <b className="font-mono text-seal-ink">{CONFIRM_WORD}</b> para confirmar
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && reset()}
          className="mt-1.5 w-full rounded-[6px_10px_6px_8px] border-2 border-ink bg-paper px-3 py-2 font-mono text-ink placeholder:text-ink-3"
          placeholder={CONFIRM_WORD}
          autoComplete="off"
        />
      </label>

      <div className="mt-5 flex flex-col gap-2">
        <button onClick={reset} disabled={!confirmed} className="btn btn-seal px-5 py-3">
          Borrar todo
        </button>
        <button onClick={onClose} className="btn btn-paper px-5 py-2.5">
          Cancelar
        </button>
      </div>
    </Dialog>
  );
}
