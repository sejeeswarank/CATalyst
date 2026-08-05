import { useMemo, useState } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Select from '@/components/ui/select';
import PageHero from '@/components/common/PageHero';
import KpiCard from '@/components/dashboard/KpiCard';
import StatusBadge, { SeverityLabel } from '@/components/common/SeverityBadge';
import { ALERTS, getAlertKpis } from '@/data/mockData';
import { formatDate } from '@/lib/utils';

const STATUS_OPTIONS = ['All', 'Active', 'Resolved'];
const SEVERITY_OPTIONS = ['All', 'critical', 'warning'];

export default function Alerts() {
  const kpis = getAlertKpis();
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');

  const filtered = useMemo(() => {
    return ALERTS.filter((a) => {
      if (status !== 'All' && a.status !== status) return false;
      if (severity !== 'All' && a.severity !== severity) return false;
      return true;
    });
  }, [status, severity]);

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
          <CardTitle>All Alerts</CardTitle>
          <div className="flex gap-2">
            <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-40">
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All severities' : s === 'critical' ? 'Critical' : 'Warning'}</option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Alert Type</TH>
                  <TH>Equipment ID</TH>
                  <TH>Vehicle</TH>
                  <TH>Site</TH>
                  <TH>Severity</TH>
                  <TH>Timestamp</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((a) => (
                  <TR key={a.id}>
                    <TD className="font-medium text-cat-black">{a.type}</TD>
                    <TD>{a.equipmentId}</TD>
                    <TD>{a.vehicle}</TD>
                    <TD>{a.site}</TD>
                    <TD><SeverityLabel severity={a.severity} /></TD>
                    <TD className="text-cat-slate">{formatDate(a.timestamp)}</TD>
                    <TD><StatusBadge severity={a.severity} status={a.status} /></TD>
                  </TR>
                ))}
                {filtered.length === 0 && (
                  <TR>
                    <TD colSpan={7} className="py-10 text-center text-cat-slate">
                      No alerts match these filters.
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
