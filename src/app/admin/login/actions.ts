"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface LoginState {
  error?: string;
}

export async function login(
  redirectTo: string,
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase todavía no está configurado. Definí las variables de entorno primero." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(redirectTo || "/admin");
}
