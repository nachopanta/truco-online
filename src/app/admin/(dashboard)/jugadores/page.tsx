import Link from "next/link";
import { Users, Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/delete-button";
import { createClient } from "@/lib/supabase/server";
import { deletePlayer } from "./actions";

export default async function JugadoresPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("last_name", { ascending: true });

  const list = players ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Jugadores</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{list.length} jugadores registrados</p>
        </div>
        <LinkButton href="/admin/jugadores/nuevo">
          <Plus className="size-4" />
          Nuevo jugador
        </LinkButton>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <EmptyState icon={Users} title="Todavía no hay jugadores" description="Registrá jugadores para poder sumarlos a un plantel." />
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {list.map((player) => (
                <li key={player.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">
                      {player.last_name}, {player.first_name}
                    </span>
                    {player.document && (
                      <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                        DNI {player.document}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/jugadores/${player.id}`}
                      className="flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton
                      action={deletePlayer.bind(null, player.id)}
                      confirmMessage={`Eliminar a ${player.first_name} ${player.last_name}?`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
