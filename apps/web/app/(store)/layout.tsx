import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { BottomNav } from "@/components/site/bottom-nav";
import { api } from "@/lib/api";

// Storefront pages are rendered per request (SSR) from the API, so the image can be built without
// a running backend and the admin's changes show up without a rebuild. Fetches are never cached (lib/api.ts).
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // lets the phone bottom bar show "Sign in" or the signed-in profile; never breaks a page if the API is briefly down
  const me = await api.me().catch(() => null);
  return (
    <CartProvider>
      {children}
      <BottomNav user={me ? { name: me.name } : null} />
      <CartDrawer />
    </CartProvider>
  );
}
