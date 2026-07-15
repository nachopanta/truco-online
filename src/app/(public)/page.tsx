import Link from "next/link";
import { CalendarDays, ListOrdered, ScrollText, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveSeason, getDivisionsForSeason } from "@/lib/data/queries";

const sections = [
  { href: "/calendario", label: "Calendario", description: "Próximos partidos por división", icon: CalendarDays },
  { href: "/resultados", label: "Resultados", description: "Partidos ya jugados", icon: ScrollText },
  { href: "/posiciones", label: "Posiciones", description: "Tabla actualizada de cada división", icon: ListOrdered },
  { href: "/historial", label: "Historial", description: "Campeones y temporadas anteriores", icon: Trophy },
];

export default async function PublicHomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <Hero />
        <SupabaseNotConfigured />
      </div>
    );
  }

  const season = await getActiveSeason();
  const divisions = season ? await getDivisionsForSeason(season.id) : [];

  return (
    <div className="space-y-8">
      <Hero season={season?.name} />

      {season && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Temporada activa</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{season.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {divisions.map((division) => (
                <Badge key={division.id} tone="info">
                  {division.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-emerald-500/60">
              <CardContent className="flex items-start gap-4">
                <div className="rounded-lg bg-emerald-600/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50">{label}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Hero({ season }: { season?: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 px-6 py-10 text-white sm:px-10 sm:py-14">
      <p className="text-sm font-medium text-emerald-200">Portal público</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Torneo de Truco</h1>
      <p className="mt-3 max-w-xl text-emerald-100">
        {season
          ? `Seguí el calendario, los resultados y la tabla de posiciones de ${season}.`
          : "Seguí el calendario, los resultados y la tabla de posiciones del torneo."}
      </p>
    </div>
  );
}
