"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LINKS = [
  { href: "/catalog", label: "Shop", key: "shop" },
  { href: "/designers", label: "Designers", key: "designers" },
  { href: "/#about", label: "Journal", key: "journal" },
  { href: "/contact", label: "Contact", key: "contact" },
  { href: "/account", label: "Account", key: "account" },
];

/** Hamburger + dropdown panel for the storefront header. Only rendered below `lg` (the desktop nav takes over from there). */
export function MobileMenu({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="hidden md:block lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center text-[#0a0a0a] hover:opacity-70 transition-opacity"
      >
        <span className="material-symbols-outlined text-[24px]">{open ? "close" : "menu"}</span>
      </button>
      {open &&
        createPortal(
        <>
          <div className="fixed inset-x-0 top-20 bottom-0 bg-black/30 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav
            id="mobile-menu"
            aria-label="Main"
            className="fixed inset-x-0 top-20 z-50 border-b border-[#e8d6d0] shadow-lg max-h-[calc(100dvh-5rem)] overflow-y-auto"
            style={{ backgroundColor: "#ECDAD4" }}
          >
            <ul className="px-6 md:px-12 py-2">
              {LINKS.map((l) => (
                <li key={l.key} className="border-b border-[#e8d6d0] last:border-b-0">
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active === l.key ? "page" : undefined}
                    className={`flex items-center justify-between min-h-12 py-3 font-['Space_Grotesk'] text-sm uppercase tracking-widest ${
                      active === l.key ? "text-[#0a0a0a] font-bold" : "text-[#78716C]"
                    }`}
                  >
                    {l.label}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>,
        document.body)}
    </div>
  );
}
