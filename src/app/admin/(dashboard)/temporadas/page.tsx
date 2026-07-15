import Link from "next/link";
import { Trophy, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/delete-button";
import { getSeasons } from "@/lib/data/queries";
import { deleteSeason } from "./actions";

const statusTone = {
  planificada: "info",
  activa: "success",
  finalizada: "neutral",
} as const;

export default async function TemporadasPage() {
  const seasons = await getSeasons();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Temporadas</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{seasons.length} temporadas</p>
        </div>
        <LinkButton href="/admin/temporadas/nueva">
          <Plus className="size-4" />
          Nueva temporada
        </LinkButton>
      </div>

      <Card>
        <CardContent className="p-0">
          {seasons.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Todavía no hay temporadas"
              description="Creá la primera temporada para configurar sus divisiones y empezar a cargar equipos."
            />
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {seasons.map((season) => (
                <li key={season.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/admin/temporadas/${season.id}`} className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">{season.name}</span>
                    <Badge tone={statusTone[season.status]}>{season.status}</Badge>
                  </Link>
                  <DeleteButton
                    action={deleteSeason.bind(null, season.id)}
                    confirmMessage={`Eliminar "${season.name}" y todos sus datos asociados?`}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
