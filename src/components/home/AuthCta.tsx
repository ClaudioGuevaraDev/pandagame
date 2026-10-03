"use client";

import { GoogleIcon } from "@/components/account/LoginDialog";
import { avatarUrl, displayName, openLogin, useAuth } from "@/lib/cloud/auth";

/** Registro o inicio de sesión en la portada; con sesión, un saludo. */
export function AuthCta() {
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);

  if (status === "disabled") return null;
  // Misma altura mientras se lee la sesión, para que la portada no salte.
  if (status === "loading") return <div className="h-12" aria-hidden="true" />;

  if (status === "out") {
    return (
      <button onClick={() => openLogin()} className="btn btn-paper w-full gap-2.5 px-4 py-3" aria-haspopup="dialog">
        <GoogleIcon className="h-5 w-5" /> Regístrate o inicia sesión
      </button>
    );
  }

  const name = displayName(user);
  const photo = avatarUrl(user);
  return (
    <p className="flex h-12 items-center justify-center gap-2 text-sm text-ink-2">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- avatar externo de Google, tamaño fijo
        <img src={photo} alt="" className="h-7 w-7 rounded-full border-2 border-ink" referrerPolicy="no-referrer" />
      )}
      <span className="truncate">
        Hola, <b className="text-ink">{name.split(" ")[0]}</b> · tu avance se guarda en la nube
      </span>
    </p>
  );
}
