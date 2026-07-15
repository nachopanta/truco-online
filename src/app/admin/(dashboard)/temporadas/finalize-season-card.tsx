"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Division } from "@/types/database.types";
import { finalizeSeason } from "./actions";

interface FinalizeSeasonCardProps {
  seasonId: string;
  divisions: Division[];
  matchStats: Record<string, { total: number; jugado: number }>;
}

export function FinalizeSeasonCard({ seasonId, divisions, matchStats }: FinalizeSeasonCardProps) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pendingMatches = divisions.reduce((acc, division) => {
    const stats = matchStats[division.id];
    return acc + (stats ? stats.total - stats.jugado : 0);
  }, 0);

  const handleFinalize = () => {
    const confirmMessage =
      pendingMatches > 0
        ? `Todavía hay ${pendingMatches} partido(s) sin jugar. ¿Igual querés finalizar la temporada y calcular ascensos, descensos y campeón?`
        : "¿Finalizar la temporada y calcular ascensos, descensos y campeón?";

    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await finalizeSeason(seasonId);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        router.refresh();
      }
    });
  };

  return (
    <Card className="border-amber-200 dark:border-amber-900/60">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Trophy className="size-4" />
          <p className="text-sm font-semibold">Cerrar temporada</p>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Calcula la tabla final de cada división, registra ascensos/descensos y define el campeón.
        </p>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="button" variant="outline" size="sm" onClick={handleFinalize} disabled={pending}>
          {pending ? "Finalizando..." : "Finalizar temporada"}
        </Button>
      </CardContent>
    </Card>
  );
}
