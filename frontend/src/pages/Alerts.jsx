import { useState } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import AlertsMiniTable from '@/components/dashboard/AlertsMiniTable';
import { getAlertKpis, getRentalAlerts, getEquipmentAlerts } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const kpis = getAlertKpis();
  const [view, setView] = useState('rental');

  const rentalAlerts = getRentalAlerts();
  const equipmentAlerts = getEquipmentAlerts();
  const activeAlerts = view === 'rental' ? rentalAlerts : equipmentAlerts;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fleet Monitoring"
        title="Alerts & Anomalies"
        subtitle="Rule-based alerts generated from live fleet telemetry."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={ListFilter} label="Total Alerts" value={kpis.total} tone="default" />
        <KpiCard icon={AlertOctagon} label="Critical Alerts" value={kpis.critical} tone="danger" />
        <KpiCard icon={AlertTriangle} label="Warning Alerts" value={kpis.warning} tone="warning" />
        <KpiCard icon={CheckCircle2} label="Resolved Alerts" value={kpis.resolved} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{view === 'rental' ? 'Rental Alerts' : 'Equipment Alerts'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setView('rental')}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                view === 'rental' ? 'bg-cat-yellow text-cat-black' : 'bg-background text-cat-slate hover:bg-cat-black/5'
              )}
            >
              Rental Alerts <span className="opacity-70">({rentalAlerts.length})</span>
            </button>
            <button
              onClick={() => setView('equipment')}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                view === 'equipment' ? 'bg-cat-yellow text-cat-black' : 'bg-background text-cat-slate hover:bg-cat-black/5'
              )}
            >
              Equipment Alerts <span className="opacity-70">({equipmentAlerts.length})</span>
            </button>
          </div>

          <AlertsMiniTable
            alerts={activeAlerts}
            isRentalView={view === 'rental'}
            emptyLabel={view === 'rental' ? 'No rentals ending soon or overdue.' : 'No equipment alerts right now.'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
