'use client'

import { useState } from 'react'
import { MatchStat } from '@/lib/types'
import Link from 'next/link'

interface Props {
  data: MatchStat[]
}

type SortKey = 'player_name' | 'family' | 'sub_family' | 'duration_seconds' | 'distance_m' | 'top_speed_kmh' | 'player_load' | 'sprint_distance_m' | 'power_score'

function avg(vals: (number | null)[]): number {
  const valid = vals.filter((v): v is number => v !== null)
  if (!valid.length) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default function PlayerTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('distance_m')
  const [sortAsc, setSortAsc] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const byPlayer: Record<string, MatchStat[]> = {}
  for (const row of data) {
    if (!byPlayer[row.player_name]) byPlayer[row.player_name] = []
    byPlayer[row.player_name].push(row)
  }

  const rows = Object.entries(byPlayer).map(([name, stats]) => ({
    player_name: name,
    family: stats[0].family,
    sub_family: stats[0].sub_family ?? null,
    duration_seconds: avg(stats.map((s) => s.duration_seconds)),
    distance_m: avg(stats.map((s) => s.distance_m)),
    top_speed_kmh: avg(stats.map((s) => s.top_speed_kmh)),
    player_load: avg(stats.map((s) => s.player_load)),
    sprint_distance_m: avg(stats.map((s) => s.sprint_distance_m)),
    power_score: avg(stats.map((s) => s.power_score)),
  }))

  rows.sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortAsc ? cmp : -cmp
  })

  const cols: { key: SortKey; label: string }[] = [
    { key: 'player_name', label: 'Jugador' },
    { key: 'family', label: 'Familia' },
    { key: 'sub_family', label: 'Línea' },
    { key: 'duration_seconds', label: 'Min Prom' },
    { key: 'distance_m', label: 'Distancia' },
    { key: 'top_speed_kmh', label: 'Top Speed' },
    { key: 'player_load', label: 'Player Load' },
    { key: 'sprint_distance_m', label: 'Sprint Dist' },
    { key: 'power_score', label: 'Power Score' },
  ]

  const familyColor: Record<string, string> = {
    back: 'bg-emerald-900 text-emerald-300 border-emerald-700',
    forward: 'bg-cyan-900 text-cyan-300 border-cyan-700',
    unknown: 'bg-gray-800 text-gray-400 border-gray-700',
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {cols.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="text-left py-2 px-3 text-gray-400 font-medium cursor-pointer hover:text-gray-100 select-none whitespace-nowrap"
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-emerald-400">{sortAsc ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.player_name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <td className="py-2 px-3">
                <Link
                  href={`/player/${encodeURIComponent(row.player_name)}`}
                  className="text-gray-100 hover:text-emerald-400 transition-colors font-medium"
                >
                  {row.player_name}
                </Link>
              </td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-xs border ${familyColor[row.family]}`}>
                  {row.family}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-400 text-xs whitespace-nowrap">{row.sub_family ?? '—'}</td>
              <td className="py-2 px-3 text-gray-300">{Math.round(row.duration_seconds / 60)} min</td>
              <td className="py-2 px-3 text-gray-300">{Math.round(row.distance_m)}m</td>
              <td className="py-2 px-3 text-gray-300">{row.top_speed_kmh.toFixed(1)} km/h</td>
              <td className="py-2 px-3 text-gray-300">{row.player_load.toFixed(1)}</td>
              <td className="py-2 px-3 text-gray-300">{Math.round(row.sprint_distance_m)}m</td>
              <td className="py-2 px-3 text-gray-300">{row.power_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
