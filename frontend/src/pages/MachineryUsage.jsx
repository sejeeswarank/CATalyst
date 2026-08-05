import { useState, useMemo } from 'react';
import { Building2, Activity, Clock, Gauge, Truck, Search, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KpiCard from '@/components/dashboard/KpiCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { EQUIPMENT, SITES } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function MachineryUsage() {
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute stats per site
  const siteStats = useMemo(() => {
    return SITES.map((site) => {
      const siteEquipment = EQUIPMENT.filter((e) => e.siteId === site.id);
      const totalUnits = siteEquipment.length;
      const runningUnits = siteEquipment.filter((e) => e.status === 'Running').length;
      const idleUnits = siteEquipment.filter((e) => e.status === 'Idle').length;
      const availableUnits = siteEquipment.filter((e) => e.status === 'Available').length;
      const maintenanceUnits = siteEquipment.filter((e) => e.status === 'Maintenance').length;
      const totalEngineHrs = siteEquipment.reduce((sum, e) => sum + e.engineHoursToday, 0);
      const totalIdleHrs = siteEquipment.reduce((sum, e) => sum + e.idleHoursToday, 0);
      const avgEfficiency = totalEngineHrs + totalIdleHrs > 0 
        ? Math.round((totalEngineHrs / (totalEngineHrs + totalIdleHrs)) * 100) 
        : 0;

      return {
        ...site,
        totalUnits,
        runningUnits,
        idleUnits,
        availableUnits,
        maintenanceUnits,
        totalEngineHrs,
        totalIdleHrs,
        avgEfficiency,
      };
    });
  }, []);

  const overallStats = useMemo(() => {
    const totalUnits = EQUIPMENT.length;
    const totalEngineHrs = EQUIPMENT.reduce((sum, e) => sum + e.engineHoursToday, 0);
    const totalIdleHrs = EQUIPMENT.reduce((sum, e) => sum + e.idleHoursToday, 0);
    const avgEfficiency = totalEngineHrs + totalIdleHrs > 0 
      ? Math.round((totalEngineHrs / (totalEngineHrs + totalIdleHrs)) * 100) 
      : 0;
    return { totalUnits, totalEngineHrs, totalIdleHrs, avgEfficiency };
  }, []);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    return EQUIPMENT.filter((item) => {
      const matchesSite = selectedSiteId === 'ALL' || item.siteId === selectedSiteId;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesQuery = !searchQuery.trim() || 
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.operatorId && item.operatorId.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSite && matchesStatus && matchesQuery;
    });
  }, [selectedSiteId, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-8">
      <PageHero
        eyebrow="Fleet Analytics"
        title="Machinery Usage per Site"
        subtitle="Comprehensive telemetry, engine runtime, and idle metrics tracked per job site location."
      />

      {/* Fleet Overview KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Building2} label="Total Sites" value={SITES.length} tone="default" />
        <KpiCard icon={Truck} label="Deployed Fleet" value={overallStats.totalUnits} tone="default" />
        <KpiCard icon={Clock} label="Engine Hours Today" value={`${overallStats.totalEngineHrs.toFixed(1)}h`} tone="success" />
        <KpiCard icon={Gauge} label="Fleet Efficiency" value={`${overallStats.avgEfficiency}%`} tone={overallStats.avgEfficiency > 65 ? 'success' : 'warning'} />
      </div>

      {/* Per Site Summary Cards */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-cat-black">Site Usage Breakdown</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {siteStats.map((site) => {
            const isSelected = selectedSiteId === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setSelectedSiteId(isSelected ? 'ALL' : site.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border bg-white p-5 transition-all hover:shadow-md',
                  isSelected ? 'border-2 border-cat-yellow ring-2 ring-cat-yellow/30' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="inline-block rounded bg-cat-black/5 px-2 py-0.5 text-xs font-bold text-cat-black">
                      {site.id}
                    </span>
                    <h3 className="font-display text-lg text-cat-black mt-1">{site.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cat-black">{site.avgEfficiency}%</span>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-cat-slate">Efficiency</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-background p-3 text-xs">
                  <div>
                    <p className="text-cat-slate">Engine Hours</p>
                    <p className="font-bold text-cat-black">{site.totalEngineHrs.toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <p className="text-cat-slate">Idle Hours</p>
                    <p className="font-bold text-warning-fg">{site.totalIdleHrs.toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <p className="text-cat-slate">Active / Total</p>
                    <p className="font-bold text-cat-black">{site.runningUnits} / {site.totalUnits} units</p>
                  </div>
                  <div>
                    <p className="text-cat-slate">In Maintenance</p>
                    <p className="font-bold text-danger">{site.maintenanceUnits} units</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-cat-slate">
                  <span>Location: {site.location || 'Worldwide'}</span>
                  <span className="text-cat-yellow-dark hover:underline">
                    {isSelected ? 'Showing Selection' : 'Click to Filter'} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Machinery Usage Telemetry Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Equipment Telemetry & Usage Logs</CardTitle>
            <p className="text-xs text-cat-slate mt-1">
              Showing {filteredEquipment.length} machines {selectedSiteId !== 'ALL' ? `filtered by ${selectedSiteId}` : 'across all sites'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat-slate" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, type or operator..."
                className="pl-9"
              />
            </div>
            <Select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-40"
            >
              <option value="ALL">All Sites</option>
              {SITES.map((s) => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="Running">Running</option>
              <option value="Idle">Idle</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border bg-white">
            <Table>
              <THead>
                <TR>
                  <TH>Equipment ID</TH>
                  <TH>Vehicle Type</TH>
                  <TH>Site ID & Name</TH>
                  <TH>Status</TH>
                  <TH>Operator ID</TH>
                  <TH>Engine Hours Today</TH>
                  <TH>Idle Hours Today</TH>
                  <TH>Usage Efficiency</TH>
                </TR>
              </THead>
              <TBody>
                {filteredEquipment.map((e) => {
                  const isBookedNotUsing = e.isRented && e.status !== 'Running';
                  const totalHrs = e.engineHoursToday + e.idleHoursToday;
                  const effPct = totalHrs > 0 ? Math.round((e.engineHoursToday / totalHrs) * 100) : 0;

                  return (
                    <TR key={e.id}>
                      <TD className="font-bold text-cat-black">{e.id}</TD>
                      <TD>{e.type}</TD>
                      <TD>{e.siteId} — {e.siteName}</TD>
                      <TD><StatusBadge status={e.status} /></TD>
                      <TD>{e.operatorId ?? <span className="text-cat-slate">—</span>}</TD>
                      <TD className="font-medium text-cat-black">
                        {isBookedNotUsing ? <span className="text-cat-slate">—</span> : `${e.engineHoursToday.toFixed(1)}h`}
                      </TD>
                      <TD className={cn(!isBookedNotUsing && e.idleHoursToday > 4 && 'font-semibold text-warning-fg')}>
                        {isBookedNotUsing ? <span className="text-cat-slate">—</span> : `${e.idleHoursToday.toFixed(1)}h`}
                      </TD>
                      <TD>
                        {isBookedNotUsing ? (
                          <span className="text-xs text-cat-slate">Not in operation today</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-background overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  effPct > 70 ? 'bg-success' : effPct > 40 ? 'bg-warning' : 'bg-danger'
                                )}
                                style={{ width: `${effPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-cat-black">{effPct}%</span>
                          </div>
                        )}
                      </TD>
                    </TR>
                  );
                })}
                {filteredEquipment.length === 0 && (
                  <TR>
                    <TD colSpan={8} className="py-10 text-center text-cat-slate">
                      No machinery usage data found for the selected filters.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
