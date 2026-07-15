"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MatchResultState {
  error?: string;
}

export async function updateMatchResult(
  matchId: string,
  seasonId: string,
  _prevState: MatchResultState,
  formData: FormData
): Promise<MatchResultState> {
  const homeScore = Number(formData.get("home_score"));
  const awayScore = Number(formData.get("away_score"));

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: "Ingresá un resultado válido para ambos equipos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "jugado",
      played_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/temporadas/${seasonId}/partidos`);
  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
  return {};
}

export async function resetMatchResult(matchId: string, seasonId: string) {
  const supabase = await createClient();
  await supabase
    .from("matches")
    .update({ home_score: null, away_score: null, status: "programado", played_at: null })
    .eq("id", matchId);

  revalidatePath(`/admin/temporadas/${seasonId}/partidos`);
  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
}

export async function suspendMatch(matchId: string, seasonId: string) {
  const supabase = await createClient();
  await supabase.from("matches").update({ status: "suspendido" }).eq("id", matchId);
  revalidatePath(`/admin/temporadas/${seasonId}/partidos`);
  revalidatePath(`/admin/temporadas/${seasonId}`);
  revalidatePath("/");
}
