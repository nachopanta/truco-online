"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { divisionSchema, seasonSchema } from "@/lib/validations/season";
import { generateRoundRobin } from "@/lib/round-robin";

export interface SeasonFormState {
  error?: string;
}

const DEFAULT_DIVISIONS = [
  { level: 1, name: "División 1", promotion_slots: 0, relegation_slots: 2 },
  { level: 2, name: "División 2", promotion_slots: 2, relegation_slots: 2 },
  { level: 3, name: "División 3", promotion_slots: 2, relegation_slots: 2 },
  { level: 4, name: "División 4", promotion_slots: 2, relegation_slots: 0 },
];

export async function createSeason(
  _prevState: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const parsed = seasonSchema.safeParse({
    name: formData.get("name"),
    year: formData.get("year"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: season, error } = await supabase
    .from("seasons")
    .insert({
      name: parsed.data.name,
      year: parsed.data.year,
      status: parsed.data.status,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
    })
    .select()
    .single();

  if (error || !season) {
    return { error: error?.message ?? "No se pudo crear la temporada." };
  }

  const { error: divisionsError } = await supabase.from("divisions").insert(
    DEFAULT_DIVISIONS.map((division) => ({ ...division, season_id: season.id }))
  );

  if (divisionsError) {
    return { error: divisionsError.message };
  }

  revalidatePath("/admin/temporadas");
  revalidatePath("/");
  redirect(`/admin/temporadas/${season.id}`);
}

export async function updateSeason(
  id: string,
  _prevState: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const parsed = seasonSchema.safeParse({
    name: formData.get("name"),
    year: formData.get("year"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    champion_team_id: formData.get("champion_team_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("seasons")
    .update({
      name: parsed.data.name,
      year: parsed.data.year,
      status: parsed.data.status,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      champion_team_id: parsed.data.champion_team_id || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/temporadas/${id}`);
  revalidatePath("/");
  redirect(`/admin/temporadas/${id}`);
}

export async function deleteSeason(id: string) {
  const supabase = await createClient();
  await supabase.from("seasons").delete().eq("id", id);
  revalidatePath("/admin/temporadas");
  revalidatePath("/");
}

export interface DivisionFormState {
  error?: string;
}

export async function updateDivision(
  divisionId: string,
  seasonId: string,
  _prevState: DivisionFormState,
  formData: FormData
): Promise<DivisionFormState> {
  const parsed = divisionSchema.safeParse({
    name: formData.get("name"),
    promotion_slots: formData.get("promotion_slots"),
    relegation_slots: formData.get("relegation_slots"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("divisions")
    .update(parsed.data)
    .eq("id", divisionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
  return {};
}

export async function addTeamToDivision(
  seasonId: string,
  divisionId: string,
  formData: FormData
) {
  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return;

  const supabase = await createClient();
  await supabase.from("season_teams").insert({ season_id: seasonId, division_id: divisionId, team_id: teamId });
  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
}

export async function removeSeasonTeam(seasonTeamId: string, seasonId: string) {
  const supabase = await createClient();
  await supabase.from("season_teams").delete().eq("id", seasonTeamId);
  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
}

export interface ScheduleFormState {
  error?: string;
}

export async function generateSchedule(
  seasonId: string,
  divisionId: string,
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const doubleRound = formData.get("double_round") === "on";
  const startDate = String(formData.get("start_date") ?? "");
  const daysBetweenRounds = Number(formData.get("days_between_rounds") ?? 7);

  const supabase = await createClient();

  const { count: existingMatches } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("season_id", seasonId)
    .eq("division_id", divisionId);

  if (existingMatches && existingMatches > 0) {
    return { error: "Esta división ya tiene un calendario. Borralo antes de generar uno nuevo." };
  }

  const { data: seasonTeams } = await supabase
    .from("season_teams")
    .select("team_id")
    .eq("season_id", seasonId)
    .eq("division_id", divisionId);

  const teamIds = (seasonTeams ?? []).map((st) => st.team_id);

  if (teamIds.length < 2) {
    return { error: "Necesitás al menos 2 equipos inscriptos en la división para generar el calendario." };
  }

  const scheduled = generateRoundRobin(teamIds, doubleRound);

  const base = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const rows = scheduled.map((match) => ({
    season_id: seasonId,
    division_id: divisionId,
    round: match.round,
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    status: "programado" as const,
    scheduled_date:
      base && !Number.isNaN(base.getTime())
        ? new Date(base.getTime() + (match.round - 1) * daysBetweenRounds * 86400000).toISOString()
        : null,
  }));

  const { error } = await supabase.from("matches").insert(rows);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath(`/admin/temporadas/${seasonId}/partidos`);
  revalidatePath("/");
  return {};
}

export interface FinalizeSeasonResult {
  error?: string;
}

export async function finalizeSeason(seasonId: string): Promise<FinalizeSeasonResult> {
  const supabase = await createClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("season_id", seasonId)
    .order("level", { ascending: true });

  if (!divisions || divisions.length === 0) {
    return { error: "La temporada no tiene divisiones configuradas." };
  }

  await supabase.from("promotions_relegations").delete().eq("season_id", seasonId);

  let championTeamId: string | null = null;

  for (const division of divisions) {
    const { data: standings } = await supabase
      .from("standings")
      .select("*")
      .eq("season_id", seasonId)
      .eq("division_id", division.id)
      .order("tournament_points", { ascending: false })
      .order("points_diff", { ascending: false });

    const rows = standings ?? [];
    if (rows.length === 0) continue;

    if (division.level === 1) {
      championTeamId = rows[0].team_id;
    }

    const movements = rows.map((row, index) => {
      const position = index + 1;
      let movement: "ascenso" | "descenso" | "permanece" = "permanece";
      if (division.promotion_slots > 0 && position <= division.promotion_slots) {
        movement = "ascenso";
      } else if (division.relegation_slots > 0 && position > rows.length - division.relegation_slots) {
        movement = "descenso";
      }
      return {
        season_id: seasonId,
        division_id: division.id,
        team_id: row.team_id,
        movement,
        final_position: position,
      };
    });

    const { error } = await supabase.from("promotions_relegations").insert(movements);
    if (error) {
      return { error: error.message };
    }
  }

  const { error } = await supabase
    .from("seasons")
    .update({ status: "finalizada", champion_team_id: championTeamId })
    .eq("id", seasonId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/admin/temporadas");
  revalidatePath("/");
  return {};
}

export async function deleteSchedule(seasonId: string, divisionId: string) {
  const supabase = await createClient();
  await supabase
    .from("matches")
    .delete()
    .eq("season_id", seasonId)
    .eq("division_id", divisionId)
    .eq("status", "programado");

  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath(`/admin/temporadas/${seasonId}/partidos`);
  revalidatePath("/");
}
