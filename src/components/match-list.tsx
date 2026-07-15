import { CalendarX2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Match, Team } from "@/types/database.types";

type MatchWithTeams = Match & { home_team: Team; away_team: Team };

export function MatchList({ matches, emptyLabel }: { matches: MatchWithTeams[]; emptyLabel: string }) {
  if (matches.length === 0) {
    return <EmptyState icon={CalendarX2} title={emptyLabel} />;
  }

  const byRound = new Map<number, MatchWithTeams[]>();
  for (const match of matches) {
    const list = byRound.get(match.round) ?? [];
    list.push(match);
    byRound.set(match.round, list);
  }

  return (
    <div className="space-y-6">
      {[...byRound.entries()].map(([round, roundMatches]) => (
        <div key={round}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Fecha {round}
          </p>
          <div className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200 dark:divide-neutral-800/60 dark:border-neutral-800">
            {roundMatches.map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 text-sm dark:bg-neutral-900"
              >
                <div className="flex flex-1 items-center justify-end gap-2 text-right">
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {match.home_team.name}
                  </span>
                </div>
                <div className="flex min-w-20 items-center justify-center gap-2 font-semibold">
                  {match.status === "jugado" ? (
                    <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                      {match.home_score} - {match.away_score}
                    </span>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">
                      {match.scheduled_date
                        ? new Date(match.scheduled_date).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "vs"}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {match.away_team.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
