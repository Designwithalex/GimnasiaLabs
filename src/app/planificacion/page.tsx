'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MatchStat } from '@/lib/types'
import { buildRows } from '@/lib/matchAverages'
import MatchAverageTables from '@/components/MatchAverageTables'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrainingSession } from '@/components/charts/TrainingVolumeChart'

const TrainingVolumeChart = dynamic(
  () => import('@/components/charts/TrainingVolumeChart'),
  { ssr: false }
)

const LS_KEY = 'gl_training_plans'

const DAYS = ['lunes', 'martes', 'jueves'] as const
type Day = typeof DAYS[number]

function getCurrentWeek(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

function loadSessions(): TrainingSession[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveSessions(sessions: TrainingSession[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions))
}

export default function PlanificacionPage() {
  const [allData, setAllData] = useState<MatchStat[]>([])
  const [loading, setLoading] = useState(true)
  const [pct, setPct] = useState(100)
  const [sessions, setSessions] = useState<TrainingSession[]>([])

  const currentYear = new Date().getFullYear()
  const [logYear, setLogYear] = useState(currentYear)
  const [logWeek, setLogWeek] = useState(getCurrentWeek())
  const [logDay, setLogDay] = useState<Day>('lunes')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('match_stats').select('*').then(({ data }) => {
      setAllData((data as MatchStat[]) ?? [])
      setLoading(false)
    })
    setSessions(loadSessions())
  }, [])

  const rows = buildRows(allData)

  // Totals preview (sum across all sub-families × pct)
  const totals = rows.reduce(
    (acc, r) => ({
      distance_m: acc.distance_m + r.distance_m * pct / 100,
      sprint_distance_m: acc.sprint_distance_m + r.sprint_distance_m * pct / 100,
      player_load: acc.player_load + r.player_load * pct / 100,
    }),
    { distance_m: 0, sprint_distance_m: 0, player_load: 0 }
  )

  function handleSave() {
    // One entry per sub-family for this week+day
    const newEntries: TrainingSession[] = rows.map((row) => ({
      id: `${logYear}-W${logWeek}-${logDay}-${row.sub_family}`,
      year: logYear,
      week: logWeek,
      day: logDay,
      sub_family: row.sub_family,
      distance_m: Math.round(row.distance_m * pct / 100),
      sprint_distance_m: Math.round(row.sprint_distance_m * pct / 100),
      player_load: Math.round(row.player_load * pct / 100 * 10) / 10,
    }))

    // Upsert: remove old entries for same year+week+day, add new
    const kept = sessions.filter(
      (s) => !(s.year === logYear && s.week === logWeek && s.day === logDay)
    )
    const updated = [...kept, ...newEntries]
    saveSessions(updated)
    setSessions(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete(year: number, week: number, day: Day) {
    const updated = sessions.filter(
      (s) => !(s.year === year && s.week === week && s.day === day)
    )
    saveSessions(updated)
    setSessions(updated)
  }

  // Group sessions by year+week+day for the list display
  const sessionGroups = Object.values(
    sessions.reduce<Record<string, { year: number; week: number; day: Day; totalDistance: number }>>((acc, s) => {
      const key = `${s.year}-W${s.week}-${s.day}`
      if (!acc[key]) acc[key] = { year: s.year, week: s.week, day: s.day as Day, totalDistance: 0 }
      acc[key].totalDistance += s.distance_m
      return acc
    }, {})
  ).sort((a, b) => a.year !== b.year ? b.year - a.year : b.week - a.week)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-400 animate-pulse text-lg">
        Cargando datos...
      </div>
    )
  }

  const inputClass = 'bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Planificación</h1>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Referencia de partido &amp; volumen a entrenar</CardTitle>
        </CardHeader>
        <CardContent>
          {allData.length === 0 ? (
            <p className="text-gray-500 text-sm">Subí partidos para ver los promedios de referencia.</p>
          ) : (
            <MatchAverageTables data={allData} pct={pct} onPctChange={setPct} />
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Programar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Año</span>
                <input
                  type="number"
                  className={inputClass + ' w-24'}
                  value={logYear}
                  min={2020}
                  max={2030}
                  onChange={(e) => setLogYear(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Semana</span>
                <input
                  type="number"
                  className={inputClass + ' w-20'}
                  value={logWeek}
                  min={1}
                  max={52}
                  onChange={(e) => setLogWeek(Math.min(52, Math.max(1, Number(e.target.value))))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Día</span>
                <div className="flex gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setLogDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                        logDay === d
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {allData.length > 0 && rows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 w-fit">
                  <span className="text-xs text-gray-400">Volumen estimado</span>
                  <button onClick={() => setPct(Math.max(0, pct - 5))} className="w-6 h-6 rounded text-gray-300 hover:bg-gray-700 flex items-center justify-center text-base leading-none">−</button>
                  <input
                    type="number" min={0} max={200} value={pct}
                    onChange={(e) => setPct(Math.min(200, Math.max(0, Number(e.target.value))))}
                    className="w-14 text-center bg-transparent text-emerald-400 font-bold text-sm focus:outline-none"
                  />
                  <span className="text-emerald-400 font-bold text-sm">%</span>
                  <button onClick={() => setPct(Math.min(200, pct + 5))} className="w-6 h-6 rounded text-gray-300 hover:bg-gray-700 flex items-center justify-center text-base leading-none">+</button>
                  <span className="text-xs text-gray-500">del partido</span>
                </div>
                <div className="text-xs text-gray-500">{pct}% del promedio de partido · Semana {logWeek} · {logDay}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Línea</th>
                        <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Distancia (m)</th>
                        <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Dist. Alta Vel. (m)</th>
                        <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Player Load</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.sub_family} className="border-b border-gray-800/60">
                          <td className="py-2 px-3 font-medium text-gray-100">{row.sub_family}</td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-400">{Math.round(row.distance_m * pct / 100).toLocaleString('es-AR')}</td>
                          <td className="py-2 px-3 text-right font-semibold text-cyan-400">{Math.round(row.sprint_distance_m * pct / 100).toLocaleString('es-AR')}</td>
                          <td className="py-2 px-3 text-right font-semibold text-amber-400">{(row.player_load * pct / 100).toFixed(1)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-600">
                        <td className="py-2 px-3 text-xs font-bold text-gray-300 uppercase">Total</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-300">{Math.round(totals.distance_m).toLocaleString('es-AR')}</td>
                        <td className="py-2 px-3 text-right font-bold text-cyan-300">{Math.round(totals.sprint_distance_m).toLocaleString('es-AR')}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-300">{totals.player_load.toFixed(1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={rows.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saved ? '✓ Guardado' : 'Guardar sesión'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Historial de planificación anual</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingVolumeChart sessions={sessions} />
          {sessionGroups.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                Ver / eliminar sesiones guardadas ({sessionGroups.length})
              </summary>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {sessionGroups.map((g) => (
                  <div key={`${g.year}-W${g.week}-${g.day}`} className="flex items-center justify-between px-3 py-1.5 rounded bg-gray-800/50 text-xs text-gray-400">
                    <span className="capitalize">{g.year} · Sem {g.week} · {g.day}</span>
                    <span className="text-gray-500">{g.totalDistance.toLocaleString('es-AR')} m totales</span>
                    <button
                      onClick={() => handleDelete(g.year, g.week, g.day)}
                      className="text-red-500 hover:text-red-400 ml-4 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
