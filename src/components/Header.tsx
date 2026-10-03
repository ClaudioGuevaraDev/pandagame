"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Map } from "lucide-react";
import { ALL_CHALLENGES } from "@/content/challenges";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { PandaLogo } from "./icons/Logos";

const NAV = [
  { href: "/jugar", label: "Mapa", icon: Map },
  { href: "/tutorial", label: "Tutorial", icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const done = useProgress((s) => Object.keys(s.completed).length);

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800/80 bg-[#0b0d12]/90 px-4">
      <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-zinc-50">
        <PandaLogo className="h-8 w-8" />
        <span className="hidden sm:inline">PandaGame</span>
      </Link>
      <nav className="ml-auto flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                active ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <span
          className="ml-2 rounded-xl border border-zinc-800 px-2.5 py-1 text-xs font-bold tabular-nums text-zinc-400"
          title="Retos completados"
        >
          🎋 {hydrated ? done : "–"}/{ALL_CHALLENGES.length}
        </span>
      </nav>
    </header>
  );
}
