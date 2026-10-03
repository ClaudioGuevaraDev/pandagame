/** Rutas internas válidas para volver tras el login (evita redirecciones abiertas). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
