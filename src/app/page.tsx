'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MatchStat } from '@/lib/types'
import KPICards from '@/components/KPICards'
import PlayerTable from '@/components/PlayerTable'
import dynamic from 'next/dynamic'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RadarPlayerChart = dynamic(() => import('@/components/charts/RadarPlayerChart'), { ssr: false })
const DistanceBarChart = dynamic(() => import('@/components/charts/DistanceBarChart'), { ssr: false })
const EvolutionLineChart = dynamic(() => import('@/components/charts/EvolutionLineChart'), { ssr: false })
const SpeedZoneChart = dynamic(() => import('@/components/charts/SpeedZoneChart'), { ssr: false })

type EvolutionMetric = 'distance_m' | 'top_speed_kmh' | 'player_load' | 'sprint_distance_m' | 'power_score'

export default function DashboardPage() {
  const [allData, setAllData] = useState<MatchStat[]>([])
  const [loading, setLoading] = useState(true)
  const [matchFilter, setMatchFilter] = useState('all')
  const [familyFilter, setFamilyFilter] = useState('all')
  const [subFamilyFilter, setSubFamilyFilter] = useState('all')
  const [playerFilter, setPlayerFilter] = useState('all')
  const [evoMetric, setEvoMetric] = useState<EvolutionMetric>('distance_m')

  useEffect(() => {
    supabase.from('match_stats').select('*').then(({ data }) => {
      setAllData((data as MatchStat[]) ?? [])
      setLoading(false)
    })
  }, [])

  const matches = Array.from(new Set(allData.map((d) => d.match_name))).sort()
  const players = Array.from(new Set(allData.map((d) => d.player_name))).sort()

  const SUB_FAMILY_ORDER = ['Front Row', 'Locks', 'Back Row', 'Inside Backs', 'Outside Backs']
  const subFamilies = SUB_FAMILY_ORDER.filter((sf) =>
    allData.some((d) => d.sub_family === sf)
  )

  let filtered = allData
  if (matchFilter !== 'all') filtered = filtered.filter((d) => d.match_name === matchFilter)
  if (familyFilter !== 'all') filtered = filtered.filter((d) => d.family === familyFilter)
  if (subFamilyFilter !== 'all') filtered = filtered.filter((d) => d.sub_family === subFamilyFilter)
  if (playerFilter !== 'all') filtered = filtered.filter((d) => d.player_name === playerFilter)

  const evoMetrics: { value: EvolutionMetric; label: string }[] = [
    { value: 'distance_m', label: 'Distancia' },
    { value: 'top_speed_kmh', label: 'Top Speed' },
    { value: 'player_load', label: 'Player Load' },
    { value: 'sprint_distance_m', label: 'Sprint Dist' },
    { value: 'power_score', label: 'Power Score' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-400 animate-pulse text-lg">
        Cargando datos...
      </div>
    )
  }

  if (allData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-4xl">📊</div>
        <p className="text-gray-400 text-lg">No hay datos aún.</p>
        <a href="/upload" className="text-emerald-400 hover:text-emerald-300 underline">
          Subir primer CSV →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <span className="text-sm text-gray-500">{filtered.length} registros</span>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Partido</span>
          <Select value={matchFilter} onValueChange={(v) => setMatchFilter(v ?? 'all')}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-gray-100">
              <SelectValue placeholder="Todos los partidos" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todos los partidos</SelectItem>
              {matches.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Familia</span>
          <Select value={familyFilter} onValueChange={(v) => { setFamilyFilter(v ?? 'all'); setSubFamilyFilter('all') }}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-gray-100">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="back">Backs</SelectItem>
              <SelectItem value="forward">Forwards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Línea</span>
          <Select value={subFamilyFilter} onValueChange={(v) => setSubFamilyFilter(v ?? 'all')}>
            <SelectTrigger className="w-44 bg-gray-900 border-gray-700 text-gray-100">
              <SelectValue placeholder="Todas las líneas" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todas las líneas</SelectItem>
              {subFamilies.map((sf) => <SelectItem key={sf} value={sf}>{sf}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jugador</span>
          <Select value={playerFilter} onValueChange={(v) => setPlayerFilter(v ?? 'all')}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-gray-100">
              <SelectValue placeholder="Todos los jugadores" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todos los jugadores</SelectItem>
              {players.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <KPICards data={filtered} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-base">Backs vs Forwards — Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarPlayerChart data={filtered} />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-100 text-base">Evolución por partido</CardTitle>
            <Select value={evoMetric} onValueChange={(v) => setEvoMetric((v ?? 'distance_m') as EvolutionMetric)}>
              <SelectTrigger className="w-36 h-7 text-xs bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {evoMetrics.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <EvolutionLineChart data={allData} metric={evoMetric} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Distancia por jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <DistanceBarChart data={filtered} />
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Distribución por zonas de velocidad</CardTitle>
        </CardHeader>
        <CardContent>
          <SpeedZoneChart data={filtered} />
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Tabla resumen de jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerTable data={filtered} />
        </CardContent>
      </Card>

    </div>
  )
}
