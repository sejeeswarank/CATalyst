import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import { useAppData } from '@/state/AppDataContext';

export default function NewOperatorForm() {
  const { sites, addOperator } = useAppData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [lastCreated, setLastCreated] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const operator = await addOperator({ name, email, phone, location: location || sites[0]?.name });
    if (operator) {
      setLastCreated(operator);
      setName('');
      setEmail('');
      setPhone('');
      setLocation('');
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>New Operator</CardTitle></CardHeader>
      <CardContent>
        {lastCreated && (
          <div className="mb-4 rounded-lg bg-success-bg px-3 py-2 text-sm text-success-fg">
            <strong>{lastCreated.name}</strong> was added as operator <strong>{lastCreated.id}</strong> at {lastCreated.location}.
          </div>
        )}
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">Phone Number</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cat-slate">Location</label>
            <Select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select a site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit" variant="primary">
              <UserPlus className="h-4 w-4" /> Add Operator
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
