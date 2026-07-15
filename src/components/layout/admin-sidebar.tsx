"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Shield, Users, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/temporadas", label: "Temporadas", icon: Trophy },
  { href: "/admin/equipos", label: "Equipos", icon: Shield },
  { href: "/admin/jugadores", label: "Jugadores", icon: Users },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ExternalLink className="size-4" />
          Ver portal público
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Escritorio: fija */}
      <aside className="hidden w-60 shrink-0 border-r border-neutral-200 bg-white px-3 py-6 dark:border-neutral-800 dark:bg-neutral-900 md:block">
        <SidebarNav />
      </aside>

      {/* Mobile: cajón deslizable */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white px-3 py-6 shadow-xl dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between px-3">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Menú</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarNav onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
