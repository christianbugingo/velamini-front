import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminWrapper from "@/components/admin/wrapper";

export const metadata = {
  title: "Admin — Velamini",
  description: "Velamini platform administration",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) redirect("/admin/auth/login");

  // Must have authenticated via admin credentials (not Google)
  if (!session.user.isAdminAuth) {
    redirect("/admin/auth/login");
  }

  return <AdminWrapper />;
}