import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-cat-black/5 text-cat-slate',
        success: 'bg-success-bg text-success-fg',
        warning: 'bg-warning-bg text-warning-fg',
        danger: 'bg-danger-bg text-danger-fg',
        info: 'bg-info-bg text-info-fg',
        yellow: 'bg-cat-yellow/20 text-cat-yellow-dark',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export default function Badge({ className, variant, dot, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {props.children}
    </span>
  );
}
