import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const BAR_COLOR = '#FFC500'
const BAR_COLOR_ALT = '#101010'

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-card px-5 py-4">
      <h2 className="font-display text-sm tracking-wide text-cat-black mb-3">{title}</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function ChartsSection({ equipment }) {
  const topIdleCost = useMemo(() => {
    return [...equipment]
      .sort((a, b) => Number(b.idle_cost_total ?? 0) - Number(a.idle_cost_total ?? 0))
      .slice(0, 10)
      .map((row) => ({
        equipment_id: row.equipment_id,
        idle_cost_total: Number(row.idle_cost_total ?? 0),
      }))
  }, [equipment])

  const engineHoursBySite = useMemo(() => {
    const totals = new Map()
    for (const row of equipment) {
      const site = row.site_id ?? 'Unassigned'
      totals.set(site, (totals.get(site) ?? 0) + Number(row.engine_hours_day ?? 0))
    }
    return [...totals.entries()]
      .map(([site_id, total_engine_hours]) => ({ site_id, total_engine_hours }))
      .sort((a, b) => b.total_engine_hours - a.total_engine_hours)
  }, [equipment])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="TOP 10 IDLE COST BY EQUIPMENT">
        <BarChart data={topIdleCost} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="equipment_id" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Idle Cost']} />
          <Bar dataKey="idle_cost_total" radius={[4, 4, 0, 0]}>
            {topIdleCost.map((entry) => (
              <Cell key={entry.equipment_id} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="TOTAL ENGINE HOURS BY SITE">
        <BarChart data={engineHoursBySite} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="site_id" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} hrs`, 'Engine Hours']} />
          <Bar dataKey="total_engine_hours" radius={[4, 4, 0, 0]}>
            {engineHoursBySite.map((entry) => (
              <Cell key={entry.site_id} fill={BAR_COLOR_ALT} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  )
}
