"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { challengeHref } from "@/content/challenges";
import { useHomeProgress } from "./useHomeProgress";

export function ContinueButton() {
  const { hydrated, started, current, currentNumber } = useHomeProgress();
  return (
    <>
      <Link href={current ? challengeHref(current) : "/jugar"} className="btn btn-seal w-full px-6 py-4 text-xl">
        <Play className="h-5 w-5 fill-current" />
        {!started ? "Jugar" : current ? "Continuar" : "Ver mapa"}
      </Link>
      <p className="mt-2.5 h-5 truncate text-sm text-ink-3">
        {started && current ? `Reto ${currentNumber} · ${current.title}` : ""}
        {hydrated && !current ? "Has completado todos los retos. Maestro Panda." : ""}
      </p>
    </>
  );
}
