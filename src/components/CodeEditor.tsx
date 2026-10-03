"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type { BeforeMount, EditorProps, OnMount } from "@monaco-editor/react";
import { PALETTE } from "@/lib/theme";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-3" />,
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
};

const hex = (c: string) => c.replace("#", "");

// Tema "washi": papel claro con tinta, añil, musgo y bermellón.
const defineWashiTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("washi", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: hex(PALETTE.ink) },
      { token: "comment", foreground: hex(PALETTE.ink3), fontStyle: "italic" },
      { token: "keyword", foreground: hex(PALETTE.summit), fontStyle: "bold" },
      { token: "string", foreground: hex(PALETTE.bamboo) },
      { token: "number", foreground: hex(PALETTE.sealInk) },
      { token: "delimiter", foreground: hex(PALETTE.ink2) },
      { token: "identifier", foreground: hex(PALETTE.ink) },
      { token: "type", foreground: hex(PALETTE.river) },
    ],
    colors: {
      "editor.background": PALETTE.paper3,
      "editor.foreground": PALETTE.ink,
      "editorLineNumber.foreground": PALETTE.ink3,
      "editorLineNumber.activeForeground": PALETTE.ink,
      "editor.lineHighlightBackground": PALETTE.paper,
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": `${PALETTE.seal}30`,
      "editor.inactiveSelectionBackground": `${PALETTE.seal}1a`,
      "editorCursor.foreground": PALETTE.seal,
      "editorIndentGuide.background1": PALETTE.paper2,
      "editorIndentGuide.activeBackground1": PALETTE.rule,
      "editorBracketMatch.background": PALETTE.paper2,
      "editorBracketMatch.border": PALETTE.ink3,
      "editorWidget.background": PALETTE.paper3,
      "editorWidget.border": PALETTE.ink,
      "editorSuggestWidget.background": PALETTE.paper3,
      "editorSuggestWidget.border": PALETTE.ink,
      "editorSuggestWidget.selectedBackground": PALETTE.paper2,
      "scrollbarSlider.background": `${PALETTE.rule}80`,
      "scrollbarSlider.hoverBackground": PALETTE.ruleDark,
    },
  });
};

// Opciones fijas como constantes de módulo: si cambia la identidad del objeto,
// Monaco llama a updateOptions en cada render (es decir, en cada tecla).
const BASE_OPTIONS: EditorProps["options"] = {
  fontSize: 14,
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
const FULL_OPTIONS: EditorProps["options"] = { ...BASE_OPTIONS, scrollbar: { alwaysConsumeMouseWheel: true } };
const AUTO_HEIGHT_OPTIONS: EditorProps["options"] = { ...BASE_OPTIONS, scrollbar: { alwaysConsumeMouseWheel: false } };

export function CodeEditor({ value, onChange, onRun, onTest, autoHeight, ariaLabel = "Editor de código Python" }: Props) {
  // Refs para que los atajos siempre llamen a la versión más reciente de los callbacks.
  const runRef = useRef(onRun);
  const testRef = useRef(onTest);
  useEffect(() => {
    runRef.current = onRun;
    testRef.current = onTest;
  });

  const lines = value.split("\n").length;
  const options = useMemo(
    () => ({ ...(autoHeight ? AUTO_HEIGHT_OPTIONS : FULL_OPTIONS), ariaLabel }),
    [autoHeight, ariaLabel],
  );

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () =>
      testRef.current?.(),
    );
  };

  return (
    <div className="h-full w-full" style={autoHeight ? { height: Math.min(lines, 24) * 20 + 24 } : undefined}>
      <Monaco
        language="python"
        theme="washi"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={defineWashiTheme}
        onMount={handleMount}
        options={options}
      />
    </div>
  );
}
