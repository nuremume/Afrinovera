import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Button, Card, PageHeroBanner } from '../components/ui';

const EIGHT_STEPS = [
  {
    step: '01',
    title: 'Initial Consultation',
    desc: 'We meet with you to understand your operational goals, target audience, and constraints.',
    deliverable: 'Discovery summary and scope direction',
  },
  {
    step: '02',
    title: 'Requirement Analysis',
    desc: 'Our analysts and engineers document user roles, functional workflows, security requirements, and dependencies.',
    deliverable: 'Validated technical specification',
  },
  {
    step: '03',
    title: 'Proposal & Quotation',
    desc: 'You receive an itemized quotation detailing deliverables, timeline, and pricing directly in the Client Portal.',
    deliverable: 'Formal quotation with reference number',
  },
  {
    step: '04',
    title: 'Planning & Design',
    desc: 'We design relational database schemas, system architecture, and responsive UI wireframes prior to build.',
    deliverable: 'Architecture blueprint and UI sign-off',
  },
  {
    step: '05',
    title: 'Development or Implementation',
    desc: 'Websites, software modules, security hardening, or office networks are built with transparent stage updates.',
    deliverable: 'Working milestones and staging reviews',
  },
  {
    step: '06',
    title: 'Testing & Quality Assurance',
    desc: 'Functional, security, responsiveness, and performance checks are completed across desktop and mobile devices.',
    deliverable: 'QA sign-off and user acceptance',
  },
  {
    step: '07',
    title: 'Delivery & Deployment',
    desc: 'Production launch with HTTPS, backup configuration, documentation, and hands-on team onboarding.',
    deliverable: 'Live deployment and documentation',
  },
  {
    step: '08',
    title: 'Maintenance & Support',
    desc: 'Continuous monitoring, updates, hardware care, and priority Client Portal support ticketing.',
    deliverable: 'Ongoing reliability and SLA support',
  },
];

export function ProcessPage() {
  const navigate = useNavigate();

  return (
    <div className={UI.pageShell}>
      <PageHeroBanner
        eyebrow="How We Deliver"
        title="Our 8-Step Delivery Process"
        description="Every project follows a structured eight-stage lifecycle from initial consultation through ongoing maintenance."
      />

      <div className={`${SPACING.containerNarrow} ${SPACING.contentPadY} space-y-5`}>
        {EIGHT_STEPS.map((item) => (
          <Card
            key={item.step}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-6 sm:p-7"
          >
            <div className={`${TYPOGRAPHY.scale.monoMetric} text-2xl text-blue-700 shrink-0`}>
              {item.step}.
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`${TYPOGRAPHY.scale.cardTitle} text-navy-900`}>{item.title}</h2>
              <p className={`mt-2 ${TYPOGRAPHY.scale.body}`}>{item.desc}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Output: {item.deliverable}
              </p>
            </div>
          </Card>
        ))}

        <Card
          variant="dark"
          padding="lg"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-xl font-bold">Ready to Begin Step 01?</h3>
            <p className="mt-1 text-sm text-slate-300">
              Book an initial consultation or request an online quotation today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 shrink-0">
            <Button variant="secondaryDark" onClick={() => navigate('/consultation')}>
              Book Consultation
            </Button>
            <Button onClick={() => navigate('/quote')}>
              Request Quote <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
