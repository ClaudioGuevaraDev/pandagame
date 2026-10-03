import type { Metadata } from "next";
import { ProgressMap } from "@/components/map/ProgressMap";

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "El camino de 30 retos de pandas en tres niveles: Bosque de Bambú, Río de Datos y Cumbre del Maestro Panda.",
  alternates: { canonical: "/jugar" },
};

export default function JugarPage() {
  return <ProgressMap />;
}
