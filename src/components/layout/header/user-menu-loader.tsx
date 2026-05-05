import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/_actions/auth";

import { UserMenu, type UserMenuUser } from "./user-menu";

async function signOut() {
  "use server";
  await logoutUser();
  redirect("/login");
}

export async function UserMenuLoader() {
  const user = await getCurrentUser();
  const props: UserMenuUser | undefined = user
    ? {
        name:
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          (user as any).name ||
          (user as any).email,
        email: (user as any).email,
        avatarUrl: (user as any).avatar_url ?? (user as any).avatarUrl,
      }
    : undefined;

  return <UserMenu user={props} onSignOut={signOut} />;
}
