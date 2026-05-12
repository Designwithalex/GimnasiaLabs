'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ loaded: number; discarded: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Upload Match CSV</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Solo se importan jugadores con ≥60 minutos de juego (Duration ≥ 3600s).
        </p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Cargar archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${dragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-700 hover:border-gray-500'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
            />
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-300 font-medium">Arrastrá un CSV aquí o hacé click para elegir</p>
            <p className="text-gray-500 text-sm mt-1">Formatos: CSV exportado desde GPS tracking</p>
          </div>

          {loading && (
            <div className="mt-4 text-center text-emerald-400 animate-pulse">Procesando CSV...</div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg">
              <p className="text-emerald-400 font-semibold">✓ Upload exitoso</p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{result.loaded}</div>
                  <div className="text-gray-400">Cargadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{result.discarded}</div>
                  <div className="text-gray-400">Descartadas (&lt;60min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-300">{result.total}</div>
                  <div className="text-gray-400">Total filas</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 font-semibold">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 text-base">Columnas esperadas del CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-400">
            {[
              'Name / Player Name',
              'Session Title',
              'Date',
              'Duration (seconds)',
              'Distance (metres)',
              'Sprint Distance (m)',
              'Player Load',
              'Top Speed (km/h)',
              'Power Score (w/kg)',
              'Work Ratio',
              'Hr Max (bpm)',
              'Hr Load',
              'Time In Red Zone (min)',
              'Max Deceleration (m/s/s)',
              'Max Acceleration (m/s/s)',
              'Distance in Speed Zone 1-5 (metres)',
              'Time in Speed Zone 1-5 (seconds)',
            ].map((col) => (
              <div key={col} className="flex items-center gap-2">
                <span className="text-emerald-500">→</span> {col}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
