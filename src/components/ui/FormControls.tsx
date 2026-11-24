import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { UI } from '../../DesignSystem';

export function FormField({
  label,
  required,
  compact = false,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  compact?: boolean;
  error?: string;
  hint?: string;
  children: (inputId: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={compact ? UI.labelCompact : UI.label}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      {children(id)}
      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function TextInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${UI.input} ${className}`.trim()} {...props} />;
}

export function TextArea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${UI.textarea} ${className}`.trim()} {...props} />;
}

export function SelectField({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${UI.select} ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}
