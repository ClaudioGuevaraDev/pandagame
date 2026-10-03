import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LESSONS } from "@/content/tutorial";
import { TutorialNav } from "@/components/TutorialNav";

export const metadata: Metadata = { title: "Tutorial · PandaGame" };

export default function TutorialIndex() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-black text-zinc-50">Tutorial de pandas</h1>
        <p className="mt-2 text-zinc-400">
          {LESSONS.length} módulos, de cero a experto. Cada ejemplo se puede editar y ejecutar aquí mismo.
        </p>
        <div className="mt-6 rounded-2xl border border-zinc-800 p-2">
          <TutorialNav />
        </div>
        {LESSONS[0] && (
          <Link
            href={`/tutorial/${LESSONS[0].slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-emerald-950 shadow-[0_6px_0_0_#047857] hover:bg-emerald-400 active:translate-y-1 active:shadow-none"
          >
            Empezar por el módulo 1 <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
