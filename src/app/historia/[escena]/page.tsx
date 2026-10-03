import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SCENES, getScene } from "@/content/story/scenes";
import { ComicReader } from "@/components/comic/ComicReader";

export function generateStaticParams() {
  return SCENES.map((s) => ({ escena: s.id }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/historia/[escena]">): Promise<Metadata> {
  const { escena } = await props.params;
  const scene = getScene(escena);
  if (!scene) return {};
  // Las escenas son parte de la partida (y spoilers): no se indexan.
  return { title: scene.title, robots: { index: false } };
}

export default async function SceneRoute(props: PageProps<"/historia/[escena]">) {
  const { escena } = await props.params;
  const scene = getScene(escena);
  if (!scene) notFound();
  return <ComicReader key={scene.id} scene={scene} />;
}
