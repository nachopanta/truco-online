"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { divisionSchema, seasonSchema } from "@/lib/validations/season";

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
