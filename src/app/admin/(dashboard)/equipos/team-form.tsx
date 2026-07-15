"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { Team } from "@/types/database.types";
import { createTeam, updateTeam, type TeamFormState } from "./actions";

export function TeamForm({ team }: { team?: Team }) {
  const action = team ? updateTeam.bind(null, team.id) : createTeam;
  const [state, formAction, pending] = useActionState<TeamFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del equipo</Label>
        <Input id="name" name="name" required defaultValue={team?.name} placeholder="Los Ganadores" />
      </div>
      <div>
        <Label htmlFor="logo_url">Logo (URL, opcional)</Label>
        <Input
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={team?.logo_url ?? ""}
          placeholder="https://..."
        />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : team ? "Guardar cambios" : "Crear equipo"}
      </Button>
    </form>
  );
}
