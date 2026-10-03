import type { Metadata } from "next";
import { ProgressMap } from "@/components/map/ProgressMap";

export const metadata: Metadata = { title: "Mapa · PandaGame" };

export default function JugarPage() {
  return <ProgressMap />;
}
