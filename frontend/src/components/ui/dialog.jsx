import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dialog({ open, onClose, title, children, className }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cat-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn('w-full max-w-md rounded-2xl bg-white p-6 shadow-card', className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-sans text-base font-semibold normal-case text-cat-black">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-cat-slate hover:bg-background">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
