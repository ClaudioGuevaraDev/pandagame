import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LESSONS, getLesson } from "@/content/tutorial";
import { getChallengeById, challengeHref } from "@/content/challenges";
import { Markdown } from "@/components/Markdown";
import { RunnableSnippet } from "@/components/RunnableSnippet";
import { TutorialNav } from "@/components/TutorialNav";
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
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-zinc-800 p-3 scrollbar-thin lg:block">
        <p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-widest text-zinc-500">Módulos</p>
        <TutorialNav active={lesson.slug} />
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <article className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Módulo {lesson.module}</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-50">{lesson.title}</h1>
          <p className="mt-2 text-lg text-zinc-400">{lesson.summary}</p>

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
            <div className="mt-10 rounded-2xl border border-zinc-800 p-4">
              <h2 className="font-black text-zinc-100">Practica en el juego</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {related.map((c) => (
                  <Link
                    key={c.id}
                    href={challengeHref(c)}
                    className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-800"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <LessonReadMarker slug={lesson.slug} />

          <nav className="mt-8 flex justify-between gap-4 border-t border-zinc-800 pt-6">
            {prev ? (
              <Link href={`/tutorial/${prev.slug}`} className="flex items-center gap-2 font-bold text-zinc-400 hover:text-zinc-100">
                <ArrowLeft className="h-4 w-4" /> {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/tutorial/${next.slug}`}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-black text-emerald-950 hover:bg-emerald-400"
              >
                {next.title} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
