import type { ReactNode } from 'react';
import { SPACING, TYPOGRAPHY, UI } from '../../DesignSystem';

export function Card({
  variant = 'surface',
  padding = 'md',
  className = '',
  children,
}: {
  variant?: 'surface' | 'interactive' | 'muted' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}) {
  const surfaceClass =
    variant === 'interactive'
      ? UI.surfaceCardInteractive
      : variant === 'muted'
      ? UI.surfaceCardMuted
      : variant === 'dark'
      ? UI.darkCard
      : UI.surfaceCard;

  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-4 sm:p-5'
      : padding === 'lg'
      ? SPACING.cardPadLg
      : SPACING.cardPad;

  return <div className={`${surfaceClass} ${padClass} ${className}`.trim()}>{children}</div>;
}

export function PageHeroBanner({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`${UI.darkBanner} ${SPACING.sectionY}`}>
      <div className={SPACING.container}>
        {eyebrow && <p className={TYPOGRAPHY.scale.eyebrowDark}>{eyebrow}</p>}
        <h1 className={`${eyebrow ? 'mt-2 ' : ''}${TYPOGRAPHY.scale.pageTitle}`}>{title}</h1>
        {description && (
          <p className={`mt-3 max-w-2xl ${TYPOGRAPHY.scale.leadBanner}`}>{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-[var(--color-border)] pb-8">
      <div className="max-w-2xl space-y-2">
        <h2 className={`${TYPOGRAPHY.scale.sectionHeadingLg} text-navy-900`}>{title}</h2>
        {subtitle && <p className={TYPOGRAPHY.scale.leadLight}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
}
