"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { Season, Team } from "@/types/database.types";
import { createSeason, updateSeason, type SeasonFormState } from "./actions";

export function SeasonForm({ season, teams = [] }: { season?: Season; teams?: Team[] }) {
  const action = season ? updateSeason.bind(null, season.id) : createSeason;
  const [state, formAction, pending] = useActionState<SeasonFormState, FormData>(action, {});
  const [status, setStatus] = useState(season?.status ?? "planificada");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={season?.name} placeholder="Temporada 2026" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="year">Año</Label>
          <Input id="year" name="year" type="number" required defaultValue={season?.year ?? new Date().getFullYear()} />
        </div>
        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            id="status"
            name="status"
            defaultValue={season?.status ?? "planificada"}
            onChange={(e) => setStatus(e.target.value as Season["status"])}
          >
            <option value="planificada">Planificada</option>
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start_date">Fecha de inicio</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={season?.start_date ?? ""} />
        </div>
        <div>
          <Label htmlFor="end_date">Fecha de fin</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={season?.end_date ?? ""} />
        </div>
      </div>
      {!season && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Al crear la temporada se generan automáticamente sus 4 divisiones.
        </p>
      )}
      {season && status === "finalizada" && (
        <div>
          <Label htmlFor="champion_team_id">Campeón</Label>
          <Select id="champion_team_id" name="champion_team_id" defaultValue={season?.champion_team_id ?? ""}>
            <option value="">Sin definir</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : season ? "Guardar cambios" : "Crear temporada"}
      </Button>
    </form>
  );
}
