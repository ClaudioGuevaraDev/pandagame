import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LESSONS, getLesson } from "@/content/tutorial";
import { getChallengeById, challengeHref } from "@/content/challenges";
import { Markdown } from "@/components/Markdown";
import { RunnableSnippet } from "@/components/RunnableSnippet";
import { ChallengeGuide } from "@/components/ChallengeGuide";
import { TutorialNav } from "@/components/TutorialNav";
import { moduleNumeral } from "@/lib/theme";
import { LessonReadMarker } from "@/components/LessonReadMarker";
import { LessonGate } from "@/components/LessonGate";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ leccion: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/tutorial/[leccion]">): Promise<Metadata> {
  const { leccion } = await props.params;
  const lesson = getLesson(leccion);
  if (!lesson) return {};
  return {
    title: `${lesson.title} · Tutorial de pandas`,
    description: lesson.summary,
    alternates: { canonical: `/tutorial/${lesson.slug}` },
  };
}

export default async function LessonPage(props: PageProps<"/tutorial/[leccion]">) {
  const { leccion } = await props.params;
  const lesson = getLesson(leccion);
  if (!lesson) notFound();
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const related = (lesson.relatedChallenges ?? []).map(getChallengeById).filter((c) => !!c);

  return (
    <>
      <nav aria-label="Módulos del tutorial" className="hidden w-72 shrink-0 overflow-y-auto border-r-2 border-ink bg-paper-2/40 py-5 scrollbar-thin lg:block">
        <p className="kicker px-4 pb-3 text-ink-3">Módulos</p>
        <TutorialNav active={lesson.slug} />
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <article className="mx-auto max-w-3xl px-5 py-10 sm:px-10">
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: lesson.title,
              description: lesson.summary,
              inLanguage: "es",
              learningResourceType: "Tutorial",
              position: lesson.module,
              isPartOf: { "@type": "Course", name: "Tutorial de pandas", url: absoluteUrl("/tutorial") },
            }}
          />
          <header className="ink-in relative border-b-2 border-ink pb-6">
            <span
              className="font-display pointer-events-none absolute -top-4 right-0 text-[8rem] font-extrabold leading-none text-ink/[0.07]"
              aria-hidden="true"
            >
              {moduleNumeral(lesson.module)}
            </span>
            <p className="kicker text-seal-ink">{lesson.module === 0 ? "Introducción" : `Módulo ${lesson.module}`}</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              {lesson.title}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-ink-2">{lesson.summary}</p>
          </header>

          <LessonGate slug={lesson.slug}>
            <div className="mt-6">
              {lesson.blocks.map((b, i) =>
                b.type === "markdown" ? (
                  <Markdown key={i} className="my-4">
                    {b.content}
                  </Markdown>
                ) : b.type === "guide" ? (
                  <ChallengeGuide key={i} />
                ) : (
                  <RunnableSnippet
                    key={i}
                    code={b.code}
                    title={b.title}
                    preview={
                      <Markdown className="snippet-preview">{"```python\n" + b.code + "\n```"}</Markdown>
                    }
                  />
                ),
              )}
            </div>

            {related.length > 0 && (
              <div className="paper-card mt-12 p-5">
                <h2 className="font-display text-xl font-extrabold text-ink">Practica en el juego</h2>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {related.map((c) => (
                    <Link key={c.id} href={challengeHref(c)} className="btn btn-paper px-3 py-1.5 text-sm">
                      {c.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <LessonReadMarker slug={lesson.slug} />
          </LessonGate>

          <nav aria-label="Lección anterior y siguiente" className="mt-10 flex items-center justify-between gap-4 border-t border-rule pt-6">
            {prev ? (
              <Link href={`/tutorial/${prev.slug}`} className="btn-ghost px-2 py-1">
                <ArrowLeft className="h-4 w-4" /> {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/tutorial/${next.slug}`} className="btn btn-ink px-4 py-2">
                {next.title} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
