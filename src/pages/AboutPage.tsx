import { useState } from 'react';
import { ArrowRight, Award, ChevronDown, Compass, Eye, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Button, Card, PageHeroBanner } from '../components/ui';

const CORE_VALUES = [
  {
    title: 'Innovation Beyond Boundaries',
    desc: 'We design practical, forward-looking digital systems that solve real operational constraints.',
    icon: Lightbulb,
  },
  {
    title: 'Engineering Integrity',
    desc: 'Maintainable code, honest schedules, and clear milestone communication from day one.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer-Focused Execution',
    desc: 'Every product and service engagement is anchored around measurable business outcomes.',
    icon: Users,
  },
  {
    title: 'Security & Reliability',
    desc: 'Data protection, authorized security reviews, and backup resilience are built into every project.',
    icon: Award,
  },
];

const GENERAL_FAQS = [
  {
    q: 'Who does AFRINOVERA Technologies work with?',
    a: 'We serve individuals, SMEs, schools, NGOs, and enterprise organizations locally and internationally.',
  },
  {
    q: 'How can I track my service request or project?',
    a: 'Register in the Client Portal using your email address to review quotations, approve milestones, and track all 9 project lifecycle stages.',
  },
  {
    q: 'Does AFRINOVERA provide ongoing IT support after delivery?',
    a: 'Yes. Clients can open support tickets inside the portal or contract scheduled software, security, and network maintenance.',
  },
];

export function AboutPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <PageHeroBanner
        eyebrow="About AFRINOVERA Technologies"
        title="Building Reliable Digital Foundations for Modern Organizations."
        description="AFRINOVERA Technologies is a technology services company delivering web platforms, custom software, cybersecurity solutions, computer repair, and IT infrastructure under one accountable engineering team."
      />

      <section className={`${SPACING.sectionY} bg-[var(--color-surface)]`}>
        <div className={`${SPACING.container} grid gap-10 lg:gap-12 lg:grid-cols-2 items-start`}>
          <div className="space-y-4">
            <p className={TYPOGRAPHY.scale.eyebrowLight}>Our Story</p>
            <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>Why AFRINOVERA Exists</h2>
            <p className={TYPOGRAPHY.scale.leadLight}>
              Organizations often have to coordinate fragmented vendors—one contractor for a website, another for software, and separate technicians for networking or computer maintenance. AFRINOVERA unifies all six technology disciplines inside one cohesive digital infrastructure.
            </p>
            <p className={TYPOGRAPHY.scale.leadLight}>
              Guided by our tagline, <strong>“Innovation Beyond Boundaries.”</strong>, we focus on dependable systems that solve real problems today and scale cleanly for future digital products.
            </p>
          </div>

          <div className="space-y-5">
            <Card variant="muted" className="p-6 sm:p-7">
              <div className="flex items-center gap-2.5 text-lg font-bold text-navy-900">
                <Eye className="h-5 w-5 text-blue-700 shrink-0" /> Our Vision
              </div>
              <p className={`mt-2.5 ${TYPOGRAPHY.scale.body}`}>
                To become a trusted international technology partner enabling businesses and institutions to operate with secure, intelligent, and scalable digital systems.
              </p>
            </Card>
            <Card variant="muted" className="p-6 sm:p-7">
              <div className="flex items-center gap-2.5 text-lg font-bold text-navy-900">
                <Target className="h-5 w-5 text-blue-700 shrink-0" /> Our Mission
              </div>
              <p className={`mt-2.5 ${TYPOGRAPHY.scale.body}`}>
                To deliver practical web, software, cybersecurity, hardware, and IT infrastructure solutions backed by transparent communication and lasting client support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className={`${SPACING.sectionY} bg-[var(--color-surface-muted)] border-y border-[var(--color-border)]`}>
        <div className={SPACING.container}>
          <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900 text-center`}>Core Values</h2>
          <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <Card key={val.title} padding="md">
                  <Icon className="h-5 w-5 text-blue-700" />
                  <h3 className="mt-4 font-bold text-navy-900">{val.title}</h3>
                  <p className={`mt-2 ${TYPOGRAPHY.scale.body}`}>{val.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${SPACING.sectionY} bg-[var(--color-surface)]`}>
        <div className={`${SPACING.container} grid gap-8 lg:gap-10 lg:grid-cols-2`}>
          <Card variant="dark" padding="lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <Compass className="h-5 w-5 shrink-0" /> Our Approach
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold">Structured, Transparent Execution</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Every project begins with requirement analysis, proceeds through itemized proposal approval and modular development, undergoes rigorous QA verification, and continues with dedicated portal support.
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="text-xl sm:text-2xl font-bold text-navy-900">Company Goals & Multidisciplinary Practices</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              <li>• Web & Full-Stack Software Engineering Practice</li>
              <li>• Owner-Authorized Cybersecurity & Resilience Team</li>
              <li>• IT Infrastructure, Networking & System Repair Unit</li>
              <li>• Project Management & Client Success Support Desk</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className={`${SPACING.sectionY} bg-[var(--color-surface-muted)] border-t border-[var(--color-border)]`}>
        <div className={`${SPACING.containerProse} lg:px-8`}>
          <h2 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900 text-center`}>
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-3">
            {GENERAL_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card key={faq.q} padding="none" className="overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex min-h-[48px] w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-900 hover:bg-[var(--color-surface-muted)]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-[var(--color-surface-muted)] px-5 py-4 text-sm text-[var(--color-ink-secondary)] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Button onClick={() => navigate('/quote')}>
              Work With AFRINOVERA <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
