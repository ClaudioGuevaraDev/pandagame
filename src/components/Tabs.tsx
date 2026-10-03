"use client";

import { useRef, type ReactNode } from "react";

type Tab<T extends string> = { id: T; label: ReactNode };

type Props<T extends string> = {
  /** Prefijo único para los ids de pestañas y paneles. */
  idPrefix: string;
  label: string;
  tabs: readonly Tab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  tabClassName: (selected: boolean) => string;
};

export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
export const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

/** Props para el panel asociado a una pestaña. */
export function tabPanelProps(prefix: string, id: string) {
  return { role: "tabpanel", id: panelId(prefix, id), "aria-labelledby": tabId(prefix, id), tabIndex: 0 } as const;
}

/** Lista de pestañas con el patrón ARIA: roving tabindex y flechas/Inicio/Fin. */
export function Tabs<T extends string>({ idPrefix, label, tabs, value, onChange, className, tabClassName }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={className}>
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, t.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, t.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={tabClassName(selected)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
