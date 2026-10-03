"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Play } from "lucide-react";
import { SCENES, sceneHref } from "@/content/story/scenes";
import { UNLOCK_ICONS } from "@/content/story/icons";
import type { Unlock } from "@/content/story/types";
import { Tabs, tabPanelProps } from "@/components/Tabs";
import { Hanko, PandaLogo } from "@/components/icons/Logos";
import { useHasHydrated, useProgress } from "@/lib/progress/store";
import { challengeNumber } from "@/lib/progress/unlock";
import { ACHIEVEMENTS, COLLECTIBLES, isSceneUnlocked, isUnlocked, ownedCollectibles, unlockSource } from "@/lib/story/unlocks";

type Tab = "objetos" | "logros" | "escenas";

const EMPTY: Record<string, never> = {};

const KIND_LABEL: Record<Unlock["kind"], string> = {
  hints: "Pergamino de pistas",
  perk: "Ventaja",
  lesson: "Lección",
  item: "Objeto de la historia",
};

export function Journal() {
  const hydrated = useHasHydrated();
  const state = useProgress();
  const completed = hydrated ? state.completed : EMPTY;
  const [tab, setTab] = useState<Tab>("objetos");

  // Al abrir el Diario, las recompensas nuevas dejan de marcarse como nuevas.
  const ownedCount = hydrated ? ownedCollectibles(completed) : 0;
  const markJournalSeen = state.markJournalSeen;
  useEffect(() => {
    if (hydrated) markJournalSeen(ownedCount);
  }, [hydrated, ownedCount, markJournalSeen]);

  const snapshot = {
    completed: hydrated ? state.completed : {},
    scenesSeen: hydrated ? state.scenesSeen : {},
    hintsUsed: hydrated ? state.hintsUsed : {},
    tutorialRead: hydrated ? state.tutorialRead : {},
  };
  const items = COLLECTIBLES.filter((u) => isUnlocked(u, completed)).length;
  const achieved = ACHIEVEMENTS.filter((a) => a.check(snapshot)).length;
  const seen = SCENES.filter((s) => snapshot.scenesSeen[s.id]).length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="ink-in flex items-center gap-4">
          <PandaLogo className="h-16 w-16 shrink-0" />
          <div>
            <p className="kicker text-seal-ink">Cuaderno de investigación</p>
            <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">Diario de Bao</h1>
          </div>
        </header>

        <Tabs
          idPrefix="diario"
          label="Secciones del diario"
          tabs={[
            { id: "objetos", label: `Objetos ${items}/${COLLECTIBLES.length}` },
            { id: "logros", label: `Logros ${achieved}/${ACHIEVEMENTS.length}` },
            { id: "escenas", label: `Escenas ${seen}/${SCENES.length}` },
          ]}
          value={tab}
          onChange={setTab}
          className="mt-8 flex gap-1 overflow-x-auto border-b-2 border-ink"
          tabClassName={(selected) =>
            `-mb-0.5 whitespace-nowrap border-2 border-b-0 px-4 py-2 text-sm font-bold tabular-nums transition-colors ${
              selected ? "border-ink bg-paper-3 text-ink" : "border-transparent text-ink-3 hover:text-ink"
            }`
          }
        />

        <div {...tabPanelProps("diario", "objetos")} hidden={tab !== "objetos"} className="pt-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {COLLECTIBLES.map((u) => {
              const owned = hydrated && isUnlocked(u, completed);
              const Icon = UNLOCK_ICONS[u.icon];
              return (
                <li
                  key={u.id}
                  className={owned ? "paper-card flex items-start gap-3 p-4" : "flex items-start gap-3 rounded-lg border-2 border-dashed border-rule bg-paper-2/40 p-4"}
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 ${
                      owned ? "border-ink bg-[#f6d77a] text-ink" : "border-dashed border-ink-3 bg-paper-2 text-ink-3"
                    }`}
                  >
                    {owned ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="kicker text-ink-3">{KIND_LABEL[u.kind]}</p>
                    <p className="font-display text-lg font-extrabold leading-tight text-ink">{owned ? u.name : "???"}</p>
                    <p className="mt-0.5 text-sm text-ink-2">
                      {owned ? u.description : `Se obtiene tras ${unlockSource(u)}.`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div {...tabPanelProps("diario", "logros")} hidden={tab !== "logros"} className="pt-6">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ACHIEVEMENTS.map((a) => {
              const done = hydrated && a.check(snapshot);
              return (
                <li
                  key={a.id}
                  className={`flex flex-col items-center p-4 text-center ${done ? "paper-card" : "rounded-lg border-2 border-dashed border-rule bg-paper-2/40"}`}
                >
                  {done ? (
                    <Hanko char={a.char} className="h-14 w-14 rotate-[-6deg] text-2xl" />
                  ) : (
                    <span className="font-display grid h-14 w-14 place-items-center rounded-md border-2 border-dashed border-ink-3 text-2xl text-ink-3">
                      {a.char}
                    </span>
                  )}
                  <p className="font-display mt-3 font-extrabold leading-tight text-ink">{a.name}</p>
                  <p className="mt-1 text-xs text-ink-2">{a.description}</p>
                  <span className="sr-only">{done ? "(conseguido)" : "(pendiente)"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div {...tabPanelProps("diario", "escenas")} hidden={tab !== "escenas"} className="pt-6">
          <ol className="grid gap-2 sm:grid-cols-2">
            {SCENES.map((s) => {
              const n = s.after ? challengeNumber(s.after) : 0;
              const label = n === 0 ? "Prólogo" : `Capítulo ${n}`;
              const open = hydrated && isSceneUnlocked(s, completed);
              const isNew = open && !snapshot.scenesSeen[s.id];
              return (
                <li key={s.id}>
                  {open ? (
                    <Link
                      href={sceneHref(s)}
                      className="group flex items-center gap-3 border-l-[3px] border-ink bg-paper-3/70 px-3 py-2 hover:bg-paper-3"
                    >
                      <span className="kicker w-24 shrink-0 text-ink-3">{label}</span>
                      <span className="flex-1 truncate font-bold text-ink">{s.title}</span>
                      {isNew && <span className="tag text-seal-ink">Nueva</span>}
                      <Play className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-ink" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 border-l-[3px] border-rule px-3 py-2 text-ink-3">
                      <span className="kicker w-24 shrink-0">{label}</span>
                      <span className="flex-1">???</span>
                      <Lock className="h-4 w-4 shrink-0" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
