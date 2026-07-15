import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveSeason, getAllStandingsForSeason } from "@/lib/data/queries";

export default async function EstadisticasPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseNotConfigured />;
  }

  const season = await getActiveSeason();
  if (!season) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Todavía no hay una temporada cargada"
        description="Las estadísticas se generan automáticamente a partir de los partidos jugados."
      />
    );
  }

  const standings = await getAllStandingsForSeason(season.id);
  const ranked = [...standings].sort((a, b) => b.tournament_points - a.tournament_points).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Estadísticas</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{season.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking general (todas las divisiones)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ranked.length === 0 ? (
            <EmptyState icon={BarChart3} title="Todavía no hay partidos jugados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Equipo</th>
                    <th className="px-3 py-3 font-medium">División</th>
                    <th className="px-3 py-3 text-center font-medium">PJ</th>
                    <th className="px-3 py-3 text-center font-medium">G</th>
                    <th className="px-3 py-3 text-center font-medium">P</th>
                    <th className="px-3 py-3 text-center font-medium">PF</th>
                    <th className="px-3 py-3 text-center font-medium">PC</th>
                    <th className="px-5 py-3 text-center font-medium">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((row, index) => (
                    <tr
                      key={`${row.division_id}-${row.team_id}`}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                    >
                      <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400">{index + 1}</td>
                      <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-50">
                        {row.team_name}
                      </td>
                      <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400">{row.division_name}</td>
                      <td className="px-3 py-3 text-center">{row.played}</td>
                      <td className="px-3 py-3 text-center">{row.won}</td>
                      <td className="px-3 py-3 text-center">{row.lost}</td>
                      <td className="px-3 py-3 text-center">{row.points_for}</td>
                      <td className="px-3 py-3 text-center">{row.points_against}</td>
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

      <Card>
        <CardContent className="text-sm text-neutral-500 dark:text-neutral-400">
          Rachas, ranking histórico multi-temporada y evolución por temporada se suman en la próxima etapa,
          una vez que haya partidos y temporadas cerradas cargados en Supabase.
        </CardContent>
      </Card>
    </div>
  );
}
