"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type { BeforeMount, EditorProps, OnMount } from "@monaco-editor/react";
import { EDITOR_PALETTE as E } from "@/lib/theme";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-editor" />,
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  onTest?: () => void;
  /** Ajusta la altura al contenido (para snippets del tutorial). */
  autoHeight?: boolean;
  /** Etiqueta accesible del área de edición. */
  ariaLabel?: string;
  /** false: no se puede pegar ni arrastrar texto al editor (copiar sí). */
  allowPaste?: boolean;
  /** Se llama cuando se bloquea un intento de pegar o soltar texto. */
  onPasteBlocked?: () => void;
};

const hex = (c: string) => c.replace("#", "");

// Tema oscuro "piedra de tinta": fondo de tinta, texto crema y colores vivos.
const defineSumiTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("sumi", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: hex(E.fg) },
      { token: "comment", foreground: hex(E.comment), fontStyle: "italic" },
      { token: "keyword", foreground: hex(E.keyword), fontStyle: "bold" },
      { token: "string", foreground: hex(E.string) },
      { token: "number", foreground: hex(E.number) },
      { token: "delimiter", foreground: hex(E.delimiter) },
      { token: "identifier", foreground: hex(E.fg) },
      { token: "type", foreground: hex(E.type) },
    ],
    colors: {
      "editor.background": E.bg,
      "editor.foreground": E.fg,
      "editorLineNumber.foreground": E.lineNumber,
      "editorLineNumber.activeForeground": E.fg,
      "editor.lineHighlightBackground": E.lineHighlight,
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": `${E.selection}66`,
      "editor.inactiveSelectionBackground": `${E.selection}33`,
      "editorCursor.foreground": E.cursor,
      "editorIndentGuide.background1": E.border,
      "editorIndentGuide.activeBackground1": E.lineNumber,
      "editorBracketMatch.background": E.border,
      "editorBracketMatch.border": E.comment,
      "editorWidget.background": E.lineHighlight,
      "editorWidget.border": E.border,
      "editorSuggestWidget.background": E.lineHighlight,
      "editorSuggestWidget.border": E.border,
      "editorSuggestWidget.selectedBackground": E.border,
      "scrollbarSlider.background": `${E.lineNumber}66`,
      "scrollbarSlider.hoverBackground": `${E.lineNumber}aa`,
    },
  });
};

// Opciones fijas como constantes de módulo: si cambia la identidad del objeto,
// Monaco llama a updateOptions en cada render (es decir, en cada tecla).
const BASE_OPTIONS: EditorProps["options"] = {
  fontSize: 15,
  fontWeight: "500",
  lineHeight: 22,
  fontFamily: "var(--font-jetbrains), monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  lineNumbersMinChars: 3,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  fontLigatures: true,
};
// Sin menú contextual (su "Pegar" lee el portapapeles directamente) ni arrastrar/soltar.
const NO_PASTE_OPTIONS: EditorProps["options"] = {
  contextmenu: false,
  dragAndDrop: false,
  dropIntoEditor: { enabled: false },
};

export function CodeEditor({
  value,
  onChange,
  onRun,
  onTest,
  autoHeight,
  ariaLabel = "Editor de código Python",
  allowPaste = true,
  onPasteBlocked,
}: Props) {
  // Refs para que los atajos y listeners siempre usen la versión más reciente de los callbacks.
  const runRef = useRef(onRun);
  const testRef = useRef(onTest);
  const blockedRef = useRef(onPasteBlocked);
  useEffect(() => {
    runRef.current = onRun;
    testRef.current = onTest;
    blockedRef.current = onPasteBlocked;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n").length;
  const options = useMemo(
    () => ({
      ...BASE_OPTIONS,
      scrollbar: { alwaysConsumeMouseWheel: !autoHeight },
      ...(allowPaste ? {} : NO_PASTE_OPTIONS),
      ariaLabel,
    }),
    [autoHeight, ariaLabel, allowPaste],
  );

  // Bloqueo de pegar: el evento se cancela en fase de captura, antes de que llegue a Monaco.
  // Cubre Ctrl/Cmd+V, Shift+Insert y "Pegar" del menú del navegador; también soltar texto.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || allowPaste) return;
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      blockedRef.current?.();
    };
    el.addEventListener("paste", block, true);
    el.addEventListener("drop", block, true);
    return () => {
      el.removeEventListener("paste", block, true);
      el.removeEventListener("drop", block, true);
    };
  }, [allowPaste]);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () =>
      testRef.current?.(),
    );
    if (!allowPaste) {
      // Por si Monaco intenta leer el portapapeles por su cuenta con estos atajos.
      const blocked = () => blockedRef.current?.();
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, blocked);
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, blocked);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-editor"
      style={autoHeight ? { height: Math.min(lines, 24) * 22 + 24 } : undefined}
    >
      <Monaco
        language="python"
        theme="sumi"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={defineSumiTheme}
        onMount={handleMount}
        options={options}
      />
    </div>
  );
}
