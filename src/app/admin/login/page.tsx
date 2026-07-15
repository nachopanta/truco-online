import { Spade } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-emerald-600/10 p-3 text-emerald-600 dark:text-emerald-400">
              <Spade className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Panel de administración
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Torneo de Truco</p>
          </div>
          <LoginForm redirectTo={redirectTo ?? "/admin"} />
        </CardContent>
      </Card>
    </div>
  );
}
