'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MatchStat } from '@/lib/types'

interface Props {
  data: MatchStat[]
}

const ZONE_COLORS = ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626']

export default function SpeedZoneChart({ data }: Props) {
  const byPlayer: Record<string, number[]> = {}
  for (const row of data) {
    if (!byPlayer[row.player_name]) byPlayer[row.player_name] = [0, 0, 0, 0, 0]
    byPlayer[row.player_name][0] += row.dist_speed_z1 ?? 0
    byPlayer[row.player_name][1] += row.dist_speed_z2 ?? 0
    byPlayer[row.player_name][2] += row.dist_speed_z3 ?? 0
    byPlayer[row.player_name][3] += row.dist_speed_z4 ?? 0
    byPlayer[row.player_name][4] += row.dist_speed_z5 ?? 0
  }

  const chartData = Object.entries(byPlayer).map(([name, zones]) => ({
    name,
    'Z1 (<10)': Math.round(zones[0]),
    'Z2 (10-14)': Math.round(zones[1]),
    'Z3 (14-18)': Math.round(zones[2]),
    'Z4 (18-22)': Math.round(zones[3]),
    'Z5 (>22)': Math.round(zones[4]),
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `${v}m`} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#D1D5DB', fontSize: 11 }} width={120} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
        {['Z1 (<10)', 'Z2 (10-14)', 'Z3 (14-18)', 'Z4 (18-22)', 'Z5 (>22)'].map((zone, i) => (
          <Bar key={zone} dataKey={zone} stackId="a" fill={ZONE_COLORS[i]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
