import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  user_id: string;
  email: string | null;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    return null;
  }

  return {
    user_id: user.id,
    email: user.email ?? null,
  };
}
