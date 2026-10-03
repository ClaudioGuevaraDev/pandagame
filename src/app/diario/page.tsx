import type { Metadata } from "next";
import { Journal } from "@/components/journal/Journal";

export const metadata: Metadata = {
  title: "Diario de Bao",
  description: "Objetos, ventajas, logros y escenas de la historia de PandaGame.",
  robots: { index: false },
};

export default function DiarioPage() {
  return <Journal />;
}
