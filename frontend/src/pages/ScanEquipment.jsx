import { useEffect, useRef, useState } from 'react';
import { Nfc, Search, ScanLine, CheckCircle2, XCircle, History } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import Loader from '@/components/Loader';
import { useAppData } from '@/state/AppDataContext';
import { cn, timeAgo } from '@/lib/utils';

// Short beep via Web Audio — mimics a real RFID reader's confirmation tone.
// No external asset needed.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1800;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Web Audio unavailable — silently skip the beep, scan still works.
  }
}

const ACTION_LABEL = {
  check_out: 'Checked Out',
  check_in: 'Checked In',
  rejected: 'Rejected',
};

export default function ScanEquipment() {
  const { equipment, loading, scanTag, getRecentScans } = useAppData();
  const [manualTag, setManualTag] = useState('');
  const [query, setQuery] = useState('');
  const [scanningTag, setScanningTag] = useState(null);
  const [toast, setToast] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    refreshScans();
  }, []);

  const refreshScans = async () => {
    const scans = await getRecentScans(10);
    setRecentScans(scans);
  };

  const runScan = async (tag) => {
    if (!tag || scanningTag) return;
    setScanningTag(tag);
    playBeep();
    // Mimics a real reader's read latency — also gives the "Scanning…" state
    // long enough on screen to register with a demo audience.
    await new Promise((r) => setTimeout(r, 700));
    const result = await scanTag(tag);
    setScanningTag(null);
    setToast(result);
    setTimeout(() => setToast(null), 4000);
    refreshScans();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    runScan(manualTag);
    setManualTag('');
  };

  const filtered = equipment.filter((e) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      e.id.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.siteName.toLowerCase().includes(q) ||
      e.rfidTag?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-8">
      <PageHero
        eyebrow="Field Operations"
        title="Scan Equipment (RFID / QR Simulation)"
        subtitle="Tap a card to simulate a gate scan, or type a tag ID below — the write-back is identical to what a physical reader would trigger."
      />

      {toast && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-md animate-fade-in',
            toast.ok ? 'bg-cat-black text-cat-yellow' : 'bg-danger text-white'
          )}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Manual / Reader Input</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
                Tag ID
              </label>
              <Input
                ref={inputRef}
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                placeholder="e.g. RFID-CF9E2A — type or scan, then press Enter"
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-cat-slate">
                A physical RFID reader acts as a keyboard — it types the tag here and presses Enter automatically.
              </p>
            </div>
            <Button type="submit" variant="primary" disabled={!manualTag.trim() || !!scanningTag}>
              <ScanLine className="h-4 w-4" /> Submit Scan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Tags</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat-slate" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, type, site or tag…"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const isScanning = scanningTag === e.rfidTag;
              const disabled = e.status === 'Maintenance';
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex flex-col gap-3 rounded-2xl border bg-white p-4 transition-shadow',
                    disabled ? 'border-border opacity-60' : 'border-border hover:shadow-md'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-base text-cat-black">{e.id}</p>
                      <p className="text-xs text-cat-slate">{e.type} · {e.siteName}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>

                  <div className="rounded-lg bg-background px-3 py-2 text-center">
                    <p className="font-mono text-sm font-bold tracking-wider text-cat-black">{e.rfidTag}</p>
                    <p className="text-[10px] uppercase tracking-wide text-cat-slate">Simulated RFID Tag</p>
                  </div>

                  <Button
                    variant={disabled ? 'outline' : e.status === 'Available' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={disabled || (!!scanningTag && !isScanning)}
                    onClick={() => runScan(e.rfidTag)}
                  >
                    {isScanning ? (
                      <>
                        <Nfc className="h-3.5 w-3.5 animate-pulse" /> Scanning…
                      </>
                    ) : disabled ? (
                      'In Maintenance'
                    ) : (
                      <>
                        <Nfc className="h-3.5 w-3.5" /> Tap to Scan
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-cat-slate">
                No equipment matches this search.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="py-6 text-center text-sm text-cat-slate">No scans yet — tap a card above to try one.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentScans.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-semibold text-cat-black">{s.equipment_id || s.tag_id}</span>
                    <span className="ml-2 text-cat-slate">{ACTION_LABEL[s.action] || s.action}</span>
                    {s.reason && <span className="ml-2 text-xs text-danger">({s.reason})</span>}
                  </div>
                  <span className="text-xs text-cat-slate">{timeAgo(s.scanned_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
