import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-cat-black placeholder:text-cat-slate/60 outline-none transition-colors focus:border-cat-yellow focus:ring-2 focus:ring-cat-yellow/30',
        className
      )}
      {...props}
    />
  );
});

export default Input;
