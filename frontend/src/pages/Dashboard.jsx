import { useNavigate } from 'react-router-dom';
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
import Button from '@/components/ui/button';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import AssetTable from '@/components/dashboard/AssetTable';
import { EQUIPMENT, getKpis } from '@/data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const kpis = getKpis();

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
        action={
          <Button variant="primary" onClick={() => navigate('/availability')}>
            Check Availability Status
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Fleet</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
            View all equipment →
          </Button>
        </CardHeader>
        <CardContent>
          <AssetTable data={EQUIPMENT} limit={8} />
        </CardContent>
      </Card>
    </div>
  );
}
