import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeasonForm } from "../season-form";

export default function NuevaTemporadaPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Nueva temporada</h1>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la temporada</CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonForm />
        </CardContent>
      </Card>
    </div>
  );
}
