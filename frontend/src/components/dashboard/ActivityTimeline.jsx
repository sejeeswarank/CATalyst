import { LogIn, Power, CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { timeAgo, cn } from '@/lib/utils';

const ICONS = {
  checkin: { icon: LogIn, tone: 'text-info bg-info-bg' },
  'engine-start': { icon: Power, tone: 'text-success bg-success-bg' },
  'rental-ending': { icon: CalendarClock, tone: 'text-warning bg-warning-bg' },
  'idle-alert': { icon: AlertTriangle, tone: 'text-danger bg-danger-bg' },
  returned: { icon: CheckCircle2, tone: 'text-cat-yellow-dark bg-cat-yellow/15' },
};

export default function ActivityTimeline({ items }) {
  return (
    <ol className="space-y-0">
      {items.map((item, i) => {
        const { icon: Icon, tone } = ICONS[item.kind] || ICONS.checkin;
        return (
          <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i !== items.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" />
            )}
            <div className={cn('z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', tone)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-sm text-cat-black">{item.text}</p>
              <p className="text-xs text-cat-slate">{timeAgo(item.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
