import { PALETTE } from "./theme.ts";

/** Panda a tinta como SVG plano (sin filtros), para íconos e imágenes generadas. */
export function pandaSvg({ background }: { background?: string } = {}): string {
  const { ink, paper3, seal } = PALETTE;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${
    background ? `<rect width="64" height="64" rx="14" fill="${background}"/>` : ""
  }<ellipse cx="15" cy="15" rx="9.5" ry="9" fill="${ink}"/><ellipse cx="49" cy="15" rx="9.5" ry="9" fill="${ink}"/><path d="M32 10c14 0 25 9.5 25 23.5S46.5 58 32 58 7 47.5 7 33.5 18 10 32 10Z" fill="${paper3}" stroke="${ink}" stroke-width="2.6"/><path d="M17 29c3-6 10-6 11 0s-3 11-7 10-6-5-4-10Z" fill="${ink}"/><path d="M47 29c-3-6-10-6-11 0s3 11 7 10 6-5 4-10Z" fill="${ink}"/><circle cx="23" cy="31.5" r="2.4" fill="${paper3}"/><circle cx="41" cy="31.5" r="2.4" fill="${paper3}"/><path d="M28.5 41.5c1.5-2 5.5-2 7 0-1 2.2-6 2.2-7 0Z" fill="${ink}"/><path d="M27 47c2.5 2.6 7.5 2.6 10 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="16.5" cy="41" r="3" fill="${seal}" opacity="0.35"/><circle cx="47.5" cy="41" r="3" fill="${seal}" opacity="0.35"/></svg>`;
}

export const pandaDataUri = (opts?: { background?: string }) =>
  `data:image/svg+xml;base64,${Buffer.from(pandaSvg(opts)).toString("base64")}`;
