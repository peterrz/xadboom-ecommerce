"use client";
import { useEffect, useState } from "react";

type Kind = "error" | "success";
type Item = { id: number; kind: Kind; text: string };
const EVENT = "admin-toast";

function emit(kind: Kind, text: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: { kind, text } }));
}

/** Show a message from anywhere in the admin (client components). */
export const toast = {
  error: (text: string) => emit("error", text),
  success: (text: string) => emit("success", text),
};

const label = (path: string) => path.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/** Turn an API error body ({ message, issues: [{ path, message }] }) into one readable sentence. */
export function apiErrorMessage(json: unknown, fallback = "Something went wrong. Please try again."): string {
  const j = json as { message?: string; issues?: { path?: string; message?: string }[] } | null;
  if (j?.issues?.length) return j.issues.map((i) => (i.path ? `${label(i.path)}: ${i.message}` : i.message)).join("\n");
  if (j?.message === "Unauthorized") return "Your session has expired. Please sign in again.";
  if (j?.message === "Forbidden resource") return "You do not have permission to do this.";
  return j?.message ?? fallback;
}

export function Spinner() {
  return <span aria-hidden className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />;
}

/** Mounted once in the admin shell. */
export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const { kind, text } = (e as CustomEvent<{ kind: Kind; text: string }>).detail;
      const id = ++n;
      setItems((s) => [...s.slice(-3), { id, kind, text }]);
      setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), kind === "error" ? 8000 : 3500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div aria-live="polite" className="fixed top-20 right-6 z-[100] flex flex-col gap-2 w-[min(92vw,380px)]">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-[13px] whitespace-pre-line ${t.kind === "error" ? "bg-[#7a1f1f] text-white" : "bg-[#12100E] text-[#FAF4F0]"}`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">{t.kind === "error" ? "error" : "check_circle"}</span>
          <span className="flex-1">{t.text}</span>
          <button type="button" aria-label="Dismiss" className="opacity-70 hover:opacity-100" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
