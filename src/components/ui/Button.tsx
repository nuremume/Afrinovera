import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { UI } from '../../DesignSystem';

export type ButtonVariant =
  | 'primary'
  | 'primaryCompact'
  | 'navy'
  | 'secondaryDark'
  | 'secondaryLight'
  | 'link'
  | 'danger'
  | 'success';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: UI.btnPrimary,
  primaryCompact: UI.btnPrimaryCompact,
  navy: UI.btnNavy,
  secondaryDark: UI.btnSecondaryDark,
  secondaryLight: UI.btnSecondaryLight,
  link: UI.btnLink,
  danger:
    'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60',
  success:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}
