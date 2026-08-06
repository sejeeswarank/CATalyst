import { useState } from 'react';
import {
  Wrench, ArrowLeft, CheckCircle2, AlertTriangle, AlertOctagon, Gauge, ClipboardCheck, Send, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Select from '@/components/ui/select';
import Input from '@/components/ui/input';
import Dialog from '@/components/ui/dialog';
import PageHero from '@/components/common/PageHero';
import VehicleIcon from '@/components/common/VehicleIcon';
import Loader from '@/components/Loader';
import { useAppData, VEHICLE_TYPES } from '@/state/AppDataContext';
import { cn, formatDate } from '@/lib/utils';

const STATUS_BADGE = {
  OK: { variant: 'success', icon: CheckCircle2 },
  'Due Soon': { variant: 'warning', icon: AlertTriangle },
  Overdue: { variant: 'danger', icon: AlertOctagon },
};

const STATUS_BAR = {
  OK: 'bg-success',
  'Due Soon': 'bg-warning',
  Overdue: 'bg-danger',
};

function StatusBadge({ status }) {
  const { variant, icon: Icon } = STATUS_BADGE[status];
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" /> {status}
    </Badge>
  );
}

export default function Maintenance() {
  const { equipment, loading, getPartsStatus, logService } = useAppData();
  const [vehicleType, setVehicleType] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [serviceTarget, setServiceTarget] = useState(null);
  const [genuinePart, setGenuinePart] = useState('yes');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sentMails, setSentMails] = useState({});

  if (loading) return <Loader />;

  const worstStatus = (equipmentId) => getPartsStatus(equipmentId)[0]?.status || 'OK';

  const unitsOfType = vehicleType ? equipment.filter((e) => e.type === vehicleType) : [];
  const selectedUnit = selectedUnitId ? equipment.find((e) => e.id === selectedUnitId) : null;
  const parts = selectedUnit ? getPartsStatus(selectedUnit.id) : [];

  const chooseType = (type) => {
    setVehicleType(type);
    setSelectedUnitId(null);
  };

  const openServiceDialog = (part) => {
    setServiceTarget(part);
    setGenuinePart('yes');
    setInvoiceNo('');
  };

  const handleSendMail = (part) => {
    const key = `${selectedUnit.id}-${part.part}`;
    setSentMails((prev) => ({ ...prev, [key]: true }));
    setToast({
      ok: true,
      message: `Email alert sent to maintenance team — ${selectedUnit.id}: ${part.part} is ${part.status}.`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  const confirmService = async (e) => {
    e.preventDefault();
    if (!selectedUnit || !serviceTarget) return;
    setSubmitting(true);
    const result = await logService(selectedUnit.id, serviceTarget.part, {
      genuinePart: genuinePart === 'yes' ? true : genuinePart === 'no' ? false : null,
      invoiceNo,
    });
    setSubmitting(false);
    setServiceTarget(null);
    setToast({ ok: result.ok, message: result.message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Predictive Maintenance"
        title="Parts Maintenance Planner"
        subtitle="Select a vehicle type and unit to see which parts are due, based on interval hours against the machine's live engine-hour meter."
        bgImage="/hero-equipment.png"
      />

      <Card>
        <CardHeader><CardTitle>1. Select Vehicle Type</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {VEHICLE_TYPES.map((type) => {
              const count = equipment.filter((e) => e.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => chooseType(type)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors',
                    vehicleType === type
                      ? 'border-cat-yellow bg-cat-yellow/10'
                      : 'border-border bg-white hover:bg-background'
                  )}
                >
                  <VehicleIcon type={type} className="h-16 w-16" />
                  <span className="text-xs font-semibold text-cat-black">{type}</span>
                  <span className="text-[11px] text-cat-slate">{count} units</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {vehicleType && (
        <Card>
          <CardHeader>
            <CardTitle>2. Select Unit — {vehicleType}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setVehicleType(null)}>
              <ArrowLeft className="h-3.5 w-3.5" /> Change type
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border">
              <Table>
                <THead>
                  <TR>
                    <TH>Equipment ID</TH>
                    <TH>Site</TH>
                    <TH>Total Engine Hours</TH>
                    <TH>Worst Part Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {unitsOfType.map((u) => (
                    <TR key={u.id} className={selectedUnitId === u.id ? 'bg-cat-yellow/5' : undefined}>
                      <TD className="font-semibold text-cat-black">{u.id}</TD>
                      <TD>{u.siteName}</TD>
                      <TD>
                        <span className="inline-flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 text-cat-slate" /> {u.totalEngineHours.toFixed(0)}h
                        </span>
                      </TD>
                      <TD><StatusBadge status={worstStatus(u.id)} /></TD>
                      <TD className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUnitId(u.id)}>
                          View Parts
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle>3. Maintenance Status — {selectedUnit.id}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUnitId(null)}>
              <ArrowLeft className="h-3.5 w-3.5" /> Change unit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4 rounded-xl bg-background p-4">
              <VehicleIcon type={selectedUnit.type} className="h-16 w-16" />
              <div className="text-sm">
                <p className="font-semibold text-cat-black">{selectedUnit.id} · {selectedUnit.type}</p>
                <p className="text-cat-slate">{selectedUnit.siteName} · {selectedUnit.totalEngineHours.toFixed(0)} total engine hours</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border">
              <Table>
                <THead>
                  <TR>
                    <TH>Part</TH>
                    <TH>Interval</TH>
                    <TH>Hours Since Service</TH>
                    <TH>Progress</TH>
                    <TH>Status</TH>
                    <TH>Last Serviced</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {parts.map((p) => (
                    <TR key={p.part}>
                      <TD className="font-semibold text-cat-black">{p.part}</TD>
                      <TD>{p.intervalHours}h</TD>
                      <TD>{p.hoursSince}h</TD>
                      <TD>
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-cat-black/10">
                          <div
                            className={cn('h-full rounded-full', STATUS_BAR[p.status])}
                            style={{ width: `${Math.min(100, p.ratio * 100)}%` }}
                          />
                        </div>
                      </TD>
                      <TD><StatusBadge status={p.status} /></TD>
                      <TD>{p.lastServiceDate ? formatDate(p.lastServiceDate) : 'Never logged'}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          {sentMails[`${selectedUnit.id}-${p.part}`] ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                              <Check className="h-3.5 w-3.5" /> Email Sent
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-cat-yellow bg-cat-yellow/10 text-xs font-semibold hover:bg-cat-yellow hover:text-cat-black"
                              onClick={() => handleSendMail(p)}
                            >
                              <Send className="h-3.5 w-3.5" /> Send Mail
                            </Button>
                          )}
                          <Button size="sm" variant="primary" onClick={() => openServiceDialog(p)}>
                            <ClipboardCheck className="h-3.5 w-3.5" /> Log Service
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!serviceTarget} onClose={() => setServiceTarget(null)} title="Log Service">
        {serviceTarget && selectedUnit && (
          <form onSubmit={confirmService} className="space-y-3">
            <div className="rounded-xl bg-background p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-cat-slate">Equipment</span><span className="font-medium">{selectedUnit.id}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Part</span><span className="font-medium">{serviceTarget.part}</span></div>
              <div className="flex justify-between py-1"><span className="text-cat-slate">Recorded at</span><span className="font-medium">{selectedUnit.totalEngineHours.toFixed(0)}h (current meter)</span></div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
                Genuine part used?
              </label>
              <Select value={genuinePart} onChange={(e) => setGenuinePart(e.target.value)}>
                <option value="yes">Yes — genuine / OEM</option>
                <option value="no">No — aftermarket</option>
                <option value="unknown">Not sure</option>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
                Invoice number (optional)
              </label>
              <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="e.g. INV-2026-1042" />
            </div>

            <p className="text-xs text-cat-slate">
              This resets the interval countdown for {serviceTarget.part} from the machine's current engine-hour reading.
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setServiceTarget(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Logging…' : 'Confirm Serviced'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in',
            toast.ok ? 'bg-cat-black' : 'bg-danger'
          )}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
