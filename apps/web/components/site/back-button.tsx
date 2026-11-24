"use client";

/** Desktop-only "Back" control for the sign-in / sign-up pages (phones use the bottom navigation instead). */
export function BackButton() {
  return (
    <div className="hidden md:block fixed top-6 left-8 z-10">
      <a
        href="/"
        aria-label="Go back"
        onClick={(e) => {
          // go back to where the visitor came from; fall back to the home page when opened directly
          if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
            e.preventDefault();
            window.history.back();
          }
        }}
        className="flex items-center gap-2 rounded-full border border-[#d8c3bc] bg-[#fff8f6] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-[#0a0a0a] shadow-sm hover:bg-white transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] leading-none">arrow_back</span>
        Back
      </a>
    </div>
  );
}
