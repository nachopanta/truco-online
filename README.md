# Torneo de Truco

App de gestión del Torneo de Truco: panel de administración (temporadas, divisiones,
equipos, jugadores, calendario, resultados, ascensos/descensos) y portal público de
consulta (calendario, resultados, posiciones, estadísticas, historial).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres + Auth)
- Pensado para desplegar en [Vercel](https://vercel.com)

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [supabase.com](https://supabase.com) y copiar `.env.example` a
   `.env.local` con la URL y la publishable key del proyecto (Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

3. Aplicar el esquema de base de datos: en el SQL Editor de Supabase, ejecutar el
   contenido de `supabase/migrations/0001_init.sql` (o usar la Supabase CLI:
   `supabase db push`).

4. Crear el usuario administrador: en Supabase → Authentication → Users, crear un
   usuario con email/contraseña. El trigger de la migración le crea automáticamente
   su perfil de administrador (tabla `profiles`). No hay alta pública de usuarios.

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   - Portal público: [http://localhost:3000](http://localhost:3000)
   - Panel de administración: [http://localhost:3000/admin](http://localhost:3000/admin)

Sin las variables de entorno de Supabase configuradas, la app igual levanta y navega,
mostrando un aviso de "Supabase todavía no está configurado" en las secciones que
necesitan datos.

## Estructura

```
src/
  app/
    (public)/        Portal público: inicio, calendario, resultados, posiciones,
                      estadísticas, historial
    admin/
      login/          Login de administrador
      (dashboard)/    Panel protegido: dashboard, temporadas, equipos, jugadores
  components/         Componentes UI reutilizables y de layout
  lib/
    supabase/         Clientes de Supabase (browser, server, middleware) y helpers
    data/             Consultas de lectura reutilizadas por páginas públicas y admin
    validations/      Esquemas de validación (zod) para los formularios
  types/              Tipos de la base de datos
supabase/
  migrations/         Esquema SQL (tablas, vista de posiciones, políticas RLS)
```

## Modelo de datos

Una temporada tiene siempre 4 divisiones (creadas automáticamente al crearla). Los
equipos y jugadores son entidades persistentes; se inscriben en una división de una
temporada puntual mediante `season_teams`, y su plantel por temporada vive en
`team_players`. Las posiciones se calculan en la vista `standings` a partir de los
partidos jugados (no se guardan como tabla aparte), y los ascensos/descensos/campeón
quedan registrados en `promotions_relegations` y `seasons.champion_team_id` al cerrar
la temporada.

## Flujo de una temporada

1. Crear la temporada (genera sus 4 divisiones automáticamente).
2. Inscribir equipos en cada división.
3. Generar el calendario de cada división (todos contra todos, a una o dos ruedas)
   desde la tarjeta de la división.
4. Cargar resultados en *Temporada → Cargar resultados* a medida que se juegan los
   partidos. Las posiciones se recalculan solas.
5. Al terminar, usar *Finalizar temporada*: calcula la tabla final de cada división,
   registra ascensos/descensos según los cupos configurados y define el campeón
   (equipo 1° de la división de nivel 1).

## Próximas etapas

Cubierto hasta acá: autenticación, esquema completo, CRUD de temporadas/divisiones/
equipos/jugadores, generación automática de calendario, carga de resultados, cierre de
temporada con ascensos/descensos/campeón, y portal público leyendo todo eso.

Queda para siguientes iteraciones: carga de datos históricos de temporadas pasadas,
rachas y ranking histórico multi-temporada más elaborado, y exportaciones a
Excel/PDF/backups.
