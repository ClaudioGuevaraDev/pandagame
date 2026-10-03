import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LESSONS } from "@/content/tutorial";
import { TutorialNav } from "@/components/TutorialNav";

export const metadata: Metadata = { title: "Tutorial · PandaGame" };

export default function TutorialIndex() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto grid max-w-4xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div className="ink-in md:sticky md:top-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-seal">El camino del panda</p>
          <h1 className="font-display mt-3 text-5xl font-extrabold leading-[1.05] text-ink">
            Tutorial
            <br />
            de pandas
          </h1>
          <p className="mt-4 max-w-xs text-ink-2">
            {LESSONS.length} módulos, de la primera Series al nivel experto. Cada ejemplo se edita y se ejecuta aquí
            mismo.
          </p>
          {LESSONS[0] && (
            <Link href={`/tutorial/${LESSONS[0].slug}`} className="btn btn-seal mt-7 px-5 py-3">
              Empezar por el módulo 一 <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="ink-in paper-card p-3" style={{ ["--d" as string]: 2 }}>
          <TutorialNav />
        </div>
      </div>
    </div>
  );
}
