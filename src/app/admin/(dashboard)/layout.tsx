import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
        <div className="w-full max-w-sm">
          <SupabaseNotConfigured />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
