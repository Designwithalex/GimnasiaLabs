import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createServerSupabase } from '@/lib/supabase-server'
import { getPlayerFamily } from '@/lib/playerMap'

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function mapRow(row: Record<string, string>) {
  const playerName = (row['Name'] || row['Player Name'] || row['Player'] || '').trim()
  const family = getPlayerFamily(playerName)

  const matchName =
    (row['Session Title'] || row['Match Name'] || row['match_name'] || '').trim() || 'Unknown Match'
  const matchDate =
    (row['Date'] || row['match_date'] || '').trim() || null

  return {
    match_name: matchName,
    match_date: matchDate,
    player_name: playerName,
    family,
    duration_seconds: parseNum(row['Duration'] || row['duration_seconds']),
    distance_m: parseNum(row['Distance (metres)'] || row['Distance'] || row['distance_m']),
    sprint_distance_m: parseNum(row['Sprint Distance (m)'] || row['Sprint Distance'] || row['sprint_distance_m']),
    power_plays: parseNum(row['Power Plays'] || row['power_plays']),
    energy_kcal: parseNum(row['Energy'] || row['Energy (kcal)'] || row['energy_kcal']),
    impacts: parseNum(row['Impacts'] || row['impacts']),
    player_load: parseNum(row['Player Load'] || row['player_load']),
    top_speed_kmh: parseNum(row['Top Speed (km/h)'] || row['Top Speed'] || row['top_speed_kmh']),
    distance_per_min: parseNum(row['Distance Per Min'] || row['Distance/Min'] || row['distance_per_min']),
    power_score: parseNum(row['Power Score (w/kg)'] || row['Power Score'] || row['power_score']),
    work_ratio: parseNum(row['Work Ratio'] || row['work_ratio']),
    hr_max_bpm: parseNum(row['Hr Max (bpm)'] || row['HR Max'] || row['hr_max_bpm']),
    hr_load: parseNum(row['Hr Load'] || row['HR Load'] || row['hr_load']),
    time_red_zone_min: parseNum(row['Time In Red Zone (min)'] || row['Time In Red Zone'] || row['time_red_zone_min']),
    max_deceleration: parseNum(row['Max Deceleration (m/s/s)'] || row['Max Deceleration'] || row['max_deceleration']),
    max_acceleration: parseNum(row['Max Acceleration (m/s/s)'] || row['Max Acceleration'] || row['max_acceleration']),
    dist_speed_z1: parseNum(row['Distance in Speed Zone 1  (metres)'] || row['Distance in Speed Zone 1 (metres)'] || row['dist_speed_z1']),
    dist_speed_z2: parseNum(row['Distance in Speed Zone 2  (metres)'] || row['Distance in Speed Zone 2 (metres)'] || row['dist_speed_z2']),
    dist_speed_z3: parseNum(row['Distance in Speed Zone 3  (metres)'] || row['Distance in Speed Zone 3 (metres)'] || row['dist_speed_z3']),
    dist_speed_z4: parseNum(row['Distance in Speed Zone 4  (metres)'] || row['Distance in Speed Zone 4 (metres)'] || row['dist_speed_z4']),
    dist_speed_z5: parseNum(row['Distance in Speed Zone 5  (metres)'] || row['Distance in Speed Zone 5 (metres)'] || row['dist_speed_z5']),
    time_speed_z1: parseNum(row['Time in Speed Zone 1  (seconds)'] || row['Time in Speed Zone 1 (seconds)'] || row['time_speed_z1']),
    time_speed_z2: parseNum(row['Time in Speed Zone 2  (seconds)'] || row['Time in Speed Zone 2 (seconds)'] || row['time_speed_z2']),
    time_speed_z3: parseNum(row['Time in Speed Zone 3  (seconds)'] || row['Time in Speed Zone 3 (seconds)'] || row['time_speed_z3']),
    time_speed_z4: parseNum(row['Time in Speed Zone 4  (seconds)'] || row['Time in Speed Zone 4 (seconds)'] || row['time_speed_z4']),
    time_speed_z5: parseNum(row['Time in Speed Zone 5  (seconds)'] || row['Time in Speed Zone 5 (seconds)'] || row['time_speed_z5']),
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const text = await file.text()
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({ error: 'CSV parse error', details: parsed.errors }, { status: 400 })
    }

    const allRows = parsed.data
    const validRows = allRows.filter((row) => {
      const dur = parseNum(row['Duration'] || row['duration_seconds'])
      return dur !== null && dur >= 3600
    })
    const discarded = allRows.length - validRows.length

    const mappedRows = validRows.map(mapRow).filter((r) => r.player_name !== '')

    const supabase = createServerSupabase()
    const { error } = await supabase.from('match_stats').upsert(mappedRows, {
      onConflict: 'match_name,player_name',
      ignoreDuplicates: false,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      loaded: mappedRows.length,
      discarded,
      total: allRows.length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
