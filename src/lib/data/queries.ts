import { createClient } from "@/lib/supabase/server";
import type {
  Division,
  Match,
  PromotionRelegation,
  Season,
  Standing,
  Team,
} from "@/types/database.types";

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient();
  const { data: active } = await supabase
    .from("seasons")
    .select("*")
    .eq("status", "activa")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) return active;

  const { data: latest } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest ?? null;
}

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("seasons").select("*").order("year", { ascending: false });
  return data ?? [];
}

export async function getDivisionsForSeason(seasonId: string): Promise<Division[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("divisions")
    .select("*")
    .eq("season_id", seasonId)
    .order("level", { ascending: true });
  return data ?? [];
}

export async function getStandings(seasonId: string, divisionId: string): Promise<Standing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("standings")
    .select("*")
    .eq("season_id", seasonId)
    .eq("division_id", divisionId)
    .order("tournament_points", { ascending: false })
    .order("points_diff", { ascending: false });
  return data ?? [];
}

export async function getMatches(
  seasonId: string,
  divisionId?: string,
  status?: Match["status"]
): Promise<(Match & { home_team: Team; away_team: Team })[]> {
  const supabase = await createClient();
  let query = supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("season_id", seasonId)
    .order("round", { ascending: true })
    .order("scheduled_date", { ascending: true });

  if (divisionId) query = query.eq("division_id", divisionId);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data ?? []) as unknown as (Match & { home_team: Team; away_team: Team })[];
}

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").order("name", { ascending: true });
  return data ?? [];
}

export async function getFinishedSeasons(): Promise<(Season & { champion_team: Team | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("*, champion_team:teams!seasons_champion_team_id_fkey(*)")
    .eq("status", "finalizada")
    .order("year", { ascending: false });
  return (data ?? []) as unknown as (Season & { champion_team: Team | null })[];
}

export async function getPromotionsRelegations(
  seasonId: string
): Promise<(PromotionRelegation & { team: Team; division: Division })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promotions_relegations")
    .select("*, team:teams(*), division:divisions(*)")
    .eq("season_id", seasonId)
    .order("final_position", { ascending: true });
  return (data ?? []) as unknown as (PromotionRelegation & { team: Team; division: Division })[];
}

export async function getMatchStatsForSeason(
  seasonId: string
): Promise<Record<string, { total: number; jugado: number }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("division_id, status")
    .eq("season_id", seasonId);

  const stats: Record<string, { total: number; jugado: number }> = {};
  for (const row of data ?? []) {
    const entry = stats[row.division_id] ?? { total: 0, jugado: 0 };
    entry.total += 1;
    if (row.status === "jugado") entry.jugado += 1;
    stats[row.division_id] = entry;
  }
  return stats;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const [{ count: seasons }, { count: teams }, { count: players }, { count: upcomingMatches }] =
    await Promise.all([
      supabase.from("seasons").select("*", { count: "exact", head: true }),
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("status", "programado"),
    ]);

  return {
    seasons: seasons ?? 0,
    teams: teams ?? 0,
    players: players ?? 0,
    upcomingMatches: upcomingMatches ?? 0,
  };
}

export async function getAllStandingsForSeason(
  seasonId: string
): Promise<(Standing & { division_name: string })[]> {
  const supabase = await createClient();
  const [{ data: standings }, divisions] = await Promise.all([
    supabase
      .from("standings")
      .select("*")
      .eq("season_id", seasonId)
      .order("tournament_points", { ascending: false }),
    getDivisionsForSeason(seasonId),
  ]);

  const divisionNameById = new Map(divisions.map((d) => [d.id, d.name]));

  return (standings ?? []).map((row) => ({
    ...row,
    division_name: divisionNameById.get(row.division_id) ?? "",
  }));
}
