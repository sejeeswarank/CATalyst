import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Dialog from '@/components/ui/dialog';
import PageHero from '@/components/common/PageHero';
import ExcavatorGraphic from '@/components/common/ExcavatorGraphic';
import NewOperatorForm from '@/components/dashboard/NewOperatorForm';
import { useAppData } from '@/state/AppDataContext';

export default function Settings() {
  const { sites, operators, addSite } = useAppData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [lastCreated, setLastCreated] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const site = addSite(name);
    if (site) {
      setLastCreated(site);
      setName('');
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Onboarding"
        title="Fleet Setup"
        subtitle="Onboard the sites and operators your fleet runs on."
        illustration={<ExcavatorGraphic className="w-full" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Sites</CardTitle>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Site
          </Button>
        </CardHeader>
        <CardContent>
          {lastCreated && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2 text-sm text-success-fg">
              <MapPin className="h-4 w-4" />
              <span>
                <strong>{lastCreated.name}</strong> was created with ID <strong>{lastCreated.id}</strong>.
              </span>
            </div>
          )}
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Site ID</TH>
                  <TH>Site Location</TH>
                </TR>
              </THead>
              <TBody>
                {sites.map((s) => (
                  <TR key={s.id}>
                    <TD className="font-semibold text-cat-black">{s.id}</TD>
                    <TD>{s.name}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Operators</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border">
            <Table>
              <THead>
                <TR>
                  <TH>Operator ID</TH>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Location</TH>
                </TR>
              </THead>
              <TBody>
                {operators.map((o) => (
                  <TR key={o.id}>
                    <TD className="font-semibold text-cat-black">{o.id}</TD>
                    <TD>{o.name}</TD>
                    <TD className="text-cat-slate">{o.email || '—'}</TD>
                    <TD className="text-cat-slate">{o.phone || '—'}</TD>
                    <TD className="text-cat-slate">{o.location || '—'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <NewOperatorForm />

      <Dialog open={open} onClose={() => setOpen(false)} title="Add Site">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">
              Site Location
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Westbrook Aggregates" autoFocus />
            <p className="mt-1.5 text-xs text-cat-slate">A unique random Site ID is generated automatically.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!name.trim()}>Create Site</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
