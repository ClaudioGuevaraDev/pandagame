"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";

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
};

export function CodeEditor({ value, onChange, onRun, onTest, autoHeight }: Props) {
  // Refs para que los atajos siempre llamen a la versión más reciente de los callbacks.
  const runRef = useRef(onRun);
  const testRef = useRef(onTest);
  useEffect(() => {
    runRef.current = onRun;
    testRef.current = onTest;
  });

  const lines = value.split("\n").length;

  // Tema "washi": papel claro con tinta, añil, musgo y bermellón.
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("washi", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "1d1b18" },
        { token: "comment", foreground: "8a7f6c", fontStyle: "italic" },
        { token: "keyword", foreground: "6a4778", fontStyle: "bold" },
        { token: "string", foreground: "4e7a36" },
        { token: "number", foreground: "c23a22" },
        { token: "delimiter", foreground: "4a443b" },
        { token: "identifier", foreground: "1d1b18" },
        { token: "type", foreground: "2c5d7c" },
      ],
      colors: {
        "editor.background": "#fbf6ea",
        "editor.foreground": "#1d1b18",
        "editorLineNumber.foreground": "#b9a881",
        "editorLineNumber.activeForeground": "#1d1b18",
        "editor.lineHighlightBackground": "#f3ead6",
        "editor.lineHighlightBorder": "#00000000",
        "editor.selectionBackground": "#c23a2230",
        "editor.inactiveSelectionBackground": "#c23a221a",
        "editorCursor.foreground": "#c23a22",
        "editorIndentGuide.background1": "#e9dcc0",
        "editorIndentGuide.activeBackground1": "#d6c7a6",
        "editorBracketMatch.background": "#e9dcc0",
        "editorBracketMatch.border": "#8a7f6c",
        "editorWidget.background": "#fbf6ea",
        "editorWidget.border": "#1d1b18",
        "editorSuggestWidget.background": "#fbf6ea",
        "editorSuggestWidget.border": "#1d1b18",
        "editorSuggestWidget.selectedBackground": "#e9dcc0",
        "scrollbarSlider.background": "#d6c7a680",
        "scrollbarSlider.hoverBackground": "#b9a881",
      },
    });
  };

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
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
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
          scrollbar: { alwaysConsumeMouseWheel: !autoHeight },
        }}
      />
    </div>
  );
}
