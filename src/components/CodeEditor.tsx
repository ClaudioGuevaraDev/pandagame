"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#1e1e1e]" />,
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
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
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
          scrollbar: { alwaysConsumeMouseWheel: !autoHeight },
        }}
      />
    </div>
  );
}
