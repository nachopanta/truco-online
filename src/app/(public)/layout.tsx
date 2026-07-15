import { PublicNav } from "@/components/layout/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
        Torneo de Truco — Panel público
      </footer>
    </div>
  );
}
