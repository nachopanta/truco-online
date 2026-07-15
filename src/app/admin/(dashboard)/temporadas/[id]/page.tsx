import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getDivisionsForSeason, getMatchStatsForSeason, getTeams } from "@/lib/data/queries";
import type { SeasonTeam, Team } from "@/types/database.types";
import { SeasonForm } from "../season-form";
import { DivisionCard } from "../division-card";
import { FinalizeSeasonCard } from "../finalize-season-card";

export default async function EditarTemporadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: season }, divisions, allTeams, matchStats] = await Promise.all([
    supabase.from("seasons").select("*").eq("id", id).maybeSingle(),
    getDivisionsForSeason(id),
    getTeams(),
    getMatchStatsForSeason(id),
  ]);

  if (!season) notFound();

  const { data: seasonTeamsRaw } = await supabase
    .from("season_teams")
    .select("*, team:teams(*)")
    .eq("season_id", id);

  const seasonTeams = (seasonTeamsRaw ?? []) as unknown as (SeasonTeam & { team: Team })[];
  const assignedTeamIds = new Set(seasonTeams.map((st) => st.team_id));
  const availableTeams = allTeams.filter((team) => !assignedTeamIds.has(team.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{season.name}</h1>

      <div className="flex flex-wrap gap-4">
        <Card className="max-w-lg flex-1">
          <CardHeader>
            <CardTitle>Datos de la temporada</CardTitle>
          </CardHeader>
          <CardContent>
            <SeasonForm season={season} teams={allTeams} />
          </CardContent>
        </Card>

        <div className="flex flex-1 flex-col gap-4">
          <LinkButton href={`/admin/temporadas/${season.id}/partidos`} variant="outline" className="w-full sm:w-auto">
            <CalendarDays className="size-4" />
            Cargar resultados
          </LinkButton>

          {season.status === "activa" && (
            <FinalizeSeasonCard seasonId={season.id} divisions={divisions} matchStats={matchStats} />
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-50">Divisiones</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {divisions.map((division) => (
            <DivisionCard
              key={division.id}
              seasonId={season.id}
              division={division}
              seasonTeams={seasonTeams.filter((st) => st.division_id === division.id)}
              availableTeams={availableTeams}
              matchStats={matchStats[division.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
