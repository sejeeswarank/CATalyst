import { useState } from 'react';
import { FileText, FileSpreadsheet, Link2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';
import { EQUIPMENT, ALERTS, getKpis } from '@/data/mockData';
import { cn, downloadCSV } from '@/lib/utils';

const PERIODS = ['This Week', 'This Month', 'This Quarter', 'Year to Date'];

// cosmetic multipliers so each tab's numbers look period-appropriate
const SCALE = { 'This Week': 1, 'This Month': 4.3, 'This Quarter': 13, 'Year to Date': 32 };

export default function Analytics() {
  const [period, setPeriod] = useState(PERIODS[1]);
  const kpis = getKpis();
  const scale = SCALE[period];

  const engineHours = Math.round(EQUIPMENT.reduce((s, e) => s + e.engineHoursToday, 0) * scale);
  const idleHours = Math.round(EQUIPMENT.reduce((s, e) => s + e.idleHoursToday, 0) * scale);
  const idleCostAvoided = Math.round(idleHours * 62); // mock $/idle-hour saved via reassignment
  const utilizationPct = Math.round((kpis.running / kpis.total) * 100);

  const downloads = [
    {
      label: 'Fleet Equipment Export',
      ext: 'CSV',
      icon: FileSpreadsheet,
      action: () =>
        downloadCSV(
          'catalyst-fleet-equipment.csv',
          EQUIPMENT.map((e) => ({
            id: e.id,
            type: e.type,
            site: e.siteName,
            status: e.status,
            operator: e.operatorId ?? '',
            engineHoursToday: e.engineHoursToday,
            idleHoursToday: e.idleHoursToday,
            rentalDaysLeft: e.rentalDaysLeft ?? '',
            dailyRate: e.dailyRate,
          }))
        ),
    },
    {
      label: 'Alerts Log Export',
      ext: 'CSV',
      icon: FileText,
      action: () =>
        downloadCSV(
          'catalyst-alerts-log.csv',
          ALERTS.map((a) => ({
            id: a.id,
            type: a.type,
            equipmentId: a.equipmentId,
            site: a.site,
            severity: a.severity,
            status: a.status,
            timestamp: a.timestamp.toISOString(),
          }))
        ),
    },
    { label: 'Utilization Summary', ext: 'PDF', icon: Link2, disabled: true },
    { label: 'Rental Revenue Report', ext: 'XLSX', icon: ExternalLink, disabled: true },
  ];

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Fleet Intelligence" title="Analytics & Reports" subtitle="Period summaries, exports, and idle-cost tracking across the fleet." />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors',
              p === period ? 'bg-cat-yellow text-cat-black' : 'bg-cat-slate text-white hover:bg-cat-charcoal'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg text-cat-black">{period.toUpperCase()} REPORT</h2>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm normal-case text-cat-black">
              <li>Engine hours logged: <strong>{engineHours.toLocaleString()}h</strong></li>
              <li>Idle hours recorded: <strong>{idleHours.toLocaleString()}h</strong></li>
              <li>Estimated idle cost avoided by reassignment: <strong>${idleCostAvoided.toLocaleString()}</strong></li>
              <li>Fleet utilization: <strong>{utilizationPct}%</strong> running at time of report</li>
            </ul>
            <p className="mt-4 text-sm normal-case leading-relaxed text-cat-slate">
              CATalyst tracked {kpis.total} machines across 10 sites for the selected period, with{' '}
              {kpis.rented} currently rented and {kpis.maintenance} flagged for maintenance. Idle-hour
              alerts continue to be the leading driver of avoidable rental cost — see the Alerts page
              for equipment currently exceeding the idle-time threshold.
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cat-slate">Download</h3>
            <div className="mt-3 space-y-1">
              {downloads.map(({ label, ext, icon: Icon, action, disabled }) => (
                <button
                  key={label}
                  onClick={action}
                  disabled={disabled}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors',
                    disabled ? 'cursor-not-allowed text-cat-slate/50' : 'text-cat-black hover:bg-background'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-xs font-normal text-cat-slate">{ext}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
