"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** true si el proyecto tiene Supabase configurado; si no, el juego funciona solo en local. */
export const CLOUD_ENABLED = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

/** Cliente de Supabase del navegador (singleton). null sin configuración o en el servidor. */
export function getSupabase(): SupabaseClient | null {
  if (!CLOUD_ENABLED || typeof window === "undefined") return null;
  client ??= createBrowserClient(URL!, KEY!);
  return client;
}
