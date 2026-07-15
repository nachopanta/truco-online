"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Spade, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/calendario", label: "Calendario" },
  { href: "/resultados", label: "Resultados" },
  { href: "/posiciones", label: "Posiciones" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/historial", label: "Historial" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-50">
          <Spade className="size-5 text-emerald-600" />
          Torneo de Truco
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 md:inline-flex"
          >
            Administración
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300 md:hidden"
            aria-label="Abrir menú"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                pathname === link.href
                  ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Administración
          </Link>
        </nav>
      )}
    </header>
  );
}
