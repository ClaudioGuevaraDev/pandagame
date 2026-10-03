/** Convierte markdown en texto plano corto, para meta descriptions. */
export function plainExcerpt(markdown: string, max = 155): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // bloques de código
    .replace(/^\s*\|.*\|\s*$/gm, " ") // tablas
    .replace(/`([^`]*)`/g, "$1") // código en línea
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // enlaces e imágenes
    .replace(/[*_>#~]+/g, "") // énfasis, citas, títulos
    .replace(/^\s*[-+]\s+/gm, "") // viñetas
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}
