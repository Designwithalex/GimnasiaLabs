export interface MatchStat {
  id: string
  created_at: string
  match_name: string
  match_date: string | null
  player_name: string
  family: 'back' | 'forward' | 'unknown'
  duration_seconds: number | null
  distance_m: number | null
  sprint_distance_m: number | null
  power_plays: number | null
  energy_kcal: number | null
  impacts: number | null
  player_load: number | null
  top_speed_kmh: number | null
  distance_per_min: number | null
  power_score: number | null
  work_ratio: number | null
  hr_max_bpm: number | null
  hr_load: number | null
  time_red_zone_min: number | null
  max_deceleration: number | null
  max_acceleration: number | null
  dist_speed_z1: number | null
  dist_speed_z2: number | null
  dist_speed_z3: number | null
  dist_speed_z4: number | null
  dist_speed_z5: number | null
  time_speed_z1: number | null
  time_speed_z2: number | null
  time_speed_z3: number | null
  time_speed_z4: number | null
  time_speed_z5: number | null
}
