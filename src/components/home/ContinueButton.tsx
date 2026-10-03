"use client";

import Link from "next/link";
import { BookOpenText, Play } from "lucide-react";
import { challengeHref } from "@/content/challenges";
import { sceneHref } from "@/content/story/scenes";
import { useHomeProgress } from "./useHomeProgress";

export function ContinueButton() {
  const { hydrated, started, current, currentNumber, stop } = useHomeProgress();
  const href = !stop ? "/jugar" : stop.type === "scene" ? sceneHref(stop.scene) : challengeHref(stop.challenge);
  const scene = stop?.type === "scene" ? stop.scene : null;
  return (
    <>
      <Link href={href} className="btn btn-seal w-full px-6 py-4 text-xl">
        {scene ? <BookOpenText className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        {!started ? "Jugar" : stop ? "Continuar" : "Ver mapa"}
      </Link>
      <p className="mt-2.5 h-5 truncate text-sm text-ink-3">
        {!started && scene ? "Empieza la historia de Bao" : ""}
        {started && scene ? `Historia · ${scene.title}` : ""}
        {started && !scene && current ? `Reto ${currentNumber} · ${current.title}` : ""}
        {hydrated && !current && !scene ? "Has completado todos los retos. Maestro Panda." : ""}
      </p>
    </>
  );
}
