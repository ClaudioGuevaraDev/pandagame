import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LESSONS, getLesson } from "@/content/tutorial";
import { getChallengeById, challengeHref } from "@/content/challenges";
import { Markdown } from "@/components/Markdown";
import { RunnableSnippet } from "@/components/RunnableSnippet";
import { TutorialNav } from "@/components/TutorialNav";
import { KANJI_NUMERALS } from "@/lib/theme";
import { LessonReadMarker } from "@/components/LessonReadMarker";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ leccion: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/tutorial/[leccion]">): Promise<Metadata> {
  const { leccion } = await props.params;
  return { title: `${getLesson(leccion)?.title ?? "Tutorial"} · PandaGame` };
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
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r-2 border-ink bg-paper-2/40 py-5 scrollbar-thin lg:block">
        <p className="px-4 pb-3 text-[11px] font-black uppercase tracking-[0.3em] text-ink-3">Módulos</p>
        <TutorialNav active={lesson.slug} />
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <article className="mx-auto max-w-3xl px-5 py-10 sm:px-10">
          <header className="ink-in relative border-b-2 border-ink pb-6">
            <span
              className="font-display pointer-events-none absolute -top-4 right-0 text-[8rem] font-extrabold leading-none text-ink/[0.07]"
              aria-hidden="true"
            >
              {KANJI_NUMERALS[lesson.module - 1]}
            </span>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-seal">Módulo {lesson.module}</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              {lesson.title}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-ink-2">{lesson.summary}</p>
          </header>

          <div className="mt-6">
            {lesson.blocks.map((b, i) =>
              b.type === "markdown" ? (
                <Markdown key={i} className="my-4">
                  {b.content}
                </Markdown>
              ) : (
                <RunnableSnippet key={i} code={b.code} title={b.title} />
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

          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-rule pt-6">
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
