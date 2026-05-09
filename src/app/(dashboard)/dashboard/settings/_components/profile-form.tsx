"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useProfileQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from "@/hooks/use-auth-mutations";
import type { AuthUser } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

const FIELDS = [
  {
    key: "first_name",
    label: "First name",
    autoComplete: "given-name",
    type: "text",
  },
  {
    key: "last_name",
    label: "Last name",
    autoComplete: "family-name",
    type: "text",
  },
  { key: "email", label: "Email", autoComplete: "email", type: "email" },
  { key: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
] as const;

export default function ProfileForm({ initial }: { initial: AuthUser }) {
  const { data = initial } = useProfileQuery(initial);
  const updateProfile = useUpdateProfileMutation();
  const updatePassword = useUpdatePasswordMutation();
  const reduce = useReducedMotion();

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

  const initials =
    `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() ||
    "•";

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-24 right-0 h-[420px] w-[520px] opacity-60"
      />

      <div className="mx-auto max-w-3xl space-y-14">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="space-y-3">
            <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
              The dressing room
            </p>
            <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-6xl">
              Your account, <span className="italic">refined.</span>
            </h1>
            <p className="max-w-md text-base italic text-mute md:text-lg">
              Particulars worth preserving — name, contact, the keys to the
              door.
            </p>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-full border border-hairline"
            />
            <div className="grid h-20 w-20 place-items-center rounded-full border border-hairline bg-surface-2 font-display text-2xl font-medium text-foreground">
              {initials}
            </div>
          </div>
        </motion.header>

        <motion.form
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          onSubmit={saveProfile}
          className="rounded-3xl border border-hairline bg-surface/60 p-8 backdrop-blur md:p-10"
        >
          <div className="flex items-center gap-3 border-b border-hairline pb-6">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-background text-foreground">
              <UserRound size={16} />
            </span>
            <div>
              <h2 className="font-display text-xl font-medium tracking-tight">
                Profile
              </h2>
              <p className="text-xs text-mute">
                Visible on invitations you send.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {FIELDS.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                type={f.type}
                value={profile[f.key]}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                }
                autoComplete={f.autoComplete}
                name={f.key}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <p className="text-xs text-mute">
              {updateProfile.isSuccess
                ? "Last saved just now"
                : "Changes save manually"}
            </p>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              variant="solid"
            >
              {updateProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </motion.form>

        <motion.form
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
          onSubmit={savePassword}
          className="rounded-3xl border border-hairline bg-surface/60 p-8 backdrop-blur md:p-10"
        >
          <div className="flex items-center gap-3 border-b border-hairline pb-6">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-background text-foreground">
              <Lock size={16} />
            </span>
            <div>
              <h2 className="font-display text-xl font-medium tracking-tight">
                Passphrase
              </h2>
              <p className="text-xs text-mute">
                Eight characters, kept entirely to yourself.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least eight characters"
              autoComplete="new-password"
              name="new_password"
              hint={
                password.length === 0
                  ? "—"
                  : password.length < 8
                    ? `${8 - password.length} more to go`
                    : "Strong enough"
              }
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={updatePassword.isPending || password.length < 8}
              variant="outline"
              className="rounded-full"
            >
              {updatePassword.isPending ? "Saving…" : "Update password"}
            </Button>
          </div>
        </motion.form>

        <motion.footer
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease }}
          className="border-t border-hairline pt-8 text-center"
        >
          <p className="font-display text-sm italic text-mute">
            "Quietly tended to" — the e-nvite house style.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
