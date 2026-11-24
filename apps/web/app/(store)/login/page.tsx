import { redirect } from "next/navigation";
import { BackButton } from "@/components/site/back-button";
import { api } from "@/lib/api";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in — Xadboom Atelier" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // already signed in: staff go straight to the admin, collectors to their account
  if (!error) {
    const me = await api.me();
    if (me) redirect(me.role === "COLLECTOR" ? "/account" : "/admin");
  }
  const notice = error === "forbidden" ? "Your account does not have access to the atelier admin." : undefined;

  return (
    <main className="flex min-h-screen max-md:min-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] items-center justify-center bg-[#ecdad4] px-4 max-md:py-8">
      <BackButton />
      <div className="w-full max-w-sm rounded-2xl border border-[#d8c3bc] bg-[#fff8f6] p-8 shadow-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#844c38]">Xadboom Atelier</p>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Sign in</h1>
        <LoginForm next={next ?? "/admin"} notice={notice} />
      </div>
    </main>
  );
}
