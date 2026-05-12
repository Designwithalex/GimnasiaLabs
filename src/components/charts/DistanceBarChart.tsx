'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { MatchStat } from '@/lib/types'

interface Props {
  data: MatchStat[]
}

export default function DistanceBarChart({ data }: Props) {
  const byPlayer: Record<string, { distance: number; family: string }> = {}
  for (const row of data) {
    if (!byPlayer[row.player_name]) {
      byPlayer[row.player_name] = { distance: 0, family: row.family }
    }
    byPlayer[row.player_name].distance += row.distance_m ?? 0
  }

  const chartData = Object.entries(byPlayer)
    .map(([name, { distance, family }]) => ({ name, distance: Math.round(distance), family }))
    .sort((a, b) => b.distance - a.distance)

  const colorMap: Record<string, string> = {
    back: '#10b981',
    forward: '#06b6d4',
    unknown: '#6b7280',
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `${v}m`} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB', fontSize: 11 }} width={120} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#F9FAFB' }}
          formatter={(v) => [`${Number(v).toLocaleString()}m`, 'Distancia']}
        />
        <Bar dataKey="distance" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={colorMap[entry.family] ?? '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
