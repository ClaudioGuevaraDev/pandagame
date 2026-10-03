"use client";

import { useEffect, useRef } from "react";
import { useProgress } from "@/lib/progress/store";

/** Marca la lección como leída cuando el usuario llega al final. */
export function LessonReadMarker({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const markLessonRead = useProgress((s) => s.markLessonRead);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) markLessonRead(slug);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [slug, markLessonRead]);
  return <div ref={ref} className="h-px" />;
}
