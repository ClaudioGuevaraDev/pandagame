"use client";

import { useSyncExternalStore } from "react";
import type { ChallengeTest } from "@/content/types";
import { HARNESS } from "./harness";

export type RunResult = {
  ok: boolean;
  stdout: string;
  error: string | null;
  html: string | null;
  repr: string | null;
};

export type TestResult = { name: string; passed: boolean; message: string | null };

export type TestRun = {
  error: string | null;
  results: TestResult[];
  stdout: string;
};

export type RunnerStatus = "idle" | "loading" | "ready" | "running" | "error";

const TIMEOUT_MS = 10_000;

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let seq = 0;
const pending = new Map<number, Pending>();

let status: RunnerStatus = "idle";
let loadError: string | null = null;
const listeners = new Set<() => void>();

function setStatus(s: RunnerStatus) {
  status = s;
  listeners.forEach((l) => l());
}

function post<T>(msg: Record<string, unknown>, timeout?: number): Promise<T> {
  const id = ++seq;
  return new Promise<T>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    pending.set(id, {
      resolve: (v) => {
        clearTimeout(timer);
        resolve(v as T);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    if (timeout) {
      timer = setTimeout(() => {
        pending.delete(id);
        restart();
        reject(
          new Error(
            `Tu código tardó más de ${timeout / 1000} s y se detuvo. ¿Hay un bucle infinito?`,
          ),
        );
      }, timeout);
    }
    worker!.postMessage({ ...msg, id });
  });
}

function spawn() {
  worker = new Worker("/pyodide-worker.js", { type: "module" });
  worker.onmessage = (e: MessageEvent) => {
    const { id, ok, data, error } = e.data;
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (ok) p.resolve(data);
    else p.reject(new Error(error));
  };
  worker.onerror = (e) => {
    e.preventDefault();
    const err = new Error("No se pudo cargar Python. Revisa tu conexión a internet y recarga la página.");
    for (const p of pending.values()) p.reject(err);
    pending.clear();
  };
  setStatus("loading");
  readyPromise = post<void>({ type: "init", harness: HARNESS }).then(
    () => setStatus("ready"),
    (e: Error) => {
      loadError = e.message;
      setStatus("error");
      readyPromise = null;
      throw e;
    },
  );
}

/** Termina el worker (p. ej. tras un timeout) y arranca uno nuevo. */
function restart() {
  worker?.terminate();
  for (const p of pending.values()) p.reject(new Error("Python se reinició."));
  pending.clear();
  worker = null;
  readyPromise = null;
  spawn();
}

/** Inicia la carga de Python (idempotente). */
export function ensureRunner(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!worker || !readyPromise) {
    worker?.terminate();
    spawn();
  }
  return readyPromise!;
}

async function exec<T>(msg: Record<string, unknown>): Promise<T> {
  await ensureRunner();
  setStatus("running");
  try {
    return await post<T>(msg, TIMEOUT_MS);
  } finally {
    if (status === "running") setStatus("ready");
  }
}

export function runCode(code: string, setup = ""): Promise<RunResult> {
  return exec<RunResult>({ type: "run", code, setup });
}

export function runTests(code: string, setup: string, tests: ChallengeTest[]): Promise<TestRun> {
  return exec<TestRun>({ type: "test", code, setup, tests });
}

export function useRunnerStatus(): { status: RunnerStatus; error: string | null } {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status,
    () => "idle" as RunnerStatus,
  );
  return { status: s, error: loadError };
}
