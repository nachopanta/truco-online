import { Shield, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/delete-button";
import { getTeams } from "@/lib/data/queries";
import { deleteTeam } from "./actions";

export default async function EquiposPage() {
  const teams = await getTeams();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Equipos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{teams.length} equipos registrados</p>
        </div>
        <LinkButton href="/admin/equipos/nuevo">
          <Plus className="size-4" />
          Nuevo equipo
        </LinkButton>
      </div>

      <Card>
        <CardContent className="p-0">
          {teams.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Todavía no hay equipos"
              description="Creá el primer equipo para poder inscribirlo en una división."
            />
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {teams.map((team) => (
                <li key={team.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">{team.name}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/equipos/${team.id}`}
                      className="flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton action={deleteTeam.bind(null, team.id)} confirmMessage={`Eliminar "${team.name}"?`} />
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
