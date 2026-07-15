"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Match, Team } from "@/types/database.types";
import { updateMatchResult, resetMatchResult, suspendMatch, type MatchResultState } from "./actions";

type MatchWithTeams = Match & { home_team: Team; away_team: Team };

export function MatchRow({ match, seasonId }: { match: MatchWithTeams; seasonId: string }) {
  const [state, formAction, pending] = useActionState<MatchResultState, FormData>(
    updateMatchResult.bind(null, match.id, seasonId),
    {}
  );
  const [transitionPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-4 py-3 text-sm last:border-0 dark:border-neutral-800/60">
      <div className="flex flex-1 items-center justify-end gap-2 text-right font-medium text-neutral-900 dark:text-neutral-50">
        {match.home_team.name}
      </div>

      <form action={formAction} className="flex items-center gap-1.5">
        <Input
          name="home_score"
          type="number"
          min={0}
          defaultValue={match.home_score ?? ""}
          className="w-14 text-center"
        />
        <span className="text-neutral-400">-</span>
        <Input
          name="away_score"
          type="number"
          min={0}
          defaultValue={match.away_score ?? ""}
          className="w-14 text-center"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "..." : "Guardar"}
        </Button>
      </form>

      <div className="flex flex-1 items-center gap-2 font-medium text-neutral-900 dark:text-neutral-50">
        {match.away_team.name}
      </div>

      <div className="flex items-center gap-2">
        {match.status === "jugado" && <Badge tone="success">Jugado</Badge>}
        {match.status === "suspendido" && <Badge tone="warning">Suspendido</Badge>}
        {match.status === "programado" && (
          <button
            type="button"
            disabled={transitionPending}
            onClick={() => startTransition(() => suspendMatch(match.id, seasonId))}
            className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
          >
            Suspender
          </button>
        )}
        {match.status === "suspendido" && (
          <button
            type="button"
            disabled={transitionPending}
            onClick={() => startTransition(() => resetMatchResult(match.id, seasonId))}
            className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-emerald-600 hover:underline disabled:opacity-50"
          >
            Reprogramar
          </button>
        )}
      </div>

      {state.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}
