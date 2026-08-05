import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cat-yellow disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-cat-yellow text-cat-black hover:bg-cat-yellow-dark shadow-soft',
        secondary: 'bg-cat-black text-white hover:bg-cat-ink',
        outline: 'border border-border bg-white text-cat-black hover:bg-background',
        ghost: 'text-cat-black hover:bg-background',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export default function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
