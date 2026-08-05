import { Wrench, AlertOctagon, CalendarClock, Clock3, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import { getMaintenanceKpis, getMaintenanceSchedule } from '@/data/mockData';
import { cn, formatDate, downloadCSV } from '@/lib/utils';

export default function Analytics() {
  const kpis = getMaintenanceKpis();
  const schedule = getMaintenanceSchedule();

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
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Wrench} label="In Maintenance Now" value={kpis.inMaintenance} tone="danger" />
        <KpiCard icon={AlertOctagon} label="Overdue Service" value={kpis.overdue} tone="danger" />
        <KpiCard icon={CalendarClock} label="Due This Week" value={kpis.dueThisWeek} tone="warning" />
        <KpiCard icon={Clock3} label="Avg. Days Since Service" value={kpis.avgDaysSinceService} tone="default" />
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
                  <TH>Site</TH>
                  <TH>Last Service</TH>
                  <TH>Next Service Due</TH>
                  <TH>Days Until Due</TH>
                </TR>
              </THead>
              <TBody>
                {schedule.map((e) => (
                  <TR key={e.id}>
                    <TD className="font-semibold text-cat-black">{e.id}</TD>
                    <TD>{e.type}</TD>
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
