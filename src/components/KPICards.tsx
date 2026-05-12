import { MatchStat } from '@/lib/types'

interface Props {
  data: MatchStat[]
}

function avg(vals: (number | null)[]) {
  const valid = vals.filter((v): v is number => v !== null)
  if (!valid.length) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default function KPICards({ data }: Props) {
  const kpis = [
    { label: 'Distancia Prom', value: `${Math.round(avg(data.map((d) => d.distance_m)))}m`, color: 'text-emerald-400' },
    { label: 'Top Speed Prom', value: `${avg(data.map((d) => d.top_speed_kmh)).toFixed(1)} km/h`, color: 'text-cyan-400' },
    { label: 'Player Load Prom', value: avg(data.map((d) => d.player_load)).toFixed(1), color: 'text-yellow-400' },
    { label: 'Sprint Dist Prom', value: `${Math.round(avg(data.map((d) => d.sprint_distance_m)))}m`, color: 'text-purple-400' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 text-xs uppercase tracking-wide">{kpi.label}</div>
          <div className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</div>
        </div>
      ))}
    </div>
  )
}
