import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-9 text-sm text-cat-black outline-none transition-colors focus:border-cat-yellow focus:ring-2 focus:ring-cat-yellow/30',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat-slate" />
    </div>
  );
}
