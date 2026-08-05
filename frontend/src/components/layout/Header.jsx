import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, AlertTriangle } from 'lucide-react';
import { ALERTS } from '@/data/mockData';
import { cn, timeAgo } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/availability', label: 'Check Availability' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/forecast', label: 'Demand Forecast' },
  { to: '/settings', label: 'Fleet Setup' },
];

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const activeAlerts = ALERTS.filter((a) => a.status === 'Active').slice(0, 6);
  const activeCount = ALERTS.filter((a) => a.status === 'Active').length;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="20" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24L14 0L28 24H18.5L14 16L9.5 24H0Z" fill="#FFC72C" />
          </svg>
          <span className="font-display text-lg tracking-tight text-cat-black">
            CATALYST<sup className="text-[10px]">®</sup>
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'border-b-2 border-transparent pb-1 text-xs font-bold uppercase tracking-wide text-cat-slate transition-colors',
                  'hover:text-cat-black',
                  isActive && 'border-cat-black text-cat-black'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden w-full max-w-[200px] sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat-slate" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-cat-yellow focus:bg-white focus:ring-2 focus:ring-cat-yellow/30"
            />
          </form>

          <button onClick={handleSearch} className="flex h-9 w-9 items-center justify-center text-cat-black sm:hidden">
            <Search className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-cat-slate transition-colors hover:bg-background"
            >
              <Bell size={17} />
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-border bg-white p-2 text-cat-black shadow-card animate-fade-in">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-cat-slate">
                  Active Alerts
                </p>
                <div className="max-h-80 overflow-y-auto">
                  {activeAlerts.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-background">
                      <AlertTriangle
                        className={cn('mt-0.5 h-4 w-4 shrink-0', a.severity === 'critical' ? 'text-danger' : 'text-warning')}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-cat-black">{a.type}</p>
                        <p className="text-xs text-cat-slate">{a.equipmentId} · {timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); navigate('/alerts'); }}
                  className="mt-1 w-full rounded-lg py-2 text-center text-sm font-semibold text-cat-yellow-dark hover:bg-cat-yellow/10"
                >
                  View all alerts
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-border py-1.5 pl-1.5 pr-2.5 hover:bg-background">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-cat-black text-xs font-bold text-cat-yellow">
              RM
            </div>
            <span className="hidden text-sm font-medium text-cat-black sm:inline">Ravi Menon</span>
            <ChevronDown className="h-3.5 w-3.5 text-cat-slate" />
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full bg-cat-yellow" />
    </header>
  );
}
