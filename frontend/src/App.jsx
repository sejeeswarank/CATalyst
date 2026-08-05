import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import SummaryCards from './components/SummaryCards'
import AlertsFeed from './components/AlertsFeed'
import EquipmentTable from './components/EquipmentTable'
import ChartsSection from './components/ChartsSection'

const MAX_ALERTS = 10

export default function App() {
  const [equipment, setEquipment] = useState([])
  const [alerts, setAlerts] = useState([])
  const [flashIds, setFlashIds] = useState({}) // equipment_id -> flash token, drives the row highlight
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initial load from the cost-enriched view — never the raw table, so idle_cost_total
  // and is_overdue come pre-computed straight from Postgres.
  useEffect(() => {
    let cancelled = false

    async function loadEquipment() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('equipment_with_cost')
        .select('*')
        .order('equipment_id', { ascending: true })

      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setEquipment(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    loadEquipment()
    return () => {
      cancelled = true
    }
  }, [])

  const flashRow = useCallback((equipmentId) => {
    setFlashIds((prev) => ({ ...prev, [equipmentId]: Date.now() }))
  }, [])

  const pushAlert = useCallback((equipmentId, status) => {
    const message = `${equipmentId} flagged ${status}`
    const alert = {
      id: `${equipmentId}-${Date.now()}`,
      message,
      timestamp: new Date(),
    }
    setAlerts((prev) => [alert, ...prev].slice(0, MAX_ALERTS))
  }, [])

  // Realtime: subscribe once to UPDATEs on the raw equipment table and patch the
  // matching row in state in place. We deliberately never re-fetch here — the
  // update payload only carries raw-table columns, so computed view columns
  // (idle_cost_total, is_overdue) simply carry over from the last full fetch.
  useEffect(() => {
    const channel = supabase
      .channel('equipment-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'equipment' },
        (payload) => {
          const updated = payload.new
          if (!updated?.equipment_id) return

          setEquipment((prev) => {
            const index = prev.findIndex((row) => row.equipment_id === updated.equipment_id)
            if (index === -1) return prev // row isn't in the current view snapshot, ignore

            const previousRow = prev[index]
            if (previousRow.status !== updated.status && (updated.status === 'Idle' || updated.status === 'Overdue')) {
              pushAlert(updated.equipment_id, updated.status)
            }

            const next = [...prev]
            next[index] = { ...previousRow, ...updated }
            return next
          })

          flashRow(updated.equipment_id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [flashRow, pushAlert])

  return (
    <div className="min-h-screen bg-cat-light">
      <header className="bg-cat-black text-white shadow-lg">
        <div className="mx-auto max-w-[1400px] px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight text-cat-yellow">
              Smart Rental Tracking System
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Live equipment utilization &amp; idle-cost monitoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
            Realtime connected
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 shadow-card">
            Failed to load equipment data: {error}
          </div>
        )}

        <SummaryCards equipment={equipment} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <EquipmentTable equipment={equipment} loading={loading} flashIds={flashIds} />
            <ChartsSection equipment={equipment} />
          </div>
          <div className="xl:col-span-1">
            <AlertsFeed alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
