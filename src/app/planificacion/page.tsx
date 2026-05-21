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

  // Compute totals from match averages × pct for the save preview
  const rows = buildRows(allData)
  const totals = rows.reduce(
    (acc, r) => ({
      distance_m: acc.distance_m + r.distance_m,
      sprint_distance_m: acc.sprint_distance_m + r.sprint_distance_m,
      player_load: acc.player_load + r.player_load,
    }),
    { distance_m: 0, sprint_distance_m: 0, player_load: 0 }
  )
  const scaled = {
    distance_m: Math.round(totals.distance_m * pct / 100),
    sprint_distance_m: Math.round(totals.sprint_distance_m * pct / 100),
    player_load: Math.round(totals.player_load * pct / 100 * 10) / 10,
  }

  function handleSave() {
    const id = `${logYear}-W${logWeek}-${logDay}`
    const session: TrainingSession = {
      id,
      year: logYear,
      week: logWeek,
      day: logDay,
      distance_m: scaled.distance_m,
      sprint_distance_m: scaled.sprint_distance_m,
      player_load: scaled.player_load,
    }
    const updated = [...sessions.filter((s) => s.id !== id), session]
    saveSessions(updated)
    setSessions(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete(id: string) {
    const updated = sessions.filter((s) => s.id !== id)
    saveSessions(updated)
    setSessions(updated)
  }

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

      {/* Reference + target tables */}
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

      {/* Session logger */}
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

            {/* Preview */}
            {allData.length > 0 && rows.length > 0 && (
              <div className="bg-gray-800/60 rounded-lg p-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Distancia total</span>
                  <p className="text-emerald-400 font-bold text-lg">{scaled.distance_m.toLocaleString('es-AR')} m</p>
                </div>
                <div>
                  <span className="text-gray-400">Dist. alta vel.</span>
                  <p className="text-cyan-400 font-bold text-lg">{scaled.sprint_distance_m.toLocaleString('es-AR')} m</p>
                </div>
                <div>
                  <span className="text-gray-400">Player Load</span>
                  <p className="text-amber-400 font-bold text-lg">{scaled.player_load.toFixed(1)}</p>
                </div>
                <div className="text-xs text-gray-500 self-end pb-1">
                  {pct}% del promedio de partido — Semana {logWeek} · {logDay}
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

      {/* Annual chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Historial de planificación anual</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingVolumeChart sessions={sessions} />
          {sessions.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                Ver / eliminar sesiones guardadas ({sessions.length})
              </summary>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {[...sessions].sort((a, b) => a.year !== b.year ? b.year - a.year : b.week - a.week).map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-1.5 rounded bg-gray-800/50 text-xs text-gray-400">
                    <span className="capitalize">{s.year} · Sem {s.week} · {s.day}</span>
                    <span className="text-gray-500">{s.distance_m.toLocaleString('es-AR')} m</span>
                    <button
                      onClick={() => handleDelete(s.id)}
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
