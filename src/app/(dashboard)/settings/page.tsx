import { redirect } from "next/navigation";

import { getProfile } from "@/app/_actions/auth";

import ProfileForm from "./_components/profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getProfile();
  if (!me.success || !me.data) redirect("/login");
  return <ProfileForm initial={me.data} />;
}
