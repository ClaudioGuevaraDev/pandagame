"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CloudOff, Cloud, LogOut } from "lucide-react";
import { avatarUrl, displayName, openLogin, signOut, useAuth } from "@/lib/cloud/auth";
import { GoogleIcon } from "./LoginDialog";

const SYNC_LABEL = { idle: "Conectado", saving: "Guardando…", saved: "Progreso guardado", error: "Sin conexión con la nube" } as const;

/** Botón de cuenta del header: «Guardar avance» sin sesión, avatar con menú con sesión. */
export function AccountButton() {
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const sync = useAuth((s) => s.sync);
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  if (status === "disabled" || status === "loading") return null;

  if (status === "out") {
    return (
      <button
        onClick={openLogin}
        className="btn btn-paper ml-1 gap-1.5 px-2.5 py-1 text-sm"
        aria-haspopup="dialog"
        title="Guarda tu avance con Google"
      >
        <GoogleIcon className="h-4 w-4" />
        <span className="sr-only md:not-sr-only">Guardar avance</span>
      </button>
    );
  }

  const name = displayName(user);
  const photo = avatarUrl(user);
  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setMenu((m) => !m)}
        className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full border-2 border-ink bg-[#f6d77a] font-bold text-ink"
        aria-expanded={menu}
        aria-label={`Cuenta de ${name}`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar externo de Google, tamaño fijo
          <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </button>
      {menu && (
        <div className="paper-card absolute right-0 top-10 z-40 w-64 p-3 text-sm">
          <p className="truncate font-bold text-ink">{name}</p>
          {user?.email && name !== user.email && <p className="truncate text-xs text-ink-3">{user.email}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-ink-2" role="status">
            {sync === "error" ? (
              <CloudOff className="h-4 w-4 text-seal" />
            ) : sync === "saved" ? (
              <Check className="h-4 w-4 text-bamboo-ink" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            {SYNC_LABEL[sync]}
          </p>
          <button
            onClick={() => {
              setMenu(false);
              void signOut();
            }}
            className="btn btn-paper mt-3 w-full gap-2 px-3 py-1.5"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
          <p className="mt-2 text-xs text-ink-3">Tu progreso seguirá en este dispositivo.</p>
        </div>
      )}
    </div>
  );
}
