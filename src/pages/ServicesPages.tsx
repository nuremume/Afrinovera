import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Locale, ServiceItem } from '../types';
import { pickList, pickText } from '../i18n/translations';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Button, Card, EmptyState, PageHeroBanner, SkeletonGrid } from '../components/ui';

export function ServicesOverviewPage({
  locale,
  services,
  loading = false,
}: {
  locale: Locale;
  services: ServiceItem[];
  loading?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className={UI.pageShell}>
      <PageHeroBanner
        eyebrow="Technology Services & Digital Solutions"
        title="Our Services"
        description="Six specialized practice areas engineered to build, secure, and maintain your digital operations."
      />

      <div className={`${SPACING.container} ${SPACING.contentPadY}`}>
        {loading && services.length === 0 ? (
          <SkeletonGrid count={6} heightClass="h-56" />
        ) : services.length === 0 ? (
          <EmptyState
            title="No Services Published"
            description="Published technology services will appear here once configured."
            action={
              <Button onClick={() => navigate('/contact')}>Contact AFRINOVERA</Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, idx) => (
              <Card
                key={svc.id}
                variant="interactive"
                className="flex flex-col justify-between p-6 sm:p-7"
              >
                <div>
                  <p className={TYPOGRAPHY.scale.monoIndex}>0{idx + 1}.</p>
                  <h2 className="mt-2 text-xl font-bold text-navy-900">
                    {pickText(svc.title, locale)}
                  </h2>
                  <p className={`mt-2.5 ${TYPOGRAPHY.scale.body}`}>
                    {pickText(svc.summary, locale)}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <Button
                    variant="link"
                    onClick={() => navigate(`/services/${svc.slug}`)}
                  >
                    Service Details <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate(`/quote?service=${svc.slug}`)}
                    className="min-h-[40px] px-2 text-xs font-semibold text-[var(--color-ink-secondary)] hover:text-navy-900"
                  >
                    Get Quote
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ServiceDetailPage({
  locale,
  services,
  loading = false,
}: {
  locale: Locale;
  services: ServiceItem[];
  loading?: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const service = services.find((s) => s.slug === slug);

  if (loading && !service) {
    return (
      <div className={`${SPACING.container} ${SPACING.contentPadY} space-y-6`}>
        <div className="h-44 rounded-[var(--radius-card)] bg-slate-200 animate-pulse" />
        <SkeletonGrid count={2} heightClass="h-64" columnsClass="lg:grid-cols-2" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="Service Not Found"
          description="The requested service page is unavailable."
          action={
            <Button onClick={() => navigate('/services')}>View All Services</Button>
          }
        />
      </div>
    );
  }

  const problems = pickList(service.problemsAddressed, locale);
  const solutions = pickList(service.solutionsOffered, locale);
  const benefits = pickList(service.benefits, locale);

  return (
    <div>
      <section className={`${UI.darkBanner} ${SPACING.sectionY}`}>
        <div className={SPACING.container}>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Services
          </button>

          <div className="max-w-3xl space-y-5">
            <h1 className={TYPOGRAPHY.scale.pageTitle}>
              {pickText(service.title, locale)}
            </h1>
            <p className={TYPOGRAPHY.scale.leadDark}>
              {pickText(service.overview, locale)}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-2">
              <Button onClick={() => navigate(`/quote?service=${service.slug}`)}>
                Request a Quotation <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondaryDark" onClick={() => navigate('/consultation')}>
                Book a Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {service.slug === 'cybersecurity-solutions' && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className={`${SPACING.container} py-4 flex items-start gap-3 text-sm text-amber-900`}>
            <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Authorized Testing Standard:</strong> All security assessments and testing performed by AFRINOVERA Technologies require formal written authorization from the verified system or network owner.
            </p>
          </div>
        </div>
      )}

      <section className={`${SPACING.sectionY} bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]`}>
        <div className={`${SPACING.container} grid gap-6 lg:gap-8 lg:grid-cols-2`}>
          <Card padding="lg">
            <div className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <span>Problems Addressed</span>
            </div>
            <ul className="mt-5 space-y-3.5">
              {problems.map((p) => (
                <li key={p} className="text-sm leading-relaxed text-slate-700">
                  • {p}
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0" />
              <span>Solutions Offered</span>
            </div>
            <ul className="mt-5 space-y-3.5">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className={`${SPACING.sectionY} bg-[var(--color-surface)]`}>
        <div className={SPACING.container}>
          <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>Key Business Benefits</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {benefits.map((b, i) => (
              <Card key={b} variant="muted" padding="md">
                <span className={TYPOGRAPHY.scale.monoIndex}>0{i + 1}.</span>
                <p className="mt-2 text-sm leading-relaxed font-medium text-slate-800">{b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={`${SPACING.sectionY} bg-[var(--color-surface-muted)] border-t border-[var(--color-border)]`}>
        <div className={SPACING.container}>
          <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>Delivery Process</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.deliveryProcess.map((st) => (
              <Card key={st.step} padding="md">
                <span className={TYPOGRAPHY.scale.monoIndex}>0{st.step}.</span>
                <h3 className="mt-2 font-bold text-navy-900">{st.title}</h3>
                <p className={`mt-2 ${TYPOGRAPHY.scale.body}`}>{st.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {service.faqs.length > 0 && (
        <section className={`${SPACING.sectionY} bg-[var(--color-surface)] border-t border-[var(--color-border)]`}>
          <div className={`${SPACING.containerProse} lg:px-8`}>
            <h2 className="text-2xl font-bold text-navy-900 text-center">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 space-y-3">
              {service.faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <Card key={faq.id} padding="none" className="overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex min-h-[48px] w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-900 hover:bg-[var(--color-surface-muted)]"
                    >
                      <span>{pickText(faq.question, locale)}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-[var(--color-surface-muted)] px-5 py-4 text-sm text-[var(--color-ink-secondary)] leading-relaxed">
                        {pickText(faq.answer, locale)}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
