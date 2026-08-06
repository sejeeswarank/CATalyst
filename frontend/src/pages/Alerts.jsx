import { useState } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import AlertsMiniTable from '@/components/dashboard/AlertsMiniTable';
import Loader from '@/components/Loader';
import { useAppData } from '@/state/AppDataContext';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const { loading, getAlertKpis, getRentalAlerts, getEquipmentAlerts } = useAppData();
  const kpis = getAlertKpis();
  const [view, setView] = useState('rental');
  const [severity, setSeverity] = useState(null);

  if (loading) return <Loader />;

  const rentalAlerts = getRentalAlerts();
  const equipmentAlerts = getEquipmentAlerts();
  const activeAlerts = view === 'rental' ? rentalAlerts : equipmentAlerts;

  const filtered = severity
    ? activeAlerts.filter((a) => severity === 'resolved' ? a.status === 'Resolved' : a.severity === severity)
    : activeAlerts;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fleet Monitoring"
        title="Alerts & Anomalies"
        subtitle="Rule-based alerts generated from live fleet telemetry."
        bgImage="/hero-equipment.png"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          onClick={() => setSeverity(null)}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            severity === null ? 'border-cat-yellow bg-cat-yellow/10' : 'border-border'
          )}
        >
          <ListFilter className="h-5 w-5 text-cat-slate" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Total Alerts</p>
            <p className="font-display text-2xl text-cat-black">{kpis.total}</p>
          </div>
        </div>

        <div
          onClick={() => setSeverity('critical')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            severity === 'critical' ? 'border-danger bg-danger/10' : 'border-border'
          )}
        >
          <AlertOctagon className="h-5 w-5 text-danger" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Critical Alerts</p>
            <p className="font-display text-2xl text-cat-black">{kpis.critical}</p>
          </div>
        </div>

        <div
          onClick={() => setSeverity('warning')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            severity === 'warning' ? 'border-cat-yellow bg-cat-yellow/10' : 'border-border'
          )}
        >
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Warning Alerts</p>
            <p className="font-display text-2xl text-cat-black">{kpis.warning}</p>
          </div>
        </div>

        <div
          onClick={() => setSeverity('resolved')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            severity === 'resolved' ? 'border-success bg-success/10' : 'border-border'
          )}
        >
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Resolved Alerts</p>
            <p className="font-display text-2xl text-cat-black">{kpis.resolved}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{view === 'rental' ? 'Rental Alerts' : 'Equipment Alerts'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setView('rental');
                setSeverity(null);
              }}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                view === 'rental' ? 'bg-cat-yellow text-cat-black' : 'bg-background text-cat-slate hover:bg-cat-black/5'
              )}
            >
              Rental Alerts <span className="opacity-70">({rentalAlerts.length})</span>
            </button>
            <button
              onClick={() => {
                setView('equipment');
                setSeverity(null);
              }}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                view === 'equipment' ? 'bg-cat-yellow text-cat-black' : 'bg-background text-cat-slate hover:bg-cat-black/5'
              )}
            >
              Equipment Alerts <span className="opacity-70">({equipmentAlerts.length})</span>
            </button>
          </div>

          <AlertsMiniTable
            alerts={filtered}
            isRentalView={view === 'rental'}
            emptyLabel={view === 'rental' ? 'No rentals ending soon or overdue.' : 'No equipment alerts right now.'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
