"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useProfileQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from "@/hooks/use-auth-mutations";
import type { AuthUser } from "@/types";

const inputCls =
  "rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none";

export default function ProfileForm({ initial }: { initial: AuthUser }) {
  const { data = initial } = useProfileQuery(initial);
  const updateProfile = useUpdateProfileMutation();
  const updatePassword = useUpdatePasswordMutation();

  const [profile, setProfile] = useState({
    email: data.email ?? "",
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    phone: data.phone ?? "",
  });
  const [password, setPassword] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await updateProfile.mutateAsync(profile);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Profile updated");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Min 8 characters");
      return;
    }
    const res = await updatePassword.mutateAsync({
      email: profile.email,
      password,
    });
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Password updated");
    setPassword("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <header className="space-y-2">
        <p className="font-brand text-[11px] uppercase tracking-[0.32em] text-mute">
          Settings
        </p>
        <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-5xl">
          Your account, <span className="italic">refined.</span>
        </h1>
      </header>

      <form onSubmit={saveProfile} className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">Profile</h2>
        {(["email", "first_name", "last_name", "phone"] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1.5">
            <span className="font-brand text-[10px] uppercase tracking-[0.28em] text-mute">
              {k.replace("_", " ")}
            </span>
            <input
              type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
              value={profile[k]}
              onChange={(e) =>
                setProfile((p) => ({ ...p, [k]: e.target.value }))
              }
              autoComplete={
                k === "email"
                  ? "email"
                  : k === "first_name"
                    ? "given-name"
                    : k === "last_name"
                      ? "family-name"
                      : k === "phone"
                        ? "tel"
                        : undefined
              }
              className={inputCls}
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="self-end rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving…" : "Save profile"}
        </button>
      </form>

      <div className="h-px bg-hairline" />

      <form onSubmit={savePassword} className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">Change password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          autoComplete="new-password"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="self-end rounded-full border border-hairline px-5 py-2.5 text-sm transition-colors hover:border-foreground/30 disabled:opacity-50"
        >
          {updatePassword.isPending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
