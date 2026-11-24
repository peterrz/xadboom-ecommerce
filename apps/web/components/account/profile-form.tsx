"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

const field =
  "w-full rounded-lg border border-[#d8c3bc] bg-[#fff8f6] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#0a0a0a]";
const label = "mb-1 block font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#7a6e69]";

/** "My details": name, phone, studio and the saved delivery address that checkout pre-fills. */
export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, setState] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: "saving" });
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? "");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: text("name"), phone: text("phone"), studio: text("studio"), country: text("country"), city: text("city"), address: text("address") }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) return setState({ kind: "error", message: json?.issues?.[0] ? `${json.issues[0].path}: ${json.issues[0].message}` : (json?.message ?? "Could not save your details.") });
      setState({ kind: "saved" });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Try again." });
    }
  }

  return (
    <section className="mb-10 rounded-2xl border border-[#e2cecb] bg-[#fff1ec] p-6 md:p-8" aria-labelledby="my-details">
      <h2 id="my-details" className="mb-1 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest">
        My details
      </h2>
      <p className="mb-6 text-sm text-[#7a6e69]">Saved here once and filled in for you at every checkout.</p>
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" onChange={() => state.kind !== "idle" && setState({ kind: "idle" })}>
        <div>
          <label className={label} htmlFor="pf-name">Full name</label>
          <input id="pf-name" name="name" defaultValue={profile.name} required maxLength={160} autoComplete="name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="pf-email">Email</label>
          <input id="pf-email" value={profile.email} readOnly disabled className={`${field} opacity-60`} aria-describedby="pf-email-note" />
          <p id="pf-email-note" className="mt-1 text-[11px] text-[#7a6e69]">Your sign-in email cannot be changed here.</p>
        </div>
        <div>
          <label className={label} htmlFor="pf-phone">Telephone</label>
          <input id="pf-phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} maxLength={40} autoComplete="tel" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="pf-studio">Studio / practice</label>
          <input id="pf-studio" name="studio" defaultValue={profile.studio ?? ""} maxLength={160} autoComplete="organization" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="pf-country">Country</label>
          <input id="pf-country" name="country" defaultValue={profile.country ?? ""} maxLength={80} autoComplete="country-name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="pf-city">City</label>
          <input id="pf-city" name="city" defaultValue={profile.city ?? ""} maxLength={80} autoComplete="address-level2" className={field} />
        </div>
        <div className="md:col-span-2">
          <label className={label} htmlFor="pf-address">Delivery address</label>
          <textarea id="pf-address" name="address" defaultValue={profile.address ?? ""} rows={3} maxLength={500} autoComplete="street-address" className={field} />
        </div>
        <div className="flex flex-wrap items-center gap-4 md:col-span-2">
          <button
            type="submit"
            disabled={state.kind === "saving"}
            className="rounded-full bg-[#0a0a0a] px-6 py-3 font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-widest text-[#fff8f6] disabled:opacity-60"
          >
            {state.kind === "saving" ? "Saving…" : "Save details"}
          </button>
          <p role="status" aria-live="polite" className={`text-sm ${state.kind === "error" ? "text-[#93000a]" : "text-[#2f6b4f]"}`}>
            {state.kind === "saved" && "Saved. Your next checkout will use these details."}
            {state.kind === "error" && state.message}
          </p>
        </div>
      </form>
    </section>
  );
}
