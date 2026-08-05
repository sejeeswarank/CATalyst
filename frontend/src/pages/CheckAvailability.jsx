import { useState } from 'react';
import { Search, MapPin, CalendarCheck2, PackageSearch } from 'lucide-react';
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
import { formatDate, daysBetween } from '@/lib/utils';

const todayISO = TODAY.toISOString().slice(0, 10);

const addDaysISO = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
};

export default function CheckAvailability() {
  const { sites, equipment, loading } = useAppData();
  const [startDate, setStartDate] = useState(todayISO);
  const [duration, setDuration] = useState(7);
  const [vehicleType, setVehicleType] = useState('All');
  const [siteId, setSiteId] = useState('All');
  const [region, setRegion] = useState('All');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [bookedIds, setBookedIds] = useState(new Set());
  const [bookingTarget, setBookingTarget] = useState(null);
  const [confirmedId, setConfirmedId] = useState(null);

  if (loading) return <Loader />;

  const runSearch = (e) => {
    e?.preventDefault();

    const matches = equipment.filter((eq) => {
      if (eq.status === 'Maintenance') return false;
      if (bookedIds.has(eq.id)) return false;
      if (vehicleType !== 'All' && eq.type !== vehicleType) return false;
      if (siteId !== 'All' && eq.siteId !== siteId) return false;
      if (region !== 'All' && eq.region !== region) return false;

      const availableFrom = eq.status === 'Available' ? TODAY : eq.checkInDate;
      return daysBetween(availableFrom, startDate) >= 0;
    }).map((eq) => {
      const availableFrom = eq.status === 'Available' ? TODAY : eq.checkInDate;
      return {
        ...eq,
        availableFrom,
        expectedReturn: addDaysISO(startDate, Number(duration) || 1),
      };
    });

    setResults(matches);
    setSearched(true);
  };

  const confirmBooking = () => {
    if (!bookingTarget) return;
    setBookedIds((prev) => new Set(prev).add(bookingTarget.id));
    setResults((prev) => prev.filter((r) => r.id !== bookingTarget.id));
    setConfirmedId(bookingTarget.id);
    setBookingTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Rental Booking"
        title="Check Availability Status"
        subtitle="Match a client's requirement — machine type, date needed and rental timeline — against the live fleet."
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
                      <TH>Available From</TH>
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
                          <Badge variant={r.status === 'Available' ? 'success' : 'info'} dot>
                            {r.status === 'Available' ? 'Available Now' : `Free from ${formatDate(r.availableFrom)}`}
                          </Badge>
                        </TD>
                        <TD>${r.dailyRate}/day</TD>
                        <TD>{formatDate(r.availableFrom)}</TD>
                        <TD>{formatDate(r.expectedReturn)}</TD>
                        <TD className="text-right">
                          <Button size="sm" variant="primary" onClick={() => setBookingTarget(r)}>
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
          <div className="space-y-3">
            <div className="rounded-xl bg-background p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-cat-slate">Equipment</span><span className="font-medium">{bookingTarget.id} · {bookingTarget.type}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Site</span><span className="font-medium">{bookingTarget.siteName}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Start</span><span className="font-medium">{formatDate(startDate)}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Duration</span><span className="font-medium">{duration} day(s)</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Est. total</span><span className="font-medium">${(bookingTarget.dailyRate * Number(duration || 1)).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBookingTarget(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmBooking}>Confirm Booking</Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={!!confirmedId} onClose={() => setConfirmedId(null)} title="Booking Confirmed">
        <p className="text-sm text-cat-slate">
          <span className="font-semibold text-cat-black">{confirmedId}</span> has been reserved and removed from the available pool for this session.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={() => setConfirmedId(null)}>Done</Button>
        </div>
      </Dialog>
    </div>
  );
}
