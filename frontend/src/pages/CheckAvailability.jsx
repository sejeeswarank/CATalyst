import { useState } from 'react';
import { Search, MapPin, CalendarCheck2, PackageSearch, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Dialog from '@/components/ui/dialog';
import PageHero from '@/components/common/PageHero';
import Loader from '@/components/Loader';
import { useAppData, REGIONS, VEHICLE_TYPES, TODAY } from '@/state/AppDataContext';
import { formatDate } from '@/lib/utils';

const todayISO = TODAY.toISOString().slice(0, 10);

const addDaysISO = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
};

export default function CheckAvailability() {
  const { sites, operators, equipment, loading, bookEquipment } = useAppData();
  const [startDate, setStartDate] = useState(todayISO);
  const [duration, setDuration] = useState(7);
  const [vehicleType, setVehicleType] = useState('All');
  const [siteId, setSiteId] = useState('All');
  const [region, setRegion] = useState('All');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [clientName, setClientName] = useState('');
  const [assignedOperator, setAssignedOperator] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loader />;

  const runSearch = (e) => {
    e?.preventDefault();

    // Only currently in-garage (Available) equipment can be booked — a
    // machine that's Running/Idle/Booked can't be reserved on top of its
    // existing commitment, and Maintenance units are out of service.
    const matches = equipment.filter((eq) => {
      if (eq.status !== 'Available') return false;
      if (vehicleType !== 'All' && eq.type !== vehicleType) return false;
      if (siteId !== 'All' && eq.siteId !== siteId) return false;
      if (region !== 'All' && eq.region !== region) return false;
      return true;
    }).map((eq) => ({
      ...eq,
      availableFrom: TODAY,
      expectedReturn: addDaysISO(startDate, Number(duration) || 1),
    }));

    setResults(matches);
    setSearched(true);
  };

  const openBookingDialog = (target) => {
    setBookingTarget(target);
    setClientName('');
    setAssignedOperator('');
    setBookingError('');
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingTarget || !clientName.trim()) return;
    setSubmitting(true);
    setBookingError('');

    const result = await bookEquipment(bookingTarget.id, {
      client: clientName.trim(),
      operatorId: assignedOperator || null,
      expectedReturn: bookingTarget.expectedReturn,
    });

    setSubmitting(false);
    if (!result.ok) {
      setBookingError(result.message);
      return;
    }

    setResults((prev) => prev.filter((r) => r.id !== bookingTarget.id));
    setConfirmed({ id: bookingTarget.id, client: clientName.trim() });
    setBookingTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Rental Booking"
        title="Check Availability Status"
        subtitle="Match a client's requirement — machine type, date needed and rental timeline — against the live fleet. Booking reserves the machine in the garage; the gate RFID scan confirms it actually left."
        bgImage="/hero-equipment.png"
      />

      <Card>
        <CardContent className="p-5">
          <form onSubmit={runSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
                Vehicle type
              </label>
              <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="All">All types</option>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
                Site
              </label>
              <Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <option value="All">All sites</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
                Location
              </label>
              <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="All">All locations</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                <Search className="h-4 w-4" /> Search Availability
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>
              {results.length > 0 ? `${results.length} machine${results.length > 1 ? 's' : ''} match this requirement` : 'Results'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <PackageSearch className="h-10 w-10 text-cat-slate/50" />
                <p className="text-sm font-medium text-cat-slate">
                  No equipment available for selected dates.
                </p>
                <p className="text-xs text-cat-slate/70">Try widening the site, location or vehicle type filters.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border">
                <Table>
                  <THead>
                    <TR>
                      <TH>Equipment ID</TH>
                      <TH>Vehicle Type</TH>
                      <TH>Current Site</TH>
                      <TH>Availability</TH>
                      <TH>Rental Price</TH>
                      <TH>Expected Return</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {results.map((r) => (
                      <TR key={r.id}>
                        <TD className="font-semibold text-cat-black">{r.id}</TD>
                        <TD>{r.type}</TD>
                        <TD>
                          <span className="inline-flex items-center gap-1 text-cat-slate">
                            <MapPin className="h-3.5 w-3.5" /> {r.siteName}
                          </span>
                        </TD>
                        <TD>
                          <Badge variant="success" dot>Available Now</Badge>
                        </TD>
                        <TD>${r.dailyRate}/day</TD>
                        <TD>{formatDate(r.expectedReturn)}</TD>
                        <TD className="text-right">
                          <Button size="sm" variant="primary" onClick={() => openBookingDialog(r)}>
                            <CalendarCheck2 className="h-3.5 w-3.5" /> Book
                          </Button>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!bookingTarget} onClose={() => setBookingTarget(null)} title="Confirm Booking">
        {bookingTarget && (
          <form onSubmit={confirmBooking} className="space-y-3">
            <div className="rounded-xl bg-background p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-cat-slate">Equipment</span><span className="font-medium">{bookingTarget.id} · {bookingTarget.type}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Site</span><span className="font-medium">{bookingTarget.siteName}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Start</span><span className="font-medium">{formatDate(startDate)}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Duration</span><span className="font-medium">{duration} day(s)</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Est. total</span><span className="font-medium">${(bookingTarget.dailyRate * Number(duration || 1)).toLocaleString()}</span></div>
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
              <Button type="button" variant="outline" onClick={() => setBookingTarget(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={!clientName.trim() || submitting}>
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!confirmed} onClose={() => setConfirmed(null)} title="Booking Confirmed">
        {confirmed && (
          <>
            <p className="text-sm text-cat-slate">
              <span className="font-semibold text-cat-black">{confirmed.id}</span> is reserved for{' '}
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
