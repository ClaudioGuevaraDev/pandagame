"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";

type Props = {
  onClose: () => void;
  /** id del título (aria-labelledby). */
  labelledBy: string;
  /** id de la descripción (aria-describedby). */
  describedBy?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Modal nativo con <dialog>.showModal(): el navegador lo pone en la capa
 * superior, vuelve inerte el resto de la página y atrapa el foco. Escape y el
 * clic en el fondo llaman a onClose; al cerrarse, el foco vuelve a donde estaba.
 */
export function Dialog({ onClose, labelledBy, describedBy, className = "", children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();

    const onCancel = (e: Event) => {
      e.preventDefault(); // cerramos nosotros, desmontando el componente
      close();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) close(); // clic en el fondo
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="paper-card ink-in m-auto w-[calc(100%-2rem)] max-w-sm p-0 text-ink"
    >
      {/* El padding va dentro: un clic sobre el propio <dialog> se trata como clic en el fondo. */}
      <div className={className}>{children}</div>
    </dialog>
  );
}
