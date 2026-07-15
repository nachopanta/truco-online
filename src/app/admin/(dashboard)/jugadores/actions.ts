"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { playerSchema } from "@/lib/validations/player";

export interface PlayerFormState {
  error?: string;
}

export async function createPlayer(
  _prevState: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const parsed = playerSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    document: formData.get("document"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("players").insert({
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    document: parsed.data.document || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/jugadores");
  redirect("/admin/jugadores");
}

export async function updatePlayer(
  id: string,
  _prevState: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const parsed = playerSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    document: formData.get("document"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      document: parsed.data.document || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/jugadores");
  redirect("/admin/jugadores");
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();
  await supabase.from("players").delete().eq("id", id);
  revalidatePath("/admin/jugadores");
}
