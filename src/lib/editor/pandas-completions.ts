import type { BeforeMount } from "@monaco-editor/react";

/**
 * Autocompletado de pandas para Monaco (la "Brújula de bambú"). Solo responde en
 * los editores cuyo modelo está registrado en `enabledModels`.
 */
export const enabledModels = new Set<string>();

const PD = [
  ["DataFrame", "Crea una tabla: pd.DataFrame(datos, columns=...)"],
  ["Series", "Crea una columna con índice: pd.Series(valores, index=...)"],
  ["concat", "Apila tablas: pd.concat([a, b], ignore_index=True)"],
  ["merge", "Une dos tablas por columnas clave"],
  ["to_datetime", "Convierte texto a fechas (format=..., errors=...)"],
  ["to_numeric", "Convierte a número (errors='coerce')"],
  ["cut", "Corta valores en intervalos (bins=..., labels=...)"],
  ["qcut", "Corta en cuantiles del mismo tamaño"],
  ["crosstab", "Tabla de frecuencias cruzadas"],
  ["pivot_table", "Tabla dinámica con agregación"],
  ["melt", "De formato ancho a largo"],
  ["isna", "¿Es nulo?"],
  ["NA", "Valor nulo de pandas"],
  ["Timestamp", "Un instante de tiempo"],
  ["date_range", "Rango de fechas"],
  ["Categorical", "Categorías con orden"],
  ["MultiIndex", "Índice de varios niveles"],
] as const;

const METHODS = [
  "head", "tail", "info", "describe", "shape", "columns", "index", "dtypes", "loc", "iloc", "query", "isin",
  "between", "sort_values", "sort_index", "reset_index", "set_index", "rename", "drop", "drop_duplicates",
  "duplicated", "dropna", "fillna", "isna", "notna", "astype", "assign", "pipe", "apply", "map", "where",
  "mask", "groupby", "agg", "transform", "sum", "mean", "median", "min", "max", "count", "nunique",
  "value_counts", "unique", "size", "round", "abs", "cumsum", "pct_change", "diff", "shift", "rolling",
  "resample", "rank", "nlargest", "nsmallest", "idxmax", "idxmin", "pivot", "pivot_table", "melt", "stack",
  "unstack", "merge", "join", "explode", "copy", "to_frame", "str", "dt", "clip", "any", "all", "items",
];

const STR = [
  "lower", "upper", "title", "strip", "split", "replace", "contains", "startswith", "endswith", "len", "slice",
  "extract", "zfill", "pad", "cat", "get", "join", "count", "find",
];

const DT = [
  "year", "month", "day", "hour", "minute", "dayofweek", "day_name", "month_name", "date", "quarter",
  "days", "floor", "strftime", "normalize", "is_month_end",
];

// Tipos mínimos (monaco-editor no está como dependencia directa).
type Pos = { lineNumber: number; column: number };
type Model = {
  uri: { toString(): string };
  getLineContent(line: number): string;
  getWordUntilPosition(p: Pos): { word: string; startColumn: number; endColumn: number };
};

let registered = false;

export const registerPandasCompletions: BeforeMount = (monaco) => {
  if (registered) return;
  registered = true;
  const provider = {
    triggerCharacters: ["."],
    provideCompletionItems(model: Model, position: Pos) {
      if (!enabledModels.has(model.uri.toString())) return { suggestions: [] };
      const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const prefix = before.slice(0, before.length - word.word.length);
      const K = monaco.languages.CompletionItemKind;
      const make = (names: readonly string[], kind: number, detail: string) =>
        names.map((label) => ({ label, kind, insertText: label, range, detail }));
      if (/\bpd\.$/.test(prefix))
        return { suggestions: PD.map(([label, detail]) => ({ label, kind: K.Function, insertText: label, range, detail })) };
      if (/\.str\.$/.test(prefix)) return { suggestions: make(STR, K.Method, "Método de texto (.str)") };
      if (/\.dt\.$/.test(prefix)) return { suggestions: make(DT, K.Property, "Fecha (.dt)") };
      if (/[\w\])]\.$/.test(prefix)) return { suggestions: make(METHODS, K.Method, "pandas") };
      return { suggestions: [] };
    },
  };
  monaco.languages.registerCompletionItemProvider("python", provider);
};
