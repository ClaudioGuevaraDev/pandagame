"use client";

import { useId } from "react";
import { PALETTE } from "@/lib/theme";
import { useHomeProgress } from "./useHomeProgress";

/** Barra de progreso con forma de pincelada. */
export function HomeProgress() {
  const { started, done, total } = useHomeProgress();
  const clipId = useId();
  const pct = (done / Math.max(total, 1)) * 100;

  return (
    <div
      className={`mt-9 w-full transition-opacity duration-500 ${started ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!started}
    >
      <div className="kicker mb-1.5 flex justify-between text-ink-3">
        <span id={`${clipId}-label`}>Camino</span>
        <span className="tabular-nums">
          {done}/{total}
        </span>
      </div>
      <svg
        viewBox="0 0 300 14"
        className="h-3.5 w-full"
        preserveAspectRatio="none"
        role="progressbar"
        aria-labelledby={`${clipId}-label`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <path d="M3 7C80 5 200 9 297 6" stroke={PALETTE.rule} strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#brush-soft)" />
        <clipPath id={clipId}>
          <rect x="0" y="0" width={(pct / 100) * 300} height="14" />
        </clipPath>
        {started && (
          <g clipPath={`url(#${clipId})`}>
            <g className="brush-fill">
              <path d="M3 7C80 5 200 9 297 6" stroke={PALETTE.ink} strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#brush-soft)" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
