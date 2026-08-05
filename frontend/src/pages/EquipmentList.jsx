import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';
import AssetTable from '@/components/dashboard/AssetTable';
import { EQUIPMENT } from '@/data/mockData';

export default function EquipmentList() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fleet Roster"
        title="Equipment"
        subtitle={`Full fleet roster — ${EQUIPMENT.length} machines across 10 sites.`}
      />

      <Card>
        <CardHeader><CardTitle>All Equipment</CardTitle></CardHeader>
        <CardContent>
          <AssetTable data={EQUIPMENT} filterable paginated pageSize={10} initialQuery={initialQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
