// Tipos manuales que reflejan supabase/migrations/0001_init.sql.
// Si el proyecto Supabase está conectado, se pueden regenerar con:
//   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
//
// Nota: se usan `type` (no `interface`) porque @supabase/supabase-js valida
// en tiempo de compilación que cada tabla sea asignable a Record<string, unknown>,
// y los tipos declarados con `interface` no satisfacen esa comprobación.

export type SeasonStatus = "planificada" | "activa" | "finalizada";
export type MatchStatus = "programado" | "jugado" | "suspendido";
export type Movement = "ascenso" | "descenso" | "permanece";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
};

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  document: string | null;
  created_at: string;
};

export type Season = {
  id: string;
  name: string;
  year: number;
  status: SeasonStatus;
  start_date: string | null;
  end_date: string | null;
  champion_team_id: string | null;
  created_at: string;
};

export type Division = {
  id: string;
  season_id: string;
  name: string;
  level: 1 | 2 | 3 | 4;
  promotion_slots: number;
  relegation_slots: number;
  created_at: string;
};

export type SeasonTeam = {
  id: string;
  season_id: string;
  division_id: string;
  team_id: string;
  created_at: string;
};

export type TeamPlayer = {
  id: string;
  season_id: string;
  team_id: string;
  player_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  season_id: string;
  division_id: string;
  round: number;
  home_team_id: string;
  away_team_id: string;
  scheduled_date: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  played_at: string | null;
  created_at: string;
};

export type PromotionRelegation = {
  id: string;
  season_id: string;
  division_id: string;
  team_id: string;
  movement: Movement;
  final_position: number | null;
  created_at: string;
};

export type Standing = {
  season_id: string;
  division_id: string;
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points_for: number;
  points_against: number;
  points_diff: number;
  tournament_points: number;
};

type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      teams: TableDef<Team>;
      players: TableDef<Player>;
      seasons: TableDef<Season>;
      divisions: TableDef<Division>;
      season_teams: TableDef<SeasonTeam>;
      team_players: TableDef<TeamPlayer>;
      matches: TableDef<Match>;
      promotions_relegations: TableDef<PromotionRelegation>;
    };
    Views: {
      standings: { Row: Standing; Relationships: [] };
    };
    Functions: Record<string, never>;
  };
};
