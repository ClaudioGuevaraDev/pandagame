"use client";

import { Cloud } from "lucide-react";
import { openLogin, useAuth } from "@/lib/cloud/auth";
import { GoogleIcon } from "./LoginDialog";

/** Invitación a registrarse; solo se muestra sin sesión (y con la nube configurada). */
export function LoginNudge({ text, className = "" }: { text: string; className?: string }) {
  const status = useAuth((s) => s.status);
  if (status !== "out") return null;
  return (
    <div className={`flex items-center gap-3 rounded-lg border-2 border-dashed border-ink bg-[#f6d77a]/40 p-3 text-left ${className}`}>
      <Cloud className="h-6 w-6 shrink-0 text-ink" aria-hidden="true" />
      <p className="flex-1 text-sm text-ink">{text}</p>
      <button onClick={() => openLogin()} className="btn btn-paper shrink-0 gap-1.5 px-3 py-1.5 text-sm" aria-haspopup="dialog">
        <GoogleIcon className="h-4 w-4" /> Regístrate
      </button>
    </div>
  );
}
