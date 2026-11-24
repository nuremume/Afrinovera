/**
 * AFRINOVERA Technologies — Unified Design System Tokens & Semantic Component Primitives
 * Centralizes brand colors, typography scales, spacing units, radii, and CSS variable mappings.
 */

export const BRAND_COLORS = {
  // Primary Brand Navy
  navy950: '#060E1F',
  navy900: '#0A192F',
  navy800: '#112240',

  // Primary Action Blue
  blue700: '#1D4ED8',
  blue600: '#2563EB',
  blue50: '#EFF6FF',

  // Technical Accent Cyan
  cyan500: '#06B6D4',
  cyan400: '#22D3EE',

  // Semantic Surfaces
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceSubtle: '#F1F5F9',

  // Borders
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Ink / Text Hierarchy
  inkPrimary: '#0F172A',
  inkSecondary: '#475569',
  inkMuted: '#64748B',

  // Status
  success700: '#047857',
  warning700: '#B45309',
  danger700: '#B91C1C',
} as const;

export const TYPOGRAPHY = {
  fonts: {
    display: "'Plus Jakarta Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif",
    sans: "'Public Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
  scale: {
    heroDisplay:
      'font-display text-[clamp(2rem,4vw,3.35rem)] font-extrabold tracking-tight leading-[1.12]',
    pageTitle:
      'font-display text-[clamp(1.875rem,4vw,3rem)] font-extrabold tracking-tight leading-tight',
    articleTitle:
      'font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight leading-tight',
    sectionHeading: 'font-display text-2xl sm:text-3xl font-bold tracking-tight',
    sectionHeadingLg: 'font-display text-2xl sm:text-4xl font-bold tracking-tight',
    cardTitle: 'font-display text-lg sm:text-xl font-bold',
    eyebrowDark: 'text-xs font-semibold text-cyan-400',
    eyebrowLight: 'text-xs font-semibold text-blue-700',
    leadDark: 'text-base sm:text-lg text-slate-300 leading-relaxed',
    leadBanner: 'text-sm sm:text-base text-slate-300 leading-relaxed',
    leadLight: 'text-sm sm:text-base text-[var(--color-ink-secondary)] leading-relaxed',
    body: 'text-sm leading-relaxed text-[var(--color-ink-secondary)]',
    meta: 'text-xs text-[var(--color-ink-muted)]',
    monoRef: 'font-mono text-xs font-semibold tabular-nums',
    monoIndex: 'font-mono text-xs font-bold tabular-nums text-blue-700',
    monoMetric: 'font-mono font-bold tabular-nums',
  },
} as const;

export const SPACING = {
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  containerNarrow: 'mx-auto max-w-5xl px-4 sm:px-6 lg:px-8',
  containerProse: 'mx-auto max-w-3xl px-4 sm:px-6',
  sectionY: 'py-14 sm:py-16',
  sectionYLg: 'py-16 sm:py-20',
  pagePadY: 'py-10 sm:py-14',
  contentPadY: 'py-12 sm:py-14',
  cardPad: 'p-5 sm:p-6',
  cardPadLg: 'p-6 sm:p-8',
  gridGap: 'gap-6 sm:gap-8',
  touchMin: 'min-h-[44px]',
  touchCompact: 'min-h-[40px]',
} as const;

export const RADII = {
  card: '0.75rem',
  control: '0.5rem',
} as const;

export const CSS_VARS: Record<string, string> = {
  '--color-navy-950': BRAND_COLORS.navy950,
  '--color-navy-900': BRAND_COLORS.navy900,
  '--color-navy-800': BRAND_COLORS.navy800,
  '--color-blue-700': BRAND_COLORS.blue700,
  '--color-blue-600': BRAND_COLORS.blue600,
  '--color-blue-50': BRAND_COLORS.blue50,
  '--color-cyan-500': BRAND_COLORS.cyan500,
  '--color-cyan-400': BRAND_COLORS.cyan400,
  '--color-surface': BRAND_COLORS.surface,
  '--color-surface-muted': BRAND_COLORS.surfaceMuted,
  '--color-surface-subtle': BRAND_COLORS.surfaceSubtle,
  '--color-border': BRAND_COLORS.border,
  '--color-border-strong': BRAND_COLORS.borderStrong,
  '--color-ink-primary': BRAND_COLORS.inkPrimary,
  '--color-ink-secondary': BRAND_COLORS.inkSecondary,
  '--color-ink-muted': BRAND_COLORS.inkMuted,
  '--radius-card': RADII.card,
  '--radius-control': RADII.control,
};

export function applyDesignSystemCssVars(): void {
  if (typeof document === 'undefined') return;
  const rootStyle = document.documentElement.style;
  for (const [key, value] of Object.entries(CSS_VARS)) {
    rootStyle.setProperty(key, value);
  }
}

/**
 * Semantic component token classes consumed across public pages, Client Portal, and Admin Console.
 */
export const UI = {
  pageShell: 'min-h-[100dvh] bg-[var(--color-surface-muted)]',
  pageShellWhite: 'min-h-[100dvh] flex flex-col bg-[var(--color-surface)] text-[var(--color-ink-primary)]',
  darkBanner: 'bg-navy-950 text-white border-b border-navy-800',
  darkCard: 'rounded-[var(--radius-card)] bg-navy-900 text-white',
  surfaceCard: 'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]',
  surfaceCardInteractive:
    'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-300 transition-colors',
  surfaceCardMuted:
    'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]',

  btnPrimary:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-60',
  btnPrimaryCompact:
    'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-60',
  btnNavy:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-colors disabled:opacity-60',
  btnSecondaryDark:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] border border-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-colors',
  btnSecondaryLight:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[var(--color-surface-muted)] transition-colors',
  btnLink:
    'inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-600 transition-colors',

  input:
    'w-full min-h-[44px] rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2 text-base sm:text-sm text-[var(--color-ink-primary)] placeholder-slate-400 focus:border-blue-600 focus:outline-none',
  textarea:
    'w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-base sm:text-sm text-[var(--color-ink-primary)] placeholder-slate-400 focus:border-blue-600 focus:outline-none',
  select:
    'w-full min-h-[44px] rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2 text-base sm:text-sm text-[var(--color-ink-primary)] focus:border-blue-600 focus:outline-none',
  label: 'block text-sm font-semibold text-slate-700 mb-1',
  labelCompact: 'block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1',

  tabList:
    'flex w-full sm:w-auto sm:inline-flex items-center gap-1 overflow-x-auto rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-1',
  tabButtonBase:
    'min-h-[38px] shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors',
  tabActive: 'bg-white text-navy-900 shadow-sm',
  tabInactive: 'text-[var(--color-ink-secondary)] hover:text-navy-900',

  alertError: 'rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3.5 text-sm text-red-700',
  alertSuccess:
    'rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800',
} as const;
