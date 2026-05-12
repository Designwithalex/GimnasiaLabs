'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { MatchStat } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

type SortKey = keyof MatchStat
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: keyof MatchStat; label: string; format?: (v: unknown) => string }[] = [
  { key: 'match_name', label: 'Partido' },
  { key: 'match_date', label: 'Fecha' },
  { key: 'player_name', label: 'Jugador' },
  { key: 'family', label: 'Familia' },
  { key: 'duration_seconds', label: 'Duración (min)', format: (v) => v != null ? `${Math.round(Number(v) / 60)}` : '—' },
  { key: 'distance_m', label: 'Distancia (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'sprint_distance_m', label: 'Sprint (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'top_speed_kmh', label: 'Top Speed', format: (v) => v != null ? Number(v).toFixed(1) : '—' },
  { key: 'player_load', label: 'Player Load', format: (v) => v != null ? Number(v).toFixed(1) : '—' },
  { key: 'power_score', label: 'Power Score', format: (v) => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'work_ratio', label: 'Work Ratio', format: (v) => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'hr_max_bpm', label: 'HR Max', format: (v) => v != null ? Math.round(Number(v)).toString() : '—' },
  { key: 'hr_load', label: 'HR Load', format: (v) => v != null ? Number(v).toFixed(1) : '—' },
  { key: 'time_red_zone_min', label: 'Zona Roja (min)', format: (v) => v != null ? Number(v).toFixed(1) : '—' },
  { key: 'energy_kcal', label: 'Energía (kcal)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'impacts', label: 'Impactos', format: (v) => v != null ? Math.round(Number(v)).toString() : '—' },
  { key: 'max_acceleration', label: 'Acel. Máx', format: (v) => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'max_deceleration', label: 'Decel. Máx', format: (v) => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'dist_speed_z1', label: 'Z1 (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'dist_speed_z2', label: 'Z2 (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'dist_speed_z3', label: 'Z3 (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'dist_speed_z4', label: 'Z4 (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
  { key: 'dist_speed_z5', label: 'Z5 (m)', format: (v) => v != null ? Math.round(Number(v)).toLocaleString() : '—' },
]

const familyColor: Record<string, string> = {
  back: 'text-emerald-400',
  forward: 'text-cyan-400',
  unknown: 'text-gray-500',
}

export default function DataPage() {
  const [allData, setAllData] = useState<MatchStat[]>([])
  const [loading, setLoading] = useState(true)
  const [matchFilter, setMatchFilter] = useState('all')
  const [familyFilter, setFamilyFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('match_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    supabase
      .from('match_stats')
      .select('*')
      .order('match_date', { ascending: false })
      .then(({ data }) => {
        setAllData((data as MatchStat[]) ?? [])
        setLoading(false)
      })
  }, [])

  const matches = useMemo(() => Array.from(new Set(allData.map((d) => d.match_name))).sort(), [allData])

  const filtered = useMemo(() => {
    let rows = allData
    if (matchFilter !== 'all') rows = rows.filter((d) => d.match_name === matchFilter)
    if (familyFilter !== 'all') rows = rows.filter((d) => d.family === familyFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (d) =>
          d.player_name.toLowerCase().includes(q) ||
          d.match_name.toLowerCase().includes(q)
      )
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allData, matchFilter, familyFilter, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  if (loading) {
    return <div className="text-center text-emerald-400 animate-pulse mt-20 text-lg">Cargando datos...</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Data</h1>
        <span className="text-sm text-gray-500">{filtered.length} registros</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar jugador o partido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-600"
        />
        <Select value={matchFilter} onValueChange={setMatchFilter}>
          <SelectTrigger className="w-52 bg-gray-900 border-gray-700 text-gray-100">
            <SelectValue placeholder="Partido" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">Todos los partidos</SelectItem>
            {matches.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={familyFilter} onValueChange={setFamilyFilter}>
          <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-gray-100">
            <SelectValue placeholder="Familia" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="back">Backs</SelectItem>
            <SelectItem value="forward">Forwards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-900 sticky top-0">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-2.5 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-100 select-none border-b border-gray-800"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 text-emerald-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-12 text-gray-600">
                  No hay registros
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="py-2 px-3">
                      {col.key === 'family' ? (
                        <span className={`font-medium ${familyColor[row.family] ?? 'text-gray-400'}`}>
                          {row.family}
                        </span>
                      ) : col.key === 'player_name' ? (
                        <a
                          href={`/player/${encodeURIComponent(row.player_name)}`}
                          className="text-gray-100 hover:text-emerald-400 transition-colors font-medium"
                        >
                          {row.player_name}
                        </a>
                      ) : col.format ? (
                        <span className="text-gray-300">{col.format(row[col.key])}</span>
                      ) : (
                        <span className="text-gray-300">{(row[col.key] as string | null) ?? '—'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
