import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import VehicleIcon from '@/components/common/VehicleIcon';

const ROTATE_MS = 4000;

// Cycles through the fleet one machine at a time so the dashboard's third
// column isn't empty — picks a new random unit on an interval, never
// repeating the one currently showing.
export default function EquipmentSpotlight({ equipment }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * equipment.length));

  useEffect(() => {
    if (equipment.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * equipment.length);
        while (next === prev) next = Math.floor(Math.random() * equipment.length);
        return next;
      });
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [equipment.length]);

  const current = equipment[index % equipment.length];
  if (!current) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Equipment Spotlight</CardTitle></CardHeader>
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <div key={current.id} className="flex flex-col items-center gap-3 animate-fade-in">
          <VehicleIcon type={current.type} className="h-32 w-32" bg="bg-transparent" padded={false} />
          <div>
            <p className="font-display text-lg text-cat-black">{current.id}</p>
            <p className="text-sm normal-case text-cat-slate">{current.type} · {current.siteName}</p>
          </div>
          <StatusBadge status={current.status} />
        </div>
        <Button variant="outline" size="sm" className="mt-1" onClick={() => navigate(`/equipment/${current.id}`)}>
          <Eye className="h-3.5 w-3.5" /> View Details
        </Button>
      </CardContent>
    </Card>
  );
}
