import { redirect } from "next/navigation";
import { getSessionUser, getRoleRedirectPath } from "@/lib/auth/session";

export default async function DashboardRedirectPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const destination = getRoleRedirectPath(user.role);
  redirect(destination);
}
