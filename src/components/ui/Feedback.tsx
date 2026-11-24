import { useEffect, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { SPACING, TYPOGRAPHY, UI } from '../../DesignSystem';

export function Alert({
  variant = 'error',
  children,
  className = '',
}: {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const baseClass =
    variant === 'success'
      ? UI.alertSuccess
      : variant === 'info'
      ? 'rounded-[var(--radius-control)] border border-blue-200 bg-blue-50 p-3.5 text-sm text-blue-900'
      : UI.alertError;

  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 ${baseClass} ${className}`.trim()}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${UI.surfaceCard} p-10 sm:p-14 text-center`}>
      {icon && <div className="mx-auto mb-4 flex justify-center text-slate-400">{icon}</div>}
      <h2 className="font-display text-xl font-bold text-navy-900">{title}</h2>
      {description && (
        <p className={`mt-2 max-w-md mx-auto ${TYPOGRAPHY.scale.body}`}>{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonGrid({
  count = 3,
  heightClass = 'h-64',
  columnsClass = 'md:grid-cols-2 lg:grid-cols-3',
}: {
  count?: number;
  heightClass?: string;
  columnsClass?: string;
}) {
  return (
    <div className={`grid gap-6 ${columnsClass}`} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${heightClass} rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)] animate-pulse`}
        />
      ))}
    </div>
  );
}

export function StatusLabel({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const normalized = status.toUpperCase();
  const colorClass =
    normalized === 'COMPLETED' || normalized === 'APPROVED' || normalized === 'RESOLVED'
      ? 'text-emerald-700'
      : normalized === 'CANCELLED' || normalized === 'REJECTED' || normalized === 'URGENT'
      ? 'text-red-700'
      : normalized === 'IN_PROGRESS' || normalized === 'TESTING' || normalized === 'SENT'
      ? 'text-blue-700'
      : 'text-[var(--color-ink-secondary)]';

  return (
    <span className={`text-xs font-semibold ${colorClass} ${className}`.trim()}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-heading"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface)] ${SPACING.cardPadLg} shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <div className={TYPOGRAPHY.scale.meta}>{eyebrow}</div>}
            <h2 id="modal-heading" className="mt-1 font-display text-xl sm:text-2xl font-bold text-navy-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-slate-500 hover:bg-[var(--color-surface-subtle)]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && (
          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
