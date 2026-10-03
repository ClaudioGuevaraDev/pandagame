"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { CLOUD_ENABLED, getSupabase } from "./client";
import { safeNext } from "./safe-next";

export type AuthStatus = "loading" | "in" | "out" | "disabled";
export type SyncStatus = "idle" | "saving" | "saved" | "error";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  sync: SyncStatus;
  /** El diálogo de registro está abierto (se puede abrir desde cualquier pantalla). */
  loginOpen: boolean;
  /** Por qué se abrió: "challenge" al empezar un reto (cambia el texto del diálogo). */
  loginReason: LoginReason;
};

export type LoginReason = "challenge" | null;

export const useAuth = create<AuthState>()(() => ({
  status: CLOUD_ENABLED ? "loading" : "disabled",
  user: null,
  sync: "idle",
  loginOpen: false,
  loginReason: null,
}));

export const openLogin = (reason: LoginReason = null) => useAuth.setState({ loginOpen: true, loginReason: reason });
export const closeLogin = () => useAuth.setState({ loginOpen: false });

let started = false;

/** Lee la sesión guardada y escucha los cambios (login, logout, renovación del token). */
export function startAuth() {
  const supabase = getSupabase();
  if (!supabase || started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => {
    useAuth.setState({ user: data.session?.user ?? null, status: data.session ? "in" : "out" });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.setState({ user: session?.user ?? null, status: session ? "in" : "out" });
  });
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) return;
  const next = safeNext(window.location.pathname + window.location.search);
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
}

/** Cierra la sesión. El progreso local se queda en este dispositivo. */
export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/** Nombre corto para mostrar (nombre de Google o el email). */
export function displayName(user: User | null): string {
  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
  return meta?.full_name ?? meta?.name ?? user?.email ?? "";
}

export function avatarUrl(user: User | null): string | null {
  const meta = user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
  return meta?.avatar_url ?? meta?.picture ?? null;
}

/**
 * El aviso de registro al empezar cada reto se puede desactivar con
 * localStorage["pandagame-login-prompt"] = "off" (lo usan los tests e2e).
 */
export function loginPromptDisabled(): boolean {
  try {
    return localStorage.getItem("pandagame-login-prompt") === "off";
  } catch {
    return false;
  }
}
