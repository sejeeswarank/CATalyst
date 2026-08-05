import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }) {
  return <thead className={cn('sticky top-0 z-10 bg-background', className)} {...props} />;
}

export function TBody(props) {
  return <tbody {...props} />;
}

export function TR({ className, ...props }) {
  return <tr className={cn('border-b border-border last:border-0 hover:bg-background/70 transition-colors', className)} {...props} />;
}

export function TH({ className, ...props }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cat-slate',
        className
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }) {
  return <td className={cn('whitespace-nowrap px-4 py-3 text-cat-black', className)} {...props} />;
}
