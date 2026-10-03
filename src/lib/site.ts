/**
 * URL pública del sitio (para metadatos, sitemap y datos estructurados).
 * Se configura con NEXT_PUBLIC_SITE_URL al desplegar.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
