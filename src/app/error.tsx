"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/progress/store";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const clearData = () => {
    if (!confirm("Esto borrará todo tu progreso guardado en este navegador. ¿Continuar?")) return;
    useProgress.getState().resetAll();
    window.location.replace("/");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4" role="alert">
      <div className="paper-card flex max-w-md flex-col items-center p-8 text-center">
        <p className="kicker text-seal-ink">Algo salió mal</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-ink">Se derramó la tinta</h1>
        <p className="mt-3 text-ink-2">
          Ocurrió un error inesperado. Puedes intentarlo de nuevo; si se repite, puede que los datos guardados estén
          dañados.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className="btn btn-seal px-5 py-2.5">
            <RotateCcw className="h-4 w-4" /> Reintentar
          </button>
          <Link href="/" className="btn btn-paper px-5 py-2.5">
            Inicio
          </Link>
        </div>
        <button onClick={clearData} className="mt-5 text-sm font-bold text-ink-3 underline underline-offset-4 hover:text-seal-ink">
          Borrar el progreso guardado
        </button>
      </div>
    </div>
  );
}
