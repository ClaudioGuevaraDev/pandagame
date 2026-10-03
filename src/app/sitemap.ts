import type { MetadataRoute } from "next";
import { ALL_CHALLENGES, challengeHref } from "@/content/challenges";
import { LESSONS } from "@/content/tutorial";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/jugar"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/tutorial"), changeFrequency: "monthly", priority: 0.9 },
    ...LESSONS.map((l) => ({
      url: absoluteUrl(`/tutorial/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...ALL_CHALLENGES.map((c) => ({
      url: absoluteUrl(challengeHref(c)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
