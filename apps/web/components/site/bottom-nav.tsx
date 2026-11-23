"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type Tab = { key: string; href?: string; icon: string; label: string; match?: (p: string) => boolean };

const TABS: Tab[] = [
  { key: "home", href: "/", icon: "home", label: "Home", match: (p) => p === "/" },
  { key: "designers", href: "/designers", icon: "architecture", label: "Designers", match: (p) => p.startsWith("/designers") },
  { key: "shop", href: "/catalog", icon: "chair", label: "Shop", match: (p) => p.startsWith("/catalog") || p.startsWith("/product") },
  { key: "bag", icon: "shopping_bag", label: "Bag" },
  { key: "account", href: "/account", icon: "person", label: "Account", match: (p) => p.startsWith("/account") },
];

/**
 * Phone-only bottom navigation for the storefront (hidden from `md` up, where the header nav takes over).
 * Only the active tab shows its name. Pages are normal full loads (the motion scripts re-run on each), so the swipe between tabs is a
 * cross-document view transition: the active pill is a named element that morphs from the old tab to the new one (see motion.css).
 */
export function BottomNav() {
  const pathname = usePathname();
  const { cart, setOpen } = useCart();

  const inner = (t: Tab, active: boolean) => (
    <>
      <span className="relative flex items-center justify-center">
        <span className="material-symbols-outlined text-[22px] leading-none">{t.icon}</span>
        {t.key === "bag" && cart.count > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#0a0a0a] text-[#fff8f6] text-[9px] leading-4 text-center font-mono">{cart.count}</span>
        )}
      </span>
      <span
        className="overflow-hidden whitespace-nowrap font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-widest"
        style={{ maxWidth: active ? 96 : 0, marginLeft: active ? 8 : 0, opacity: active ? 1 : 0, transition: `max-width 380ms ${EASE}, margin 380ms ${EASE}, opacity 260ms ${EASE}` }}
      >
        {t.label}
      </span>
    </>
  );

  return (
    <>
      {/* spacer so the last section/footer is never hidden behind the bar */}
      <div className="md:hidden" style={{ height: "calc(4.5rem + env(safe-area-inset-bottom))", backgroundColor: "#ECDAD4" }} aria-hidden="true" />
      <nav
        aria-label="Primary"
        className="xdm-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center gap-1 px-3 pt-2 border-t border-[#e8d6d0] backdrop-blur-md"
        style={{ backgroundColor: "rgba(236, 218, 212, 0.97)", paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {TABS.map((t) => {
          const active = !!t.match?.(pathname);
          const cls = `h-12 min-w-0 rounded-full flex items-center justify-center${active ? " xdm-tab-active" : ""}`;
          const style = {
            flexGrow: active ? 2.6 : 1,
            flexBasis: 0,
            backgroundColor: active ? "#0a0a0a" : "transparent",
            color: active ? "#fff8f6" : "#78716C",
            transition: `flex-grow 380ms ${EASE}, background-color 260ms ${EASE}, color 260ms ${EASE}`,
          } as const;
          return t.href ? (
            <a key={t.key} href={t.href} aria-label={t.label} aria-current={active ? "page" : undefined} className={cls} style={style}>
              {inner(t, active)}
            </a>
          ) : (
            <button key={t.key} type="button" aria-label={`Open bag, ${cart.count} item${cart.count === 1 ? "" : "s"}`} onClick={() => setOpen(true)} className={cls} style={style}>
              {inner(t, active)}
            </button>
          );
        })}
      </nav>
    </>
  );
}
