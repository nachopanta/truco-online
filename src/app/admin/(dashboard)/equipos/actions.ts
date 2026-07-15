"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { teamSchema } from "@/lib/validations/team";

export interface TeamFormState {
  error?: string;
}

export async function createTeam(_prevState: TeamFormState, formData: FormData): Promise<TeamFormState> {
  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    logo_url: formData.get("logo_url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("teams").insert({
    name: parsed.data.name,
    logo_url: parsed.data.logo_url || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/equipos");
  revalidatePath("/");
  redirect("/admin/equipos");
}

export async function updateTeam(
  id: string,
  _prevState: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    logo_url: formData.get("logo_url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({ name: parsed.data.name, logo_url: parsed.data.logo_url || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/equipos");
  revalidatePath("/");
  redirect("/admin/equipos");
}

export async function deleteTeam(id: string) {
  const supabase = await createClient();
  await supabase.from("teams").delete().eq("id", id);
  revalidatePath("/admin/equipos");
  revalidatePath("/");
}
