import { CalendarClock, Shield, Trophy, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveSeason, getDashboardStats } from "@/lib/data/queries";

export default async function AdminDashboardPage() {
  const [stats, activeSeason] = await Promise.all([getDashboardStats(), getActiveSeason()]);

  const cards = [
    { label: "Temporadas", value: stats.seasons, icon: Trophy },
    { label: "Equipos", value: stats.teams, icon: Shield },
    { label: "Jugadores", value: stats.players, icon: Users },
    { label: "Partidos pendientes", value: stats.upcomingMatches, icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {activeSeason ? `Temporada activa: ${activeSeason.name}` : "Todavía no hay una temporada activa"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-600/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{value}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
