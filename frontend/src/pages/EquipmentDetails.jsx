import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, User, DollarSign, CalendarClock, CalendarCheck2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Dialog from '@/components/ui/dialog';
import StatusBadge from '@/components/common/StatusBadge';
import VehicleIcon from '@/components/common/VehicleIcon';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import Loader from '@/components/Loader';
import { useAppData, TODAY } from '@/state/AppDataContext';
import { formatDate } from '@/lib/utils';

const todayISO = TODAY.toISOString().slice(0, 10);

const addDaysISO = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
};

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, operators, getEquipmentById, bookEquipment } = useAppData();
  const equipment = getEquipmentById(id);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayISO);
  const [duration, setDuration] = useState(7);
  const [clientName, setClientName] = useState('');
  const [assignedOperator, setAssignedOperator] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loader />;

  if (!equipment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-cat-black">Equipment "{id}" not found</p>
        <Button variant="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const openBookingDialog = () => {
    setStartDate(todayISO);
    setDuration(7);
    setClientName('');
    setAssignedOperator('');
    setBookingError('');
    setBookingOpen(true);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setSubmitting(true);
    setBookingError('');

    const result = await bookEquipment(equipment.id, {
      client: clientName.trim(),
      operatorId: assignedOperator || null,
      expectedReturn: addDaysISO(startDate, Number(duration) || 1),
    });

    setSubmitting(false);
    if (!result.ok) {
      setBookingError(result.message);
      return;
    }

    setBookingOpen(false);
    setConfirmed({ client: clientName.trim() });
  };

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
            {equipment.status === 'Available' && (
              <Button variant="primary" size="sm" onClick={openBookingDialog}>
                <CalendarCheck2 className="h-3.5 w-3.5" /> Book This Equipment
              </Button>
            )}
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

      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} title="Confirm Booking">
        <form onSubmit={confirmBooking} className="space-y-3">
          <div className="rounded-xl bg-background p-4 text-sm">
            <div className="flex justify-between py-1"><span className="text-cat-slate">Equipment</span><span className="font-medium">{equipment.id} · {equipment.type}</span></div>
            <div className="flex justify-between py-1"><span className="text-cat-slate">Site</span><span className="font-medium">{equipment.siteName}</span></div>
            <div className="flex justify-between py-1"><span className="text-cat-slate">Est. total</span><span className="font-medium">${(equipment.dailyRate * Number(duration || 1)).toLocaleString()}</span></div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
              Rental start date
            </label>
            <Input type="date" value={startDate} min={todayISO} onChange={(e) => setStartDate(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
              Rental duration (days)
            </label>
            <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
              Client / Company Name
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. BuildRight Corp"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
              Assign Operator (optional)
            </label>
            <Select value={assignedOperator} onChange={(e) => setAssignedOperator(e.target.value)}>
              <option value="">No operator assigned yet</option>
              {operators.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.name}</option>)}
            </Select>
          </div>

          <p className="text-xs text-cat-slate">
            This reserves the machine — it stays in the garage as <strong>Booked</strong> until the gate RFID scan
            confirms it actually left, which is what stamps the real check-out date.
          </p>

          {bookingError && (
            <div className="flex items-center gap-2 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger-fg">
              <AlertCircle className="h-4 w-4 shrink-0" /> {bookingError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!clientName.trim() || submitting}>
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!confirmed} onClose={() => setConfirmed(null)} title="Booking Confirmed">
        {confirmed && (
          <>
            <p className="text-sm text-cat-slate">
              <span className="font-semibold text-cat-black">{equipment.id}</span> is reserved for{' '}
              <span className="font-semibold text-cat-black">{confirmed.client}</span> and marked{' '}
              <strong>Booked</strong>. It stays in the garage until scanned out on the{' '}
              <a href="/scan" className="text-cat-yellow-dark hover:underline">Scan Equipment</a> page.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={() => setConfirmed(null)}>Done</Button>
            </div>
          </>
        )}
      </Dialog>
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
