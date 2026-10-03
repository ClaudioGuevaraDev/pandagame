import Link from "next/link";
import { BookOpen, Map as MapIcon } from "lucide-react";
import { Enso, Hanko, PandaLogo } from "@/components/icons/Logos";
import { ContinueButton } from "@/components/home/ContinueButton";
import { HomeProgress } from "@/components/home/HomeProgress";

export default function Home() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      {/* Manchas de tinta difusas */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-ink/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-seal/[0.08] blur-3xl" />
      {/* Caligrafía vertical decorativa */}
      <p
        className="font-display pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-7xl font-extrabold leading-none text-ink/[0.07] lg:block"
        style={{ writingMode: "vertical-rl" }}
        aria-hidden="true"
      >
        熊猫の道
      </p>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="ink-in relative grid h-48 w-48 place-items-center" style={{ "--d": 0 }}>
          <Enso animated className="absolute inset-0 h-full w-full" />
          <PandaLogo className="animate-float relative h-28 w-28" />
          <Hanko char="熊" className="stamp-in absolute bottom-5 right-3 h-9 w-9 text-lg [animation-delay:1.3s]" />
        </div>

        <h1 className="ink-in font-display mt-3 text-6xl font-extrabold tracking-tight text-ink" style={{ "--d": 2 }}>
          PandaGame
        </h1>
        <div className="ink-in mt-2 flex items-center gap-3 text-ink-2" style={{ "--d": 3 }}>
          <span className="h-px w-8 bg-ink-3" />
          <p>Aprende pandas resolviendo un misterio.</p>
          <span className="h-px w-8 bg-ink-3" />
        </div>

        <div className="ink-in mt-9 w-full" style={{ "--d": 4 }}>
          <ContinueButton />
        </div>

        <div className="ink-in mt-3 grid w-full grid-cols-2 gap-3" style={{ "--d": 5 }}>
          <Link href="/jugar" className="btn btn-paper px-4 py-3">
            <MapIcon className="h-4 w-4" /> Mapa
          </Link>
          <Link href="/tutorial" className="btn btn-paper px-4 py-3">
            <BookOpen className="h-4 w-4" /> Tutorial
          </Link>
        </div>

        <HomeProgress />
      </div>
    </div>
  );
}
