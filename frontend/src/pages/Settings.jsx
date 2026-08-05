import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/common/PageHero';

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Account" title="Settings" subtitle="Account, notification and integration preferences." />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cat-black/5 text-cat-black">
            <SettingsIcon className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-cat-black">Nothing to configure yet</p>
          <p className="max-w-sm text-xs text-cat-slate">
            This is a placeholder so the sidebar never dead-ends. Wire it up once auth/roles are in scope.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
