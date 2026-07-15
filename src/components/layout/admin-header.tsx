import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logout } from "@/app/admin/actions";

export function AdminHeader({
  email,
  onMenuClick,
}: {
  email?: string | null;
  onMenuClick: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
        >
          <Menu className="size-5" />
        </button>
        <p className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">{email}</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
