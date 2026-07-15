import { CalendarX2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { DivisionTabs } from "@/components/division-tabs";
import { MatchList } from "@/components/match-list";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveSeason, getDivisionsForSeason, getMatches } from "@/lib/data/queries";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SupabaseNotConfigured />;
  }

  const season = await getActiveSeason();
  if (!season) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Todavía no hay una temporada cargada"
        description="Cuando el administrador cargue el calendario, los próximos partidos van a aparecer acá."
      />
    );
  }

  const divisions = await getDivisionsForSeason(season.id);
  const { division: divisionParam } = await searchParams;
  const activeDivision = divisions.find((d) => d.id === divisionParam) ?? divisions[0];

  const matches = activeDivision
    ? await getMatches(season.id, activeDivision.id, "programado")
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Calendario</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{season.name} — próximos partidos</p>
      </div>

      <DivisionTabs divisions={divisions} activeDivisionId={activeDivision?.id ?? ""} basePath="/calendario" />

      <MatchList matches={matches} emptyLabel="No hay partidos programados en esta división." />
    </div>
  );
}
