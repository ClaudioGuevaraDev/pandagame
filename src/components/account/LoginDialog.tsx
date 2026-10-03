"use client";

import { useState } from "react";
import { Cloud } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { PandaLogo } from "@/components/icons/Logos";
import { closeLogin, signInWithGoogle, useAuth } from "@/lib/cloud/auth";

export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Diálogo para guardar el avance con Google. Se abre con openLogin() desde cualquier pantalla. */
export function LoginDialog() {
  const open = useAuth((s) => s.loginOpen);
  const [going, setGoing] = useState(false);
  if (!open) return null;

  const go = async () => {
    setGoing(true);
    try {
      await signInWithGoogle(); // el navegador sale hacia Google
    } catch {
      setGoing(false);
    }
  };

  return (
    <Dialog onClose={closeLogin} labelledBy="login-title" describedBy="login-desc" className="p-7 text-center">
      <div className="relative mx-auto h-20 w-20">
        <PandaLogo className="h-20 w-20" />
        <span className="absolute -bottom-1 -right-2 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-[#f6d77a] text-ink">
          <Cloud className="h-5 w-5" />
        </span>
      </div>
      <h2 id="login-title" className="font-display mt-4 text-2xl font-extrabold text-ink">
        Guarda tu avance
      </h2>
      <p id="login-desc" className="mt-2 text-ink-2">
        Entra con Google y Bao recordará tus retos, escenas y recompensas en cualquier dispositivo.
      </p>
      <ul className="mt-4 space-y-1 text-left text-sm text-ink-2">
        <li>✓ No pierdes nada si borras el navegador</li>
        <li>✓ Sigues donde lo dejaste en otro equipo</li>
        <li>✓ Lo que ya hiciste se guarda también</li>
      </ul>
      <div className="mt-6 flex flex-col gap-2">
        <button onClick={go} disabled={going} className="btn btn-paper gap-3 px-5 py-3">
          <GoogleIcon /> {going ? "Abriendo Google…" : "Continuar con Google"}
        </button>
        <button onClick={closeLogin} className="mt-1 text-sm font-bold text-ink-3 hover:text-ink">
          Ahora no
        </button>
      </div>
      <p className="mt-4 text-xs text-ink-3">
        Guardamos tu progreso y tus respuestas (el código que ejecutas) para mejorar el juego.
      </p>
    </Dialog>
  );
}
