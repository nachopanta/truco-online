import { notFound } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DivisionTabs } from "@/components/division-tabs";
import { createClient } from "@/lib/supabase/server";
import { getDivisionsForSeason, getMatches } from "@/lib/data/queries";
import { MatchRow } from "./match-row";

export default async function ResultadosAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ division?: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: season } = await supabase.from("seasons").select("*").eq("id", id).maybeSingle();

  if (!season) notFound();

  const divisions = await getDivisionsForSeason(id);
  const { division: divisionParam } = await searchParams;
  const activeDivision = divisions.find((d) => d.id === divisionParam) ?? divisions[0];

  const matches = activeDivision ? await getMatches(id, activeDivision.id) : [];

  const byRound = new Map<number, typeof matches>();
  for (const match of matches) {
    const list = byRound.get(match.round) ?? [];
    list.push(match);
    byRound.set(match.round, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Resultados</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{season.name}</p>
      </div>

      <DivisionTabs
        divisions={divisions}
        activeDivisionId={activeDivision?.id ?? ""}
        basePath={`/admin/temporadas/${id}/partidos`}
      />

      {matches.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Esta división todavía no tiene calendario"
          description="Generá el calendario desde la página de la temporada para poder cargar resultados."
        />
      ) : (
        <div className="space-y-5">
          {[...byRound.entries()].map(([round, roundMatches]) => (
            <Card key={round}>
              <CardContent className="p-0">
                <p className="border-b border-neutral-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  Fecha {round}
                </p>
                {roundMatches.map((match) => (
                  <MatchRow key={match.id} match={match} seasonId={id} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
