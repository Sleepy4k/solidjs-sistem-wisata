import { createSignal } from "solid-js";

export type ToastType = "success" | "error" | "info" | "debug";

export interface IToast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  timeout?: number; // ms
  closing?: boolean;
}

const [toasts, setToasts] = createSignal<IToast[]>([]);

// internal timer tracking for pause/resume
const timers = new Map<number, { timeoutId?: number; endAt?: number; remaining?: number }>();

export const getToasts = () => toasts();

function finalizeRemove(id: number) {
  setToasts((prev) => prev.filter((t) => t.id !== id));
  timers.delete(id);
}

export function removeToast(id: number) {
  // mark closing to allow exit animation in UI, then remove after animation
  setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
  // final removal after animation (300ms)
  window.setTimeout(() => finalizeRemove(id), 300);
}

export function pauseToast(id: number) {
  const meta = timers.get(id);
  if (!meta) return;
  if (meta.timeoutId) {
    clearTimeout(meta.timeoutId);
    meta.timeoutId = undefined;
    if (meta.endAt) {
      meta.remaining = Math.max(0, meta.endAt - Date.now());
    }
    timers.set(id, meta);
  }
}

export function resumeToast(id: number) {
  const meta = timers.get(id);
  if (!meta) return;
  const remaining = meta.remaining ?? 0;
  if (remaining > 0) {
    meta.endAt = Date.now() + remaining;
    meta.timeoutId = window.setTimeout(() => removeToast(id), remaining) as unknown as number;
    timers.set(id, meta);
  }
}

export function showToast(
  type: ToastType,
  message: string,
  title?: string,
  timeout = 4000
) {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const toast: IToast = { id, type, title, message, timeout };
  setToasts((prev) => [...prev, toast]);

  if (timeout && timeout > 0) {
    const endAt = Date.now() + timeout;
    const timeoutId = window.setTimeout(() => removeToast(id), timeout) as unknown as number;
    timers.set(id, { timeoutId, endAt, remaining: timeout });
  }

  return id;
}

export function success(message: string, title?: string, timeout?: number) {
  return showToast("success", message, title, timeout ?? 4000);
}

export function error(message: string, title?: string, timeout?: number) {
  return showToast("error", message, title, timeout ?? 4000);
}

export function info(message: string, title?: string, timeout?: number) {
  return showToast("info", message, title, timeout ?? 4000);
}

export function debug(message: string, title?: string, timeout?: number) {
  return showToast("debug", message, title, timeout ?? 4000);
}

export default {
  getToasts,
  showToast,
  removeToast,
  pauseToast,
  resumeToast,
  success,
  error,
  info,
  debug,
};
