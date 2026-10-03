import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CHALLENGES, getChallenge } from "@/content/challenges";
import { ChallengeView } from "@/components/ChallengeView";

export function generateStaticParams() {
  return ALL_CHALLENGES.map((c) => ({ nivel: c.level, reto: String(c.number) }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/jugar/[nivel]/[reto]">): Promise<Metadata> {
  const { nivel, reto } = await props.params;
  const c = getChallenge(nivel, Number(reto));
  return { title: c ? `${c.title} · PandaGame` : "PandaGame" };
}

export default async function RetoPage(props: PageProps<"/jugar/[nivel]/[reto]">) {
  const { nivel, reto } = await props.params;
  const challenge = getChallenge(nivel, Number(reto));
  if (!challenge) notFound();
  return <ChallengeView key={challenge.id} challengeId={challenge.id} />;
}
