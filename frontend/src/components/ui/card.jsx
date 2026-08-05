import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-white shadow-card', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-center justify-between p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('font-sans text-sm font-semibold uppercase tracking-wide text-cat-slate normal-case', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
