import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Truck,
  CircleCheck,
  Activity,
  PauseCircle,
  CalendarClock,
  Wrench,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import AssetTable from '@/components/dashboard/AssetTable';
import UtilizationPieChart from '@/components/dashboard/charts/UtilizationPieChart';
import RentalDistributionPieChart from '@/components/dashboard/charts/RentalDistributionPieChart';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import Loader from '@/components/Loader';
import { useAppData } from '@/state/AppDataContext';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const {
    equipment, activity, loading, getKpis,
    getUtilizationBreakdown, getRentalDistributionByType,
  } = useAppData();
  const kpis = getKpis();

  if (loading) return <Loader />;

  const kpiCards = [
    { icon: Boxes, label: 'Total Equipment', value: kpis.total, tone: 'default' },
    { icon: Truck, label: 'Currently Rented', value: kpis.rented, tone: 'yellow' },
    { icon: CircleCheck, label: 'Available Equipment', value: kpis.available, tone: 'info' },
    { icon: Activity, label: 'Running Equipment', value: kpis.running, tone: 'success' },
    { icon: PauseCircle, label: 'Idle Equipment', value: kpis.idle, tone: 'warning' },
    { icon: CalendarClock, label: 'Rental Expiring Soon', value: kpis.expiringSoon, tone: 'warning' },
    { icon: Wrench, label: 'Maintenance Required', value: kpis.maintenance, tone: 'danger' },
    { icon: Users, label: 'Active Operators', value: kpis.activeOperators, tone: 'default' },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fleet Operations"
        title="Fleet Dashboard"
        subtitle="Live overview of every machine across all sites."
        bgImage="/hero-equipment.png"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Fleet Utilization</CardTitle></CardHeader>
          <CardContent>
            <UtilizationPieChart data={getUtilizationBreakdown()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rentals by Vehicle Type</CardTitle></CardHeader>
          <CardContent>
            <RentalDistributionPieChart data={getRentalDistributionByType()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="max-h-[260px] overflow-y-auto">
            <ActivityTimeline items={activity} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetTable data={equipment} filterable paginated pageSize={10} initialQuery={initialQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
