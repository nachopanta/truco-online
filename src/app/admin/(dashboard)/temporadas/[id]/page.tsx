import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getDivisionsForSeason, getTeams } from "@/lib/data/queries";
import type { SeasonTeam, Team } from "@/types/database.types";
import { SeasonForm } from "../season-form";
import { DivisionCard } from "../division-card";

export default async function EditarTemporadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: season }, divisions, allTeams] = await Promise.all([
    supabase.from("seasons").select("*").eq("id", id).maybeSingle(),
    getDivisionsForSeason(id),
    getTeams(),
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

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Datos de la temporada</CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonForm season={season} teams={allTeams} />
        </CardContent>
      </Card>

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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
