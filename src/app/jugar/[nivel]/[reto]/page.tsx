import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CHALLENGES, challengeHref, getChallenge, getLevel } from "@/content/challenges";
import { ChallengeView } from "@/components/ChallengeView";
import { Markdown } from "@/components/Markdown";
import { plainExcerpt } from "@/lib/text";

export function generateStaticParams() {
  return ALL_CHALLENGES.map((c) => ({ nivel: c.level, reto: String(c.number) }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/jugar/[nivel]/[reto]">): Promise<Metadata> {
  const { nivel, reto } = await props.params;
  const c = getChallenge(nivel, Number(reto));
  if (!c) return {};
  const level = getLevel(c.level);
  return {
    title: `${c.title} (${level?.difficulty ?? ""}, reto ${c.number})`,
    description: plainExcerpt(`${c.topic}: ${c.description}`),
    alternates: { canonical: challengeHref(c) },
  };
}

export default async function RetoPage(props: PageProps<"/jugar/[nivel]/[reto]">) {
  const { nivel, reto } = await props.params;
  const challenge = getChallenge(nivel, Number(reto));
  const level = challenge && getLevel(challenge.level);
  if (!challenge || !level) notFound();

  // El Markdown se renderiza aquí, en el servidor: el cliente recibe HTML ya hecho
  // y no necesita react-markdown ni highlight.js.
  return (
    <ChallengeView
      key={challenge.id}
      challenge={challenge}
      level={level}
      description={<Markdown>{challenge.description}</Markdown>}
      hints={challenge.hints.map((h, i) => (
        <Markdown key={i}>{h}</Markdown>
      ))}
    />
  );
}
