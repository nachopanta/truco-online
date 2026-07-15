import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TeamForm } from "../team-form";

export default async function EditarEquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();

  if (!team) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Editar equipo</h1>
      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamForm team={team} />
        </CardContent>
      </Card>
    </div>
  );
}
