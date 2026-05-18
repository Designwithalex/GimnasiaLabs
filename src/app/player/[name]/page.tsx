'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MatchStat } from '@/lib/types'
import { use } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type MetricKey = 'distance_m' | 'top_speed_kmh' | 'player_load' | 'sprint_distance_m' | 'power_score' | 'hr_max_bpm' | 'time_red_zone_min'

const METRICS: { value: MetricKey; label: string }[] = [
  { value: 'distance_m', label: 'Distancia (m)' },
  { value: 'top_speed_kmh', label: 'Top Speed (km/h)' },
  { value: 'player_load', label: 'Player Load' },
  { value: 'sprint_distance_m', label: 'Sprint Distance (m)' },
  { value: 'power_score', label: 'Power Score (w/kg)' },
  { value: 'hr_max_bpm', label: 'HR Max (bpm)' },
  { value: 'time_red_zone_min', label: 'Tiempo Zona Roja (min)' },
]

export default function PlayerPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params)
  const playerName = decodeURIComponent(name)

  const [stats, setStats] = useState<MatchStat[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<MetricKey>('distance_m')

  useEffect(() => {
    supabase
      .from('match_stats')
      .select('*')
      .eq('player_name', playerName)
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        setStats((data as MatchStat[]) ?? [])
        setLoading(false)
      })
  }, [playerName])

  const family = stats[0]?.family ?? 'unknown'
  const subFamily = stats[0]?.sub_family ?? null
  const lineColor = family === 'back' ? '#10b981' : family === 'forward' ? '#06b6d4' : '#6b7280'

  const chartData = stats.map((s) => ({
    match: s.match_date || s.match_name,
    value: s[metric] as number | null,
  }))

  const familyBadge: Record<string, string> = {
    back: 'bg-emerald-900 text-emerald-300 border-emerald-700',
    forward: 'bg-cyan-900 text-cyan-300 border-cyan-700',
    unknown: 'bg-gray-800 text-gray-400 border-gray-700',
  }

  if (loading) {
    return <div className="text-center text-emerald-400 animate-pulse mt-20">Cargando...</div>
  }

  if (stats.length === 0) {
    return (
      <div className="text-center mt-20 space-y-4">
        <p className="text-gray-400">No se encontraron datos para <strong className="text-gray-100">{playerName}</strong>.</p>
        <Link href="/" className="text-emerald-400 hover:underline">← Volver al dashboard</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">← Dashboard</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{playerName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded border ${familyBadge[family]}`}>{family}</span>
            {subFamily && <span className="text-xs px-2 py-0.5 rounded border bg-gray-800 text-gray-300 border-gray-700">{subFamily}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Partidos', value: stats.length },
          { label: 'Distancia Prom', value: `${Math.round(stats.reduce((a, s) => a + (s.distance_m ?? 0), 0) / stats.length)}m` },
          { label: 'Top Speed Máx', value: `${Math.max(...stats.map((s) => s.top_speed_kmh ?? 0)).toFixed(1)} km/h` },
          { label: 'Player Load Prom', value: (stats.reduce((a, s) => a + (s.player_load ?? 0), 0) / stats.length).toFixed(1) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">{kpi.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: lineColor }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-100 text-base">Evolución partido a partido</CardTitle>
          <Select value={metric} onValueChange={(v) => setMetric((v ?? 'distance_m') as MetricKey)}>
            <SelectTrigger className="w-44 h-7 text-xs bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {METRICS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="match" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2.5}
                dot={{ fill: lineColor, strokeWidth: 0, r: 4 }}
                name={METRICS.find((m) => m.value === metric)?.label ?? metric}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Historial de partidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Partido', 'Fecha', 'Distancia', 'Top Speed', 'Player Load', 'Sprint', 'Power Score'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-gray-400 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-100 font-medium">{s.match_name}</td>
                    <td className="py-2 px-3 text-gray-400">{s.match_date ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{s.distance_m ? `${Math.round(s.distance_m)}m` : '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{s.top_speed_kmh ? `${s.top_speed_kmh.toFixed(1)} km/h` : '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{s.player_load?.toFixed(1) ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{s.sprint_distance_m ? `${Math.round(s.sprint_distance_m)}m` : '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{s.power_score?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
