"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { Player } from "@/types/database.types";
import { createPlayer, updatePlayer, type PlayerFormState } from "./actions";

export function PlayerForm({ player }: { player?: Player }) {
  const action = player ? updatePlayer.bind(null, player.id) : createPlayer;
  const [state, formAction, pending] = useActionState<PlayerFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" required defaultValue={player?.first_name} />
        </div>
        <div>
          <Label htmlFor="last_name">Apellido</Label>
          <Input id="last_name" name="last_name" required defaultValue={player?.last_name} />
        </div>
      </div>
      <div>
        <Label htmlFor="document">DNI (opcional)</Label>
        <Input id="document" name="document" defaultValue={player?.document ?? ""} />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : player ? "Guardar cambios" : "Crear jugador"}
      </Button>
    </form>
  );
}
