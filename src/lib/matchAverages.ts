import { MatchStat } from './types'

export interface RowData {
  sub_family: string
  matchCount: number
  distance_m: number
  sprint_distance_m: number
  top_speed_kmh: number
  power_plays: number
  max_acceleration: number
  impacts: number
  player_load: number
  duration_seconds: number
}

const SUB_FAMILY_ORDER = ['Front Row', 'Locks', 'Back Row', 'Inside Backs', 'Outside Backs']

export function avg(vals: (number | null | undefined)[]): number {
  const valid = vals.filter((v): v is number => v != null && !isNaN(v))
  if (!valid.length) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export function buildRows(data: MatchStat[]): RowData[] {
  const result: RowData[] = []
  for (const sf of SUB_FAMILY_ORDER) {
    const sfData = data.filter((d) => d.sub_family === sf)
    if (!sfData.length) continue

    const byMatch: Record<string, MatchStat[]> = {}
    for (const row of sfData) {
      if (!byMatch[row.match_name]) byMatch[row.match_name] = []
      byMatch[row.match_name].push(row)
    }

    const matchAvgs = Object.values(byMatch).map((players) => ({
      distance_m: avg(players.map((p) => p.distance_m)),
      sprint_distance_m: avg(players.map((p) => p.sprint_distance_m)),
      top_speed_kmh: avg(players.map((p) => p.top_speed_kmh)),
      power_plays: avg(players.map((p) => p.power_plays)),
      max_acceleration: avg(players.map((p) => p.max_acceleration)),
      impacts: avg(players.map((p) => p.impacts)),
      player_load: avg(players.map((p) => p.player_load)),
      duration_seconds: avg(players.map((p) => p.duration_seconds)),
    }))

    result.push({
      sub_family: sf,
      matchCount: matchAvgs.length,
      distance_m: avg(matchAvgs.map((m) => m.distance_m)),
      sprint_distance_m: avg(matchAvgs.map((m) => m.sprint_distance_m)),
      top_speed_kmh: avg(matchAvgs.map((m) => m.top_speed_kmh)),
      power_plays: avg(matchAvgs.map((m) => m.power_plays)),
      max_acceleration: avg(matchAvgs.map((m) => m.max_acceleration)),
      impacts: avg(matchAvgs.map((m) => m.impacts)),
      player_load: avg(matchAvgs.map((m) => m.player_load)),
      duration_seconds: avg(matchAvgs.map((m) => m.duration_seconds)),
    })
  }
  return result
}
