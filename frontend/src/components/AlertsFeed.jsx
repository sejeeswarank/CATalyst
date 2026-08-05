function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AlertsFeed({ alerts }) {
  return (
    <div className="bg-white rounded-lg shadow-card h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-display text-sm tracking-wide text-cat-black">LIVE ALERTS</h2>
        <p className="text-xs text-gray-500 mt-0.5">Status changes to Idle / Overdue</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-gray-100">
        {alerts.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">
            No alerts yet — watching for status changes.
          </p>
        )}
        {alerts.map((alert) => (
          <div key={alert.id} className="px-4 py-3">
            <p className="text-sm text-cat-black font-medium">{alert.message}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatTime(alert.timestamp)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
