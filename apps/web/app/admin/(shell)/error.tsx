"use client";

import { useEffect } from "react";

/** Shown inside the admin shell when a screen fails to load: keeps the sidebar and offers a way out. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("admin screen failed:", error);
  }, [error]);

  return (
    <main className="w-full px-gutter min-h-[60vh] flex items-center justify-center bg-[#F7E9E3]">
      <div role="alert" className="max-w-md w-full rounded-lg p-8 text-center space-y-4" style={{ backgroundColor: "#FBF0EC" }}>
        <span className="material-symbols-outlined text-[40px] text-[#7a1f1f]">error</span>
        <h1 className="text-xl font-semibold text-[#12100E]">This screen could not load</h1>
        <p className="text-[13px] text-[#635D5C]">
          The server did not answer correctly. Your last save is not lost. Try again, or go back to the overview.
        </p>
        {error.digest && <p className="font-mono text-[11px] text-[#635D5C]">Error id: {error.digest}</p>}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 bg-[#12100E] text-[#FAF4F0] font-label-caps text-[11px] tracking-wider uppercase rounded"
          >
            Try again
          </button>
          <a href="/admin" className="px-5 py-2.5 bg-[#ECDAD4] text-[#12100E] font-label-caps text-[11px] tracking-wider uppercase rounded">
            Back to admin
          </a>
        </div>
      </div>
    </main>
  );
}
