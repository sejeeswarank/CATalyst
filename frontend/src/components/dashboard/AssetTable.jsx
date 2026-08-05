import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import VehicleIcon from '@/components/common/VehicleIcon';
import { formatDate, cn } from '@/lib/utils';

const STATUS_OPTIONS = ['All', 'Running', 'Idle', 'Available', 'Booked', 'Maintenance'];

function matchesView(e, view) {
  if (view === 'booked') return e.isRented && e.status !== 'Running';
  if (view === 'using') return e.isRented && e.status === 'Running';
  return true;
}

export default function AssetTable({ data, filterable = false, paginated = false, pageSize = 10, limit, initialQuery = '' }) {
  const navigate = useNavigate();
  const [view, setView] = useState('all');
  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const views = useMemo(
    () => [
      { key: 'all', label: 'All Equipment', count: data.length },
      { key: 'using', label: 'Booked & Using', count: data.filter((e) => matchesView(e, 'using')).length },
      { key: 'booked', label: 'Booked & Not Using', count: data.filter((e) => matchesView(e, 'booked')).length },
    ],
    [data]
  );

  const filtered = useMemo(() => {
    let rows = data;
    if (filterable) {
      rows = rows.filter((e) => matchesView(e, view));
      if (view === 'all' && status !== 'All') rows = rows.filter((e) => e.status === status);
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        rows = rows.filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q) ||
            e.siteName.toLowerCase().includes(q) ||
            e.siteId.toLowerCase().includes(q)
        );
      }
    }
    return rows;
  }, [data, filterable, view, status, query]);

  const visible = limit ? filtered.slice(0, limit) : filtered;
  const totalPages = paginated ? Math.max(1, Math.ceil(visible.length / pageSize)) : 1;
  const pageRows = paginated ? visible.slice((page - 1) * pageSize, page * pageSize) : visible;

  return (
    <div>
      {filterable && (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => { setView(v.key); setPage(1); }}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                  v.key === view ? 'bg-cat-yellow text-cat-black' : 'bg-background text-cat-slate hover:bg-cat-black/5'
                )}
              >
                {v.label} <span className="opacity-70">({v.count})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat-slate" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search ID, type or site…"
                className="pl-9"
              />
            </div>
            {view === 'all' && (
              <Select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="sm:w-48"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
                ))}
              </Select>
            )}
            <span className="text-sm text-cat-slate sm:ml-auto">{filtered.length} of {data.length} machines</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white">
        <Table>
          <THead>
            <TR>
              <TH>Equipment ID</TH>
              <TH>Vehicle Type</TH>
              <TH>Image</TH>
              <TH>Site ID</TH>
              <TH>Status</TH>
              <TH>Operator ID</TH>
              <TH>Check-In</TH>
              <TH>Check-Out</TH>
              <TH>Engine Hrs Today</TH>
              <TH>Idle Hrs Today</TH>
              <TH>Rental Days</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {pageRows.map((e) => {
              const isBookedNotUsing = view === 'booked' || (e.isRented && e.status !== 'Running');
              return (
                <TR key={e.id}>
                  <TD className="font-semibold text-cat-black">{e.id}</TD>
                  <TD>{e.type}</TD>
                  <TD><VehicleIcon type={e.type} className="h-16 w-16" /></TD>
                  <TD>{e.siteId}</TD>
                  <TD><StatusBadge status={e.status} /></TD>
                  <TD>{e.operatorId ?? <span className="text-cat-slate">—</span>}</TD>
                  <TD>{e.checkInDate ? formatDate(e.checkInDate) : '—'}</TD>
                  <TD>{e.checkOutDate ? formatDate(e.checkOutDate) : '—'}</TD>
                  <TD>
                    {isBookedNotUsing ? (
                      <span className="text-cat-slate">—</span>
                    ) : (
                      `${e.engineHoursToday.toFixed(1)}h`
                    )}
                  </TD>
                  <TD className={cn(!isBookedNotUsing && e.idleHoursToday > 4 && 'font-semibold text-warning-fg')}>
                    {isBookedNotUsing ? (
                      <span className="text-cat-slate">—</span>
                    ) : (
                      `${e.idleHoursToday.toFixed(1)}h`
                    )}
                  </TD>
                  <TD className={cn(e.rentalDaysLeft !== null && e.rentalDaysLeft < 0 && 'font-semibold text-danger')}>
                    {e.rentalDaysLeft === null ? '—' : `${e.rentalDaysLeft} days`}
                  </TD>
                  <TD className="text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/equipment/${e.id}`)}>
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </TD>
                </TR>
              );
            })}
            {pageRows.length === 0 && (
              <TR>
                <TD colSpan={12} className="py-10 text-center text-cat-slate">
                  No equipment matches these filters.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-cat-slate">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
