"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Map, Trash2 } from "lucide-react";
import { ALL_CHALLENGES } from "@/content/challenges";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { Hanko, PandaLogo } from "./icons/Logos";
import { ResetProgressDialog } from "./ResetProgressDialog";

const NAV = [
  { href: "/jugar", label: "Mapa", icon: Map },
  { href: "/tutorial", label: "Tutorial", icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const done = useProgress((s) => Object.keys(s.completed).length);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-4 border-b-2 border-ink bg-paper-3/80 px-4 backdrop-blur-sm">
      <Link href="/" className="group flex items-center gap-2">
        <PandaLogo className="h-9 w-9 transition-transform group-hover:-rotate-6" />
        <span className="font-display hidden text-xl font-extrabold tracking-tight text-ink sm:inline">
          PandaGame
        </span>
      </Link>
      <nav className="ml-auto flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-colors ${
                active ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {active && (
                <svg className="absolute inset-x-2 -bottom-0.5 h-2" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 5C25 2 60 7 98 3" stroke="#c23a22" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#brush-soft)" />
                </svg>
              )}
            </Link>
          );
        })}
        <span
          className="ml-2 flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink-2"
          title="Retos completados"
        >
          <Hanko className="h-6 w-6 text-[13px]" />
          <span>
            {hydrated ? done : "–"}
            <span className="text-ink-3">/{ALL_CHALLENGES.length}</span>
          </span>
        </span>
        <button
          onClick={() => setResetOpen(true)}
          className="btn-ghost ml-1 p-2 hover:!text-seal"
          title="Borrar todo el progreso"
          aria-label="Borrar todo el progreso"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </nav>
      {resetOpen && <ResetProgressDialog onClose={() => setResetOpen(false)} />}
    </header>
  );
}
