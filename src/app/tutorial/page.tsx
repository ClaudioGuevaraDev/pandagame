import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LESSONS } from "@/content/tutorial";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { TutorialNav } from "@/components/TutorialNav";

export const metadata: Metadata = {
  title: "Tutorial de pandas",
  description:
    "Tutorial de pandas en español, de cero a experto: Series, DataFrames, selección, limpieza, groupby, merge, pivot y series temporales, con ejemplos que se ejecutan en el navegador.",
  alternates: { canonical: "/tutorial" },
};

export default function TutorialIndex() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Tutorial de pandas",
          description: "De la primera Series al nivel experto, con ejemplos ejecutables.",
          inLanguage: "es",
          provider: { "@type": "Organization", name: "PandaGame" },
          hasPart: LESSONS.map((l) => ({
            "@type": "LearningResource",
            name: l.title,
            description: l.summary,
            url: absoluteUrl(`/tutorial/${l.slug}`),
          })),
        }}
      />
      <div className="mx-auto grid max-w-4xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div className="ink-in md:sticky md:top-12">
          <p className="kicker text-seal-ink">El camino del panda</p>
          <h1 className="font-display mt-3 text-5xl font-extrabold leading-[1.05] text-ink">
            Tutorial
            <br />
            de pandas
          </h1>
          <p className="mt-4 max-w-xs text-ink-2">
            Una guía del juego y {LESSONS.filter((l) => l.module > 0).length} módulos, de la primera Series al nivel experto. Cada ejemplo se edita y se ejecuta aquí
            mismo.
          </p>
          {LESSONS[0] && (
            <Link href={`/tutorial/${LESSONS[0].slug}`} className="btn btn-seal mt-7 px-5 py-3">
              Empezar por el principio <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="ink-in paper-card p-3" style={{ "--d": 2 }}>
          <TutorialNav />
        </div>
      </div>
    </div>
  );
}
