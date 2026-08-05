import { useMemo, useState } from 'react'

const COLUMNS = [
  { key: 'equipment_id', label: 'Equipment ID' },
  { key: 'type', label: 'Type' },
  { key: 'site_id', label: 'Site ID' },
  { key: 'check_in_date', label: 'Check-In' },
  { key: 'check_out_date', label: 'Check-Out' },
  { key: 'engine_hours_day', label: 'Engine Hrs/Day', numeric: true },
  { key: 'idle_hours_day', label: 'Idle Hrs/Day', numeric: true },
  { key: 'rental_days', label: 'Rental Days', numeric: true },
  { key: 'last_operator_id', label: 'Operator' },
  { key: 'status', label: 'Status' },
  { key: 'idle_cost_total', label: 'Idle Cost', numeric: true },
]

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-800 border border-green-300',
  Idle: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  Overdue: 'bg-red-100 text-red-800 border border-red-300',
  Unassigned: 'bg-gray-200 text-gray-700 border border-gray-300',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
  const amount = Number(value ?? 0)
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.Unassigned
      }`}
    >
      {status ?? 'Unassigned'}
    </span>
  )
}

export default function EquipmentTable({ equipment, loading, flashIds }) {
  const [sortKey, setSortKey] = useState('equipment_id')
  const [sortDir, setSortDir] = useState('asc')

  const sorted = useMemo(() => {
    const rows = [...equipment]
    rows.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
    return rows
  }, [equipment, sortKey, sortDir])

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="font-display text-sm tracking-wide text-cat-black">EQUIPMENT FLEET</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-cat-black text-white">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left font-semibold uppercase text-xs tracking-wide cursor-pointer select-none whitespace-nowrap hover:bg-cat-gray ${
                    col.numeric ? 'text-right' : ''
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 text-cat-yellow">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((row) => (
              <tr
                key={`${row.equipment_id}-${flashIds[row.equipment_id] ?? 0}`}
                className={flashIds[row.equipment_id] ? 'animate-rowflash' : ''}
              >
                <td className="px-4 py-3 font-medium text-cat-black whitespace-nowrap">
                  {row.equipment_id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.site_id ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.check_in_date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.check_out_date)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {Number(row.engine_hours_day ?? 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {Number(row.idle_hours_day ?? 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.rental_days}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.last_operator_id ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {formatCurrency(row.idle_cost_total)}
                </td>
              </tr>
            ))}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400">
                  No equipment records found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400">
                  Loading equipment data…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
