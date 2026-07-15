"use client";

import { useActionState, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { DeleteButton } from "@/components/delete-button";
import { generateSchedule, deleteSchedule, type ScheduleFormState } from "./actions";

interface ScheduleFormProps {
  seasonId: string;
  divisionId: string;
  matchStats?: { total: number; jugado: number };
}

export function ScheduleForm({ seasonId, divisionId, matchStats }: ScheduleFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ScheduleFormState, FormData>(
    generateSchedule.bind(null, seasonId, divisionId),
    {}
  );

  if (matchStats && matchStats.total > 0) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <CalendarDays className="size-4" />
          {matchStats.jugado} / {matchStats.total} partidos jugados
        </span>
        {matchStats.jugado === 0 && (
          <DeleteButton
            action={deleteSchedule.bind(null, seasonId, divisionId)}
            confirmMessage="Borrar el calendario generado para esta división?"
          />
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CalendarDays className="size-4" />
        Generar calendario
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`start-${divisionId}`}>Fecha de la primera jornada</Label>
          <Input id={`start-${divisionId}`} name="start_date" type="date" />
        </div>
        <div>
          <Label htmlFor={`days-${divisionId}`}>Días entre jornadas</Label>
          <Input id={`days-${divisionId}`} name="days_between_rounds" type="number" min={1} defaultValue={7} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        <input type="checkbox" name="double_round" className="size-4 rounded border-neutral-300" />
        Ida y vuelta (cada equipo juega dos veces contra cada rival)
      </label>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Generando..." : "Generar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
