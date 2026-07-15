import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { SupabaseNotConfigured } from "@/components/supabase-not-configured";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getFinishedSeasons, getPromotionsRelegations } from "@/lib/data/queries";

export default async function HistorialPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseNotConfigured />;
  }

  const seasons = await getFinishedSeasons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Historial</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Campeones y movimientos de temporadas anteriores</p>
      </div>

      {seasons.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Todavía no hay temporadas finalizadas"
          description="Cuando se cierre una temporada, el campeón y los ascensos/descensos van a quedar registrados acá."
        />
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <SeasonHistoryCard key={season.id} season={season} />
          ))}
        </div>
      )}
    </div>
  );
}

async function SeasonHistoryCard({
  season,
}: {
  season: Awaited<ReturnType<typeof getFinishedSeasons>>[number];
}) {
  const movements = await getPromotionsRelegations(season.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{season.name}</CardTitle>
        {season.champion_team && (
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <Trophy className="size-4" />
            {season.champion_team.name}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Sin movimientos registrados.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {movements.map((movement) => (
              <li key={movement.id} className="flex items-center justify-between gap-3">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {movement.team.name}{" "}
                  <span className="text-neutral-400 dark:text-neutral-500">— {movement.division.name}</span>
                </span>
                <Badge
                  tone={
                    movement.movement === "ascenso"
                      ? "success"
                      : movement.movement === "descenso"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {movement.movement}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
