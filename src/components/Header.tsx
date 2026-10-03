"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Map as MapIcon, Trash2 } from "lucide-react";
import { ALL_CHALLENGES } from "@/content/challenges";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { Hanko, PandaLogo } from "./icons/Logos";
import { ResetProgressDialog } from "./ResetProgressDialog";

const NAV = [
  { href: "/jugar", label: "Mapa", icon: MapIcon },
  { href: "/tutorial", label: "Tutorial", icon: BookOpen },
] as const;

export function Header() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const done = useProgress((s) => Object.keys(s.completed).length);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-4 border-b-2 border-ink bg-paper-3/80 px-4 backdrop-blur-sm">
      <Link href="/" className="group flex items-center gap-2" aria-label="PandaGame, inicio">
        <PandaLogo className="h-9 w-9 transition-transform motion-safe:group-hover:-rotate-6" />
        <span className="font-display hidden text-xl font-extrabold tracking-tight text-ink sm:inline" aria-hidden="true">
          PandaGame
        </span>
      </Link>
      <nav aria-label="Principal" className="ml-auto flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center px-3 py-1.5 text-sm font-bold transition-colors ${
                active ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {/* El trazo se ancla al contenido (ícono + palabra), no al padding del enlace. */}
              <span className="relative inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">{label}</span>
                {active && (
                  <svg
                    className="absolute inset-x-0 -bottom-1.5 h-1.5 w-full"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M6 5C28 2 60 7 94 3" className="stroke-seal" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#brush-soft)" />
                  </svg>
                )}
              </span>
            </Link>
          );
        })}
        <span className="ml-2 flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink-2">
          <Hanko className="h-6 w-6 text-[13px]" />
          <span className="sr-only">Retos completados:</span>
          <span>
            {hydrated ? done : "–"}
            <span className="text-ink-3">/{ALL_CHALLENGES.length}</span>
          </span>
        </span>
        <button
          onClick={() => setResetOpen(true)}
          className="btn-ghost ml-1 p-2 hover:text-seal"
          title="Borrar todo el progreso"
          aria-label="Borrar todo el progreso"
          aria-haspopup="dialog"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </nav>
      {resetOpen && <ResetProgressDialog onClose={() => setResetOpen(false)} />}
    </header>
  );
}
