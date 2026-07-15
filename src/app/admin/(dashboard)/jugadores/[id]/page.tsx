import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PlayerForm } from "../player-form";

export default async function EditarJugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase.from("players").select("*").eq("id", id).maybeSingle();

  if (!player) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Editar jugador</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {player.first_name} {player.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm player={player} />
        </CardContent>
      </Card>
    </div>
  );
}
