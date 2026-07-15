import { CalendarX2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { DivisionTabs } from "@/components/division-tabs";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveSeason, getDivisionsForSeason, getStandings } from "@/lib/data/queries";

export default async function PosicionesPage({
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
        description="Cuando el administrador cree una temporada con sus divisiones, acá vas a ver la tabla de posiciones."
      />
    );
  }

  const divisions = await getDivisionsForSeason(season.id);
  const { division: divisionParam } = await searchParams;
  const activeDivision = divisions.find((d) => d.id === divisionParam) ?? divisions[0];

  const standings = activeDivision ? await getStandings(season.id, activeDivision.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Posiciones</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{season.name}</p>
      </div>

      <DivisionTabs divisions={divisions} activeDivisionId={activeDivision?.id ?? ""} basePath="/posiciones" />

      <Card>
        <CardHeader>
          <CardTitle>{activeDivision?.name ?? "Tabla de posiciones"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {standings.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="Sin partidos jugados"
              description="La tabla se actualiza automáticamente a medida que se cargan resultados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Equipo</th>
                    <th className="px-3 py-3 text-center font-medium">PJ</th>
                    <th className="px-3 py-3 text-center font-medium">G</th>
                    <th className="px-3 py-3 text-center font-medium">E</th>
                    <th className="px-3 py-3 text-center font-medium">P</th>
                    <th className="px-3 py-3 text-center font-medium">PF</th>
                    <th className="px-3 py-3 text-center font-medium">PC</th>
                    <th className="px-3 py-3 text-center font-medium">DIF</th>
                    <th className="px-5 py-3 text-center font-medium">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, index) => (
                    <tr
                      key={row.team_id}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                    >
                      <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400">{index + 1}</td>
                      <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-50">
                        {row.team_name}
                      </td>
                      <td className="px-3 py-3 text-center">{row.played}</td>
                      <td className="px-3 py-3 text-center">{row.won}</td>
                      <td className="px-3 py-3 text-center">{row.drawn}</td>
                      <td className="px-3 py-3 text-center">{row.lost}</td>
                      <td className="px-3 py-3 text-center">{row.points_for}</td>
                      <td className="px-3 py-3 text-center">{row.points_against}</td>
                      <td className="px-3 py-3 text-center">{row.points_diff}</td>
                      <td className="px-5 py-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.tournament_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
