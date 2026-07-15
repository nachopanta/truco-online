"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { DeleteButton } from "@/components/delete-button";
import type { Division, SeasonTeam, Team } from "@/types/database.types";
import { addTeamToDivision, removeSeasonTeam, updateDivision, type DivisionFormState } from "./actions";

interface DivisionCardProps {
  seasonId: string;
  division: Division;
  seasonTeams: (SeasonTeam & { team: Team })[];
  availableTeams: Team[];
}

export function DivisionCard({ seasonId, division, seasonTeams, availableTeams }: DivisionCardProps) {
  const [state, formAction, pending] = useActionState<DivisionFormState, FormData>(
    updateDivision.bind(null, division.id, seasonId),
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{division.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={formAction} className="grid gap-3 sm:grid-cols-3 sm:items-end">
          <div>
            <Label htmlFor={`name-${division.id}`}>Nombre</Label>
            <Input id={`name-${division.id}`} name="name" defaultValue={division.name} required />
          </div>
          <div>
            <Label htmlFor={`promotion-${division.id}`}>Ascensos</Label>
            <Input
              id={`promotion-${division.id}`}
              name="promotion_slots"
              type="number"
              min={0}
              defaultValue={division.promotion_slots}
            />
          </div>
          <div>
            <Label htmlFor={`relegation-${division.id}`}>Descensos</Label>
            <Input
              id={`relegation-${division.id}`}
              name="relegation_slots"
              type="number"
              min={0}
              defaultValue={division.relegation_slots}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              {pending ? "Guardando..." : "Guardar división"}
            </Button>
            {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          </div>
        </form>

        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Equipos inscriptos ({seasonTeams.length})
          </p>
          {seasonTeams.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-500">Sin equipos inscriptos todavía.</p>
          ) : (
            <ul className="mb-3 divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {seasonTeams.map((st) => (
                <li key={st.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-neutral-800 dark:text-neutral-200">{st.team.name}</span>
                  <DeleteButton
                    action={removeSeasonTeam.bind(null, st.id, seasonId)}
                    confirmMessage={`Quitar a "${st.team.name}" de esta división?`}
                  />
                </li>
              ))}
            </ul>
          )}

          {availableTeams.length > 0 && (
            <form action={addTeamToDivision.bind(null, seasonId, division.id)} className="flex gap-2">
              <Select name="team_id" required defaultValue="" className="flex-1">
                <option value="" disabled>
                  Agregar equipo...
                </option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" size="sm" variant="outline">
                Agregar
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
