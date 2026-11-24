import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Globe,
  Network,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type {
  BlogPostItem,
  CompanySettings,
  Locale,
  ProjectItem,
  ServiceItem,
} from '../types';
import { pickText, t } from '../i18n/translations';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { useNavigate } from 'react-router-dom';

const PROCESS_STEPS = [
  'Initial Consultation',
  'Requirement Analysis',
  'Proposal & Quotation',
  'Planning & Design',
  'Development & Implementation',
  'Testing & Quality Assurance',
  'Delivery & Deployment',
  'Maintenance & Support',
];

const SERVICE_ICONS: Record<string, typeof Globe> = {
  Globe,
  Cpu,
  ShieldCheck,
  Wrench,
  Network,
  Compass,
};

export function HomePage({
  locale,
  onLocaleChange,
  services,
  featuredProjects,
  latestPosts,
  settings,
  loading = false,
  error = null,
  onRetry,
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  services: ServiceItem[];
  featuredProjects: ProjectItem[];
  latestPosts: BlogPostItem[];
  settings: CompanySettings | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div>
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3">
          <div className={`${SPACING.container} flex flex-wrap items-center justify-between gap-3 text-sm text-red-800`}>
            <span>Unable to refresh latest catalog: {error}</span>
            {onRetry && (
              <button type="button" onClick={onRetry} className="font-semibold underline">
                Retry
              </button>
            )}
          </div>
        </div>
      )}
      {/* 1. PROPOSITION: Asymmetric 2-Column Hero Split */}
      <section className={UI.darkBanner}>
        <div className={`${SPACING.container} py-12 sm:py-16 lg:py-20`}>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-navy-800/80 pb-4">
            <p className="text-sm font-medium text-cyan-400">
              {t(locale, 'hero.tagline')}
            </p>
            <div
              className="flex items-center gap-1 rounded-[var(--radius-control)] border border-navy-800 bg-navy-900 p-1"
              role="group"
              aria-label="Language selector"
            >
              <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
              {(['en', 'om', 'am'] as Locale[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLocaleChange(code)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                    locale === code
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8 py-1">
              <div className="space-y-5">
                <h1 className={`${TYPOGRAPHY.scale.heroDisplay} text-white max-w-xl`}>
                  {t(locale, 'hero.headline')}
                </h1>
                <p className={`max-w-xl ${TYPOGRAPHY.scale.leadDark}`}>
                  {t(locale, 'hero.subcopy')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className={`${UI.btnPrimary} whitespace-nowrap shrink-0`}
                >
                  {t(locale, 'hero.ctaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/consultation')}
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-cyan-400 transition-colors whitespace-nowrap shrink-0 py-2"
                >
                  {t(locale, 'hero.ctaSecondary')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px] overflow-hidden rounded-xl border border-navy-800 bg-navy-900">
                <img
                  src="/src/assets/images/hero_afrinovera_studio_1795542908967.jpg"
                  alt="AFRINOVERA Technologies software and systems engineering studio"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Verified Statistics Strip (only when enabled in Admin Settings) */}
      {settings?.showStatsOnHome && settings.verifiedStats?.length > 0 && (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <div className={`${SPACING.container} py-8`}>
            <div className="grid gap-6 sm:grid-cols-3">
              {settings.verifiedStats.map((stat) => (
                <div key={stat.label.en} className="flex items-baseline gap-3">
                  <span className={`${TYPOGRAPHY.scale.monoMetric} text-3xl text-navy-900`}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-[var(--color-ink-secondary)]">
                    {pickText(stat.label, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. MECHANISM / CAPABILITIES: Asymmetric Bento Grid */}
      <section className={`${SPACING.sectionYLg} bg-[var(--color-surface)]`}>
        <div className={SPACING.container}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-[var(--color-border)] pb-8">
            <div className="max-w-2xl space-y-2">
              <h2 className={`${TYPOGRAPHY.scale.sectionHeadingLg} text-navy-900`}>
                {t(locale, 'section.capabilities')}
              </h2>
              <p className={TYPOGRAPHY.scale.leadLight}>
                {t(locale, 'section.capabilitiesSub')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className={`${UI.btnLink} whitespace-nowrap shrink-0 self-start sm:self-auto`}
            >
              View All Services <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-3">
            {loading && services.length === 0 ? (
              [0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-52 rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)] animate-pulse ${
                    idx === 0 || idx === 3 ? 'md:col-span-2' : 'md:col-span-1'
                  }`}
                />
              ))
            ) : (
              services.map((svc, idx) => {
              const isWide = idx === 0 || idx === 3;
              const Icon = SERVICE_ICONS[svc.icon] || Globe;
              return (
                <div
                  key={svc.id}
                  className={`flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/70 p-6 sm:p-7 hover:bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] transition-colors ${
                    isWide ? 'md:col-span-2' : 'md:col-span-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={TYPOGRAPHY.scale.monoIndex}>
                        0{idx + 1}.
                      </span>
                      <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-navy-900">
                      {pickText(svc.title, locale)}
                    </h3>
                    <p className={`mt-2.5 max-w-xl ${TYPOGRAPHY.scale.body}`}>
                      {pickText(svc.summary, locale)}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)]/80 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className={UI.btnLink}
                    >
                      Explore Details <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/quote?service=${svc.slug}`)}
                      className="inline-flex min-h-[40px] items-center text-xs font-semibold text-[var(--color-ink-secondary)] hover:text-navy-900"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      </section>

      {/* 3. PROOF / CASE STUDIES: Adjacent to Capabilities */}
      <section className={`${SPACING.sectionYLg} bg-[var(--color-surface-muted)] border-y border-[var(--color-border)]`}>
        <div className={SPACING.container}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-10">
            <div>
              <h2 className={`${TYPOGRAPHY.scale.sectionHeadingLg} text-navy-900`}>
                {t(locale, 'section.proof')}
              </h2>
              <p className={`mt-2 ${TYPOGRAPHY.scale.leadLight}`}>
                Selected software, web, and network implementations published with explicit client permission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/portfolio')}
              className={`${UI.btnLink} whitespace-nowrap shrink-0 self-start sm:self-auto`}
            >
              Full Portfolio <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className={`grid ${SPACING.gridGap} md:grid-cols-2 lg:grid-cols-3`}>
            {featuredProjects.map((project) => (
              <article
                key={project.id}
                className={`flex flex-col overflow-hidden ${UI.surfaceCardInteractive}`}
              >
                <div className="aspect-[4/3] bg-navy-900 overflow-hidden">
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={pickText(project.title, locale)}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-xs font-medium text-slate-300">
                      {pickText(project.title, locale)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className={TYPOGRAPHY.scale.meta}>
                    <span>{project.category.replace(/-/g, ' ')}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{project.referenceNumber}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-navy-900">
                    <button
                      type="button"
                      onClick={() => navigate(`/portfolio?project=${encodeURIComponent(project.slug)}`)}
                      className="text-left hover:text-blue-700 transition-colors"
                    >
                      {pickText(project.title, locale)}
                    </button>
                  </h3>
                  <p className={`mt-2 flex-1 ${TYPOGRAPHY.scale.body}`}>
                    {pickText(project.summary, locale)}
                  </p>
                  {project.results && (
                    <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-medium text-emerald-800">
                      Outcome: {pickText(project.results, locale)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE AFRINOVERA + 8-STEP PROCESS */}
      <section className={`${SPACING.sectionYLg} bg-[var(--color-surface)]`}>
        <div className={`${SPACING.container} grid gap-10 lg:gap-12 lg:grid-cols-12 items-start`}>
          <div className="lg:col-span-5 space-y-5">
            <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>
              Built for Reliability, Security, and Long-Term Ownership
            </h2>
            <p className={TYPOGRAPHY.scale.body}>
              AFRINOVERA Technologies unifies software development, authorized security assessments, hardware care, and infrastructure engineering under a single transparent Client Portal.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Centralized Client Portal with 9-stage milestone tracking',
                'Owner-authorized cybersecurity reviews and backup planning',
                'Itemized multi-currency quotations (USD, ETB, EUR)',
                'Dedicated support ticketing and ongoing maintenance plans',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/process')}
                className={UI.btnLink}
              >
                Explore Our Delivery Process <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-3.5 sm:gap-4 sm:grid-cols-2">
            {PROCESS_STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3.5 ${UI.surfaceCardMuted} px-4 py-3.5`}
              >
                <span className={TYPOGRAPHY.scale.monoIndex}>
                  0{index + 1}.
                </span>
                <span className="text-sm font-semibold text-navy-900">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST TECHNOLOGY INSIGHTS */}
      <section className={`${SPACING.sectionYLg} bg-[var(--color-surface-muted)] border-t border-[var(--color-border)]`}>
        <div className={SPACING.container}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-10">
            <div>
              <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>
                {t(locale, 'section.insights')}
              </h2>
              <p className={`mt-2 ${TYPOGRAPHY.scale.leadLight}`}>
                Engineering guides, cybersecurity practices, and operational architecture notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/insights')}
              className={`${UI.btnLink} whitespace-nowrap shrink-0 self-start sm:self-auto`}
            >
              Read All Articles <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className={`grid ${SPACING.gridGap} md:grid-cols-2 lg:grid-cols-3`}>
            {latestPosts.map((post) => (
              <article
                key={post.id}
                className={`flex flex-col overflow-hidden ${UI.surfaceCardInteractive}`}
              >
                {post.coverImageUrl && (
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt={pickText(post.title, locale)}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className={TYPOGRAPHY.scale.meta}>
                    <span>{pickText(post.categoryName, locale)}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-2.5 text-lg font-bold text-navy-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => navigate(`/insights/${post.slug}`)}
                      className="text-left hover:text-blue-700 transition-colors"
                    >
                      {pickText(post.title, locale)}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-ink-secondary)] line-clamp-3 flex-1">
                    {pickText(post.excerpt, locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONVERSION BANNER */}
      <section className={`bg-navy-900 ${SPACING.sectionY} text-white`}>
        <div className={`${SPACING.container} flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center`}>
          <div className="max-w-2xl">
            <h2 className={TYPOGRAPHY.scale.sectionHeading}>{t(locale, 'cta.bannerTitle')}</h2>
            <p className={`mt-2 ${TYPOGRAPHY.scale.leadBanner}`}>
              {t(locale, 'cta.bannerSub')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/quote')}
              className={UI.btnPrimary}
            >
              Request a Quotation
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className={UI.btnSecondaryDark}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
