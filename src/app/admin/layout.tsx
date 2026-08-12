import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "./AdminShell";
import { getCurrentAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/portal/login");
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
