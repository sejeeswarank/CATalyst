import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, AlertOctagon, CalendarClock, Clock3, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import VehicleIcon from '@/components/common/VehicleIcon';
import Loader from '@/components/Loader';
import { useAppData } from '@/state/AppDataContext';
import { cn, formatDate, downloadCSV } from '@/lib/utils';

export default function Analytics() {
  const navigate = useNavigate();
  const { loading, getMaintenanceKpis, getMaintenanceSchedule } = useAppData();
  const kpis = getMaintenanceKpis();
  const schedule = getMaintenanceSchedule();
  const [filter, setFilter] = useState(null);

  if (loading) return <Loader />;

  const filtered = filter
    ? schedule.filter((e) => {
        if (filter === 'maintenance') return e.status === 'Maintenance';
        if (filter === 'overdue') return e.daysUntilService < 0;
        if (filter === 'due-soon') return e.daysUntilService >= 0 && e.daysUntilService <= 7;
        return true;
      })
    : schedule;

  const exportSchedule = () =>
    downloadCSV(
      'catalyst-maintenance-schedule.csv',
      schedule.map((e) => ({
        id: e.id,
        type: e.type,
        site: e.siteName,
        status: e.status,
        lastService: formatDate(e.lastServiceDate),
        nextServiceDue: formatDate(e.nextServiceDue),
        daysUntilDue: e.daysUntilService,
        reason: e.maintenanceReason ?? '',
      }))
    );

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fleet Intelligence"
        title="Vehicle Maintenance Analysis"
        subtitle="Service schedules, overdue machines, and maintenance workload across the fleet."
        bgImage="/hero-equipment.png"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          onClick={() => setFilter(filter === 'maintenance' ? null : 'maintenance')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            filter === 'maintenance' ? 'border-danger bg-danger/10' : 'border-border'
          )}
        >
          <Wrench className="h-5 w-5 text-danger" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">In Maintenance Now</p>
            <p className="font-display text-2xl text-cat-black">{kpis.inMaintenance}</p>
          </div>
        </div>

        <div
          onClick={() => setFilter(filter === 'overdue' ? null : 'overdue')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            filter === 'overdue' ? 'border-danger bg-danger/10' : 'border-border'
          )}
        >
          <AlertOctagon className="h-5 w-5 text-danger" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Overdue Service</p>
            <p className="font-display text-2xl text-cat-black">{kpis.overdue}</p>
          </div>
        </div>

        <div
          onClick={() => setFilter(filter === 'due-soon' ? null : 'due-soon')}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            filter === 'due-soon' ? 'border-cat-yellow bg-cat-yellow/10' : 'border-border'
          )}
        >
          <CalendarClock className="h-5 w-5 text-warning" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Due This Week</p>
            <p className="font-display text-2xl text-cat-black">{kpis.dueThisWeek}</p>
          </div>
        </div>

        <div
          onClick={() => setFilter(null)}
          className={cn(
            'flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all hover:shadow-md',
            filter === null ? 'border-cat-yellow bg-cat-yellow/10' : 'border-border'
          )}
        >
          <Clock3 className="h-5 w-5 text-cat-slate" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">Avg. Days Since Service</p>
            <p className="font-display text-2xl text-cat-black">{kpis.avgDaysSinceService}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <Button variant="outline" size="sm" onClick={exportSchedule}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Equipment ID</TH>
                  <TH>Type</TH>
                  <TH>Image</TH>
                  <TH>Site</TH>
                  <TH>Last Service</TH>
                  <TH>Next Service Due</TH>
                  <TH>Days Until Due</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((e) => (
                  <TR key={e.id}>
                    <TD className="font-semibold text-cat-black">{e.id}</TD>
                    <TD>{e.type}</TD>
                    <TD><VehicleIcon type={e.type} className="h-24 w-24" /></TD>
                    <TD>{e.siteName}</TD>
                    <TD>{formatDate(e.lastServiceDate)}</TD>
                    <TD>{formatDate(e.nextServiceDue)}</TD>
                    <TD>
                      {e.daysUntilService < 0 ? (
                        <Badge variant="danger" dot>{Math.abs(e.daysUntilService)}d overdue</Badge>
                      ) : (
                        <span className={cn(e.daysUntilService <= 7 && 'font-semibold text-warning-fg')}>
                          {e.daysUntilService}d
                        </span>
                      )}
                    </TD>
                    <TD className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/equipment/${e.id}`)}>
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
