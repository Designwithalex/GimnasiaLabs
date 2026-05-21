'use client'

import { useState } from 'react'
import { MatchStat } from '@/lib/types'
import { buildRows, RowData } from '@/lib/matchAverages'

interface Props {
  data: MatchStat[]
  pct?: number
  onPctChange?: (v: number) => void
}

function round(val: number, precision: number): number {
  return Math.round(val / precision) * precision
}

const thClass = 'py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap text-right first:text-left'
const tdClass = 'py-2 px-3 text-sm text-gray-200 text-right first:text-left first:font-medium first:text-gray-100'

export default function MatchAverageTables({ data, pct: externalPct, onPctChange }: Props) {
  const [internalPct, setInternalPct] = useState(100)
  const pct = externalPct !== undefined ? externalPct : internalPct
  const setPct = onPctChange ?? setInternalPct

  const rows: RowData[] = buildRows(data)

  if (!rows.length) return null

  const totalMatches = data.length > 0
    ? Math.max(...['Front Row', 'Locks', 'Back Row', 'Inside Backs', 'Outside Backs'].map((sf) => {
        const matches = new Set(data.filter((d) => d.sub_family === sf).map((d) => d.match_name))
        return matches.size
      }))
    : 0

  function apply(val: number, precision: number): number {
    return round(val * (pct / 100), precision)
  }

  return (
    <div className="space-y-6">
      {/* Table 1 — match averages */}
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="text-base font-semibold text-gray-100">Promedio por partido — por línea</h3>
          <span className="text-xs text-gray-500">{totalMatches} partido{totalMatches !== 1 ? 's' : ''} cargado{totalMatches !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className={thClass}>Puesto</th>
                <th className={thClass}>Distancia Total (m)</th>
                <th className={thClass}>Dist. Alta Vel. (m)</th>
                <th className={thClass}>Vel. Máx (km/h)</th>
                <th className={thClass}>Aceleraciones</th>
                <th className={thClass}>Acel. Máx (m/s²)</th>
                <th className={thClass}>Esfuerzos Alta Int.</th>
                <th className={thClass}>Player Load</th>
                <th className={thClass}>Tiempo (min)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sub_family} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                  <td className={tdClass}>{row.sub_family}</td>
                  <td className={tdClass}>{round(row.distance_m, 100).toLocaleString('es-AR')}</td>
                  <td className={tdClass}>{round(row.sprint_distance_m, 50).toLocaleString('es-AR')}</td>
                  <td className={tdClass}>{row.top_speed_kmh.toFixed(1)}</td>
                  <td className={tdClass}>{round(row.power_plays, 5)}</td>
                  <td className={tdClass}>{row.max_acceleration.toFixed(1)}</td>
                  <td className={tdClass}>{round(row.impacts, 5)}</td>
                  <td className={tdClass}>{row.player_load.toFixed(1)}</td>
                  <td className={tdClass}>{Math.round((row.duration_seconds ?? 0) / 60)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2 — training target */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-100">Volumen promedio por partido — por línea</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className={thClass}>Puesto</th>
                <th className={thClass}>Distancia Total (m)</th>
                <th className={thClass}>Dist. Alta Vel. (m)</th>
                <th className={thClass}>Vel. Máx (km/h)</th>
                <th className={thClass}>Aceleraciones</th>
                <th className={thClass}>Acel. Máx (m/s²)</th>
                <th className={thClass}>Esfuerzos Alta Int.</th>
                <th className={thClass}>Player Load</th>
                <th className={thClass}>Tiempo (min)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sub_family} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                  <td className={tdClass}>{row.sub_family}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{apply(row.distance_m, 100).toLocaleString('es-AR')}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{apply(row.sprint_distance_m, 50).toLocaleString('es-AR')}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{(row.top_speed_kmh * pct / 100).toFixed(1)}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{apply(row.power_plays, 5)}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{(row.max_acceleration * pct / 100).toFixed(1)}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{apply(row.impacts, 5)}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{(row.player_load * pct / 100).toFixed(1)}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold text-emerald-400">{Math.round((row.duration_seconds ?? 0) * pct / 100 / 60)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
