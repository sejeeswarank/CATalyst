import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import AlertStatusBadge from '@/components/common/SeverityBadge';
import { timeAgo } from '@/lib/utils';

export default function AlertsMiniTable({ alerts, emptyLabel = 'Nothing to show right now.' }) {
  return (
    <div className="rounded-2xl border border-border">
      <Table>
        <THead>
          <TR>
            <TH>Alert Type</TH>
            <TH>Equipment</TH>
            <TH>Site</TH>
            <TH>Reported</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {alerts.map((a) => (
            <TR key={a.id}>
              <TD className="font-medium text-cat-black">{a.type}</TD>
              <TD>{a.equipmentId} · {a.vehicle}</TD>
              <TD>{a.site}</TD>
              <TD className="text-cat-slate">{timeAgo(a.timestamp)}</TD>
              <TD><AlertStatusBadge severity={a.severity} status={a.status} /></TD>
            </TR>
          ))}
          {alerts.length === 0 && (
            <TR>
              <TD colSpan={5} className="py-8 text-center text-cat-slate">{emptyLabel}</TD>
            </TR>
          )}
        </TBody>
      </Table>
    </div>
  );
}
