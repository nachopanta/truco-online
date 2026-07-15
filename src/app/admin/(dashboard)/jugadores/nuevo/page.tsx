import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm } from "../player-form";

export default function NuevoJugadorPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Nuevo jugador</h1>
      <Card>
        <CardHeader>
          <CardTitle>Datos del jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm />
        </CardContent>
      </Card>
    </div>
  );
}
