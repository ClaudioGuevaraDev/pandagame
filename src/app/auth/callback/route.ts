import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/cloud/safe-next";

/**
 * Vuelta del login con Google: Supabase redirige aquí con un `code` (PKCE) que
 * se canjea por la sesión. La sesión queda en cookies que el cliente del
 * navegador lee; el resto del sitio sigue siendo estático.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (code && supabaseUrl && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin), 303);
  }
  return NextResponse.redirect(new URL("/?auth=error", url.origin), 303);
}
