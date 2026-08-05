import { useMemo } from 'react'

const CARD_DEFS = [
  { key: 'total', label: 'Total Equipment', accent: 'border-cat-yellow' },
  { key: 'active', label: 'Active', accent: 'border-green-500' },
  { key: 'idle', label: 'Idle', accent: 'border-yellow-500' },
  { key: 'overdue', label: 'Overdue', accent: 'border-red-500' },
]

export default function SummaryCards({ equipment }) {
  // Recomputed on every render from current state — no separate counters to keep in sync.
  const counts = useMemo(() => {
    return equipment.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.status === 'Active') acc.active += 1
        else if (item.status === 'Idle') acc.idle += 1
        else if (item.status === 'Overdue') acc.overdue += 1
        return acc
      },
      { total: 0, active: 0, idle: 0, overdue: 0 }
    )
  }, [equipment])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CARD_DEFS.map(({ key, label, accent }) => (
        <div
          key={key}
          className={`bg-white rounded-lg shadow-card border-t-4 ${accent} px-5 py-4`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="font-display text-3xl mt-2 text-cat-black">{counts[key]}</p>
        </div>
      ))}
    </div>
  )
}
