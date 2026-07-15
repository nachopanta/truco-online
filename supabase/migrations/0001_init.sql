-- Torneo de Truco: esquema inicial
-- Temporadas, divisiones, equipos, jugadores, calendario de partidos,
-- posiciones (vista calculada), ascensos/descensos y perfiles de administrador.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Perfiles (rol de administrador). Los administradores se crean manualmente
-- en Supabase Auth (no hay alta pública). Al crearse un usuario se le crea
-- automáticamente su perfil de administrador.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper para políticas RLS: ¿el usuario autenticado es administrador?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Equipos y jugadores (entidades persistentes, no atadas a una temporada)
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  document text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Temporadas
-- ---------------------------------------------------------------------------
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  status text not null default 'planificada'
    check (status in ('planificada', 'activa', 'finalizada')),
  start_date date,
  end_date date,
  champion_team_id uuid references public.teams (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Divisiones (4 por temporada). level 1 = superior ... 4 = inferior.
-- ---------------------------------------------------------------------------
create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  name text not null,
  level int not null check (level between 1 and 4),
  promotion_slots int not null default 0,
  relegation_slots int not null default 0,
  created_at timestamptz not null default now(),
  unique (season_id, level)
);

-- ---------------------------------------------------------------------------
-- Inscripción de un equipo en una división para una temporada dada.
-- ---------------------------------------------------------------------------
create table if not exists public.season_teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  division_id uuid not null references public.divisions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (season_id, team_id)
);

-- ---------------------------------------------------------------------------
-- Plantel de un equipo para una temporada dada (jugadores pueden cambiar
-- de equipo entre temporadas).
-- ---------------------------------------------------------------------------
create table if not exists public.team_players (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (season_id, team_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Calendario de partidos (todos contra todos dentro de cada división)
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  division_id uuid not null references public.divisions (id) on delete cascade,
  round int not null default 1,
  home_team_id uuid not null references public.teams (id) on delete cascade,
  away_team_id uuid not null references public.teams (id) on delete cascade,
  scheduled_date timestamptz,
  status text not null default 'programado'
    check (status in ('programado', 'jugado', 'suspendido')),
  home_score int,
  away_score int,
  played_at timestamptz,
  created_at timestamptz not null default now(),
  constraint matches_teams_distinct check (home_team_id <> away_team_id)
);

create index if not exists matches_season_division_idx
  on public.matches (season_id, division_id);

-- ---------------------------------------------------------------------------
-- Historial de ascensos y descensos, registrado al finalizar cada temporada.
-- ---------------------------------------------------------------------------
create table if not exists public.promotions_relegations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  division_id uuid not null references public.divisions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  movement text not null check (movement in ('ascenso', 'descenso', 'permanece')),
  final_position int,
  created_at timestamptz not null default now(),
  unique (season_id, team_id)
);

-- ---------------------------------------------------------------------------
-- Vista de posiciones: se calcula a partir de los partidos jugados.
-- Puntos: victoria = 3, empate = 1, derrota = 0.
-- ---------------------------------------------------------------------------
create or replace view public.standings as
with results as (
  select
    m.season_id,
    m.division_id,
    m.home_team_id as team_id,
    case when m.home_score > m.away_score then 1 else 0 end as won,
    case when m.home_score = m.away_score then 1 else 0 end as drawn,
    case when m.home_score < m.away_score then 1 else 0 end as lost,
    m.home_score as points_for,
    m.away_score as points_against
  from public.matches m
  where m.status = 'jugado' and m.home_score is not null and m.away_score is not null
  union all
  select
    m.season_id,
    m.division_id,
    m.away_team_id as team_id,
    case when m.away_score > m.home_score then 1 else 0 end as won,
    case when m.away_score = m.home_score then 1 else 0 end as drawn,
    case when m.away_score < m.home_score then 1 else 0 end as lost,
    m.away_score as points_for,
    m.home_score as points_against
  from public.matches m
  where m.status = 'jugado' and m.home_score is not null and m.away_score is not null
)
select
  st.season_id,
  st.division_id,
  st.team_id,
  t.name as team_name,
  count(*) as played,
  coalesce(sum(r.won), 0) as won,
  coalesce(sum(r.drawn), 0) as drawn,
  coalesce(sum(r.lost), 0) as lost,
  coalesce(sum(r.points_for), 0) as points_for,
  coalesce(sum(r.points_against), 0) as points_against,
  coalesce(sum(r.points_for), 0) - coalesce(sum(r.points_against), 0) as points_diff,
  coalesce(sum(r.won), 0) * 3 + coalesce(sum(r.drawn), 0) as tournament_points
from public.season_teams st
join public.teams t on t.id = st.team_id
left join results r on r.season_id = st.season_id
  and r.division_id = st.division_id
  and r.team_id = st.team_id
group by st.season_id, st.division_id, st.team_id, t.name;

-- ---------------------------------------------------------------------------
-- Row Level Security: lectura pública, escritura solo para administradores.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.seasons enable row level security;
alter table public.divisions enable row level security;
alter table public.season_teams enable row level security;
alter table public.team_players enable row level security;
alter table public.matches enable row level security;
alter table public.promotions_relegations enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "teams_public_read" on public.teams for select using (true);
create policy "teams_admin_write" on public.teams for insert with check (public.is_admin());
create policy "teams_admin_update" on public.teams for update using (public.is_admin());
create policy "teams_admin_delete" on public.teams for delete using (public.is_admin());

create policy "players_public_read" on public.players for select using (true);
create policy "players_admin_write" on public.players for insert with check (public.is_admin());
create policy "players_admin_update" on public.players for update using (public.is_admin());
create policy "players_admin_delete" on public.players for delete using (public.is_admin());

create policy "seasons_public_read" on public.seasons for select using (true);
create policy "seasons_admin_write" on public.seasons for insert with check (public.is_admin());
create policy "seasons_admin_update" on public.seasons for update using (public.is_admin());
create policy "seasons_admin_delete" on public.seasons for delete using (public.is_admin());

create policy "divisions_public_read" on public.divisions for select using (true);
create policy "divisions_admin_write" on public.divisions for insert with check (public.is_admin());
create policy "divisions_admin_update" on public.divisions for update using (public.is_admin());
create policy "divisions_admin_delete" on public.divisions for delete using (public.is_admin());

create policy "season_teams_public_read" on public.season_teams for select using (true);
create policy "season_teams_admin_write" on public.season_teams for insert with check (public.is_admin());
create policy "season_teams_admin_update" on public.season_teams for update using (public.is_admin());
create policy "season_teams_admin_delete" on public.season_teams for delete using (public.is_admin());

create policy "team_players_public_read" on public.team_players for select using (true);
create policy "team_players_admin_write" on public.team_players for insert with check (public.is_admin());
create policy "team_players_admin_update" on public.team_players for update using (public.is_admin());
create policy "team_players_admin_delete" on public.team_players for delete using (public.is_admin());

create policy "matches_public_read" on public.matches for select using (true);
create policy "matches_admin_write" on public.matches for insert with check (public.is_admin());
create policy "matches_admin_update" on public.matches for update using (public.is_admin());
create policy "matches_admin_delete" on public.matches for delete using (public.is_admin());

create policy "promotions_relegations_public_read" on public.promotions_relegations for select using (true);
create policy "promotions_relegations_admin_write" on public.promotions_relegations for insert with check (public.is_admin());
create policy "promotions_relegations_admin_update" on public.promotions_relegations for update using (public.is_admin());
create policy "promotions_relegations_admin_delete" on public.promotions_relegations for delete using (public.is_admin());
