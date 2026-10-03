import type { Metadata } from "next";
import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { Enso, PandaLogo } from "@/components/icons/Logos";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="relative grid h-36 w-36 place-items-center">
          <Enso className="absolute inset-0 h-full w-full opacity-60" />
          <PandaLogo className="relative h-20 w-20" />
        </div>
        <p className="kicker mt-4 text-seal-ink">Error 404</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold text-ink">Este sendero no existe</h1>
        <p className="mt-3 text-ink-2">El panda buscó por todo el bosque y no encontró esta página.</p>
        <div className="mt-7 flex gap-3">
          <Link href="/jugar" className="btn btn-seal px-5 py-2.5">
            <MapIcon className="h-4 w-4" /> Ir al mapa
          </Link>
          <Link href="/" className="btn btn-paper px-5 py-2.5">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
