import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, User, DollarSign, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import VehicleIcon from '@/components/common/VehicleIcon';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import Loader from '@/components/Loader';
import { useAppData } from '@/state/AppDataContext';
import { formatDate } from '@/lib/utils';

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, getEquipmentById } = useAppData();
  const equipment = getEquipmentById(id);

  if (loading) return <Loader />;

  if (!equipment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-cat-black">Equipment "{id}" not found</p>
        <Button variant="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const timelineItems = [
    equipment.isRented
      ? { id: 't-checkout', kind: 'checkin', text: `Checked out to ${equipment.siteName}`, timestamp: equipment.checkOutDate }
      : { id: 't-return', kind: 'returned', text: 'Returned to yard', timestamp: equipment.checkInDate },
    { id: 't-status', kind: equipment.status === 'Running' ? 'engine-start' : 'idle-alert', text: `Current status: ${equipment.status}`, timestamp: new Date() },
    ...equipment.rentalHistory.map((r, i) => ({
      id: `t-hist-${i}`,
      kind: 'returned',
      text: `Rented by ${r.client} (operator ${r.operator})`,
      timestamp: r.end,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-cat-slate hover:text-cat-black">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <VehicleIcon type={equipment.type} className="h-80 w-80" bg="bg-transparent" padded={false} />
            <div>
              <h2 className="font-display text-xl text-cat-black">{equipment.id}</h2>
              <p className="text-sm normal-case text-cat-slate">{equipment.type}</p>
            </div>
            <StatusBadge status={equipment.status} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Equipment Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={MapPin} label="Site" value={`${equipment.siteName} (${equipment.siteId})`} />
            <InfoRow icon={User} label="Operator" value={equipment.operatorId || 'Unassigned'} />
            <InfoRow icon={User} label="Rented By" value={equipment.rentedBy || '—'} />
            <InfoRow icon={DollarSign} label="Daily Rate" value={`$${equipment.dailyRate}/day`} />
            <InfoRow
              icon={CalendarClock}
              label="Rental Window"
              value={equipment.isRented ? `${formatDate(equipment.checkOutDate)} → ${formatDate(equipment.checkInDate)}` : 'Not currently rented'}
            />
            <InfoRow
              icon={CalendarClock}
              label="Total Rented Hours"
              value={
                equipment.isRented
                  ? `${equipment.history.reduce((acc, h) => acc + h.engineHours, 0).toFixed(1)} hrs`
                  : 'Not rented'
              }
            />
            <InfoRow
              icon={CalendarClock}
              label="Engine / Idle Hours Today"
              value={
                equipment.isRented && equipment.status !== 'Running'
                  ? '— / —'
                  : `${equipment.engineHoursToday.toFixed(1)}h / ${equipment.idleHoursToday.toFixed(1)}h`
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Usage (Last 7 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Engine Hours</TH>
                  <TH>Idle Hours</TH>
                  <TH>Fuel Usage</TH>
                  <TH>Location</TH>
                </TR>
              </THead>
              <TBody>
                {equipment.history.length > 0 ? (
                  equipment.history.map((h, i) => (
                    <TR key={i}>
                      <TD className="font-medium text-cat-black">{formatDate(h.date)}</TD>
                      <TD>{h.engineHours.toFixed(1)}h</TD>
                      <TD>{h.idleHours.toFixed(1)}h</TD>
                      <TD>{h.fuelUsage.toFixed(1)} L</TD>
                      <TD className="text-cat-slate">{h.location}</TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-cat-slate">No usage history recorded yet.</TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rental History</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Client</TH>
                  <TH>Operator</TH>
                  <TH>Start</TH>
                  <TH>End</TH>
                </TR>
              </THead>
              <TBody>
                {equipment.rentalHistory.length > 0 ? (
                  equipment.rentalHistory.map((r, i) => (
                    <TR key={i}>
                      <TD className="font-medium text-cat-black">{r.client}</TD>
                      <TD>{r.operator}</TD>
                      <TD>{formatDate(r.start)}</TD>
                      <TD>{formatDate(r.end)}</TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={4} className="py-8 text-center text-cat-slate">No rental history yet.</TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usage History</CardTitle></CardHeader>
        <CardContent>
          <ActivityTimeline items={timelineItems} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-cat-slate">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">{label}</p>
        <p className="text-sm font-medium text-cat-black">{value}</p>
      </div>
    </div>
  );
}
