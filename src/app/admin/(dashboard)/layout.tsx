import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
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

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={user.email} />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
