# GimnasiaLabs — Rugby Analytics

Dashboard de métricas físicas de jugadores de rugby/hockey para Gimnasia.

## Setup local

1. Clonar el repo:
```bash
git clone https://github.com/Designwithalex/GimnasiaLabs.git
cd GimnasiaLabs
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear `.env.local` basado en `.env.example`:
```bash
cp .env.example .env.local
# Completar con las credenciales de Supabase
```

4. Correr en desarrollo:
```bash
npm run dev
```

## Supabase — SQL para crear la tabla

```sql
CREATE TABLE match_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  match_name text NOT NULL,
  match_date text,
  player_name text NOT NULL,
  family text,
  duration_seconds numeric,
  distance_m numeric,
  sprint_distance_m numeric,
  power_plays numeric,
  energy_kcal numeric,
  impacts numeric,
  player_load numeric,
  top_speed_kmh numeric,
  distance_per_min numeric,
  power_score numeric,
  work_ratio numeric,
  hr_max_bpm numeric,
  hr_load numeric,
  time_red_zone_min numeric,
  max_deceleration numeric,
  max_acceleration numeric,
  dist_speed_z1 numeric, dist_speed_z2 numeric, dist_speed_z3 numeric,
  dist_speed_z4 numeric, dist_speed_z5 numeric,
  time_speed_z1 numeric, time_speed_z2 numeric, time_speed_z3 numeric,
  time_speed_z4 numeric, time_speed_z5 numeric
);

ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON match_stats FOR ALL USING (true);
```

### Migración — agregar columna sub_family

```sql
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS sub_family text;
```

## Deploy en Vercel

1. Importar el repo desde vercel.com
2. Configurar las variables de entorno en el dashboard de Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy!

## Estructura del proyecto

- `/` — Dashboard principal con gráficos y tabla
- `/upload` — Subir CSV de partidos
- `/player/[name]` — Perfil individual de cada jugador

## Tech Stack

- Next.js (App Router)
- TypeScript + Tailwind CSS
- shadcn/ui + Recharts
- Supabase (PostgreSQL)
