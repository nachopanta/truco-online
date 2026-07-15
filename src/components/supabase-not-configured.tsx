import { DatabaseZap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SupabaseNotConfigured() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <DatabaseZap className="size-8 text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Supabase todavía no está configurado
          </p>
          <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-500">
            Definí <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> en{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">.env.local</code> para ver datos reales.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
