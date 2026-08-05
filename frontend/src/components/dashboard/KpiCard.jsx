import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  yellow: 'bg-cat-yellow/15 text-cat-yellow-dark',
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  info: 'bg-info-bg text-info-fg',
  default: 'bg-cat-black/5 text-cat-black',
};

export default function KpiCard({ icon: Icon, label, value, tone = 'default', hint }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cat-slate">{label}</p>
          <p className="mt-2 font-display text-3xl text-cat-black">{value}</p>
          {hint && <p className="mt-1 text-xs text-cat-slate">{hint}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" size={20} />
        </div>
      </div>
    </Card>
  );
}
