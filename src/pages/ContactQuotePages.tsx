import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, Mail, MapPin, Phone, ShieldAlert, UploadCloud } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CompanySettings, Locale, ServiceItem } from '../types';
import { pickText } from '../i18n/translations';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Alert, Button, Card, FormField, PageHeroBanner, SelectField, TextArea, TextInput } from '../components/ui';

export function QuotePage({
  locale,
  services,
}: {
  locale: Locale;
  services: ServiceItem[];
}) {
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const requestedService = query.get('service');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');
  const [serviceSlug, setServiceSlug] = useState(
    requestedService || services[0]?.slug || 'web-development-design'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [desiredCompletionDate, setDesiredCompletionDate] = useState('');
  const [securityAuth, setSecurityAuth] = useState(false);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string | null>(null);

  useEffect(() => {
    if (requestedService) {
      if (services.length === 0 || services.some((s) => s.slug === requestedService)) {
        setServiceSlug(requestedService);
      }
    } else if (services.length > 0 && !services.some((s) => s.slug === serviceSlug)) {
      setServiceSlug(services[0].slug);
    }
  }, [requestedService, services, serviceSlug]);

  useEffect(() => {
    if (!user) return;
    setFullName((prev) => prev || user.fullName || '');
    setEmail((prev) => prev || user.email || '');
    setPhone((prev) => prev || user.phone || '');
    setOrganizationName((prev) => prev || user.organizationName || '');
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest<{ referenceNumber: string }>('/api/public/quote-requests', {
        method: 'POST',
        token,
        body: JSON.stringify({
          fullName,
          email,
          phone,
          organizationName: organizationName || undefined,
          serviceSlug,
          title,
          description,
          estimatedBudget: estimatedBudget || undefined,
          desiredCompletionDate: desiredCompletionDate || undefined,
          securityAuthorizationConfirmed: securityAuth,
          attachmentNames,
        }),
      });
      setRefNumber(res.referenceNumber);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (refNumber) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-5">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className={`${TYPOGRAPHY.scale.sectionHeading} text-navy-900`}>Quotation Request Received</h1>
        <p className={TYPOGRAPHY.scale.body}>
          Your request has been logged and assigned a unique tracking reference number.
        </p>
        <div className={`inline-block ${UI.surfaceCardMuted} px-8 py-5`}>
          <p className={`${TYPOGRAPHY.scale.meta} font-semibold`}>Reference Number</p>
          <p className={`mt-1 ${TYPOGRAPHY.scale.monoMetric} text-2xl text-blue-700`}>{refNumber}</p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Button onClick={() => navigate('/portal')}>Track in Client Portal</Button>
          <Button
            variant="secondaryLight"
            onClick={() => {
              setRefNumber(null);
              setTitle('');
              setDescription('');
              setSecurityAuth(false);
              setAttachmentNames([]);
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${UI.pageShell} ${SPACING.pagePadY}`}>
      <div className={`${SPACING.container} grid gap-8 lg:gap-10 lg:grid-cols-12`}>
        <Card className="lg:col-span-8 p-5 sm:p-8 lg:p-10">
          <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold text-navy-900 tracking-tight">
            Request a Quote
          </h1>
          <p className={`mt-2 ${TYPOGRAPHY.scale.body}`}>
            Provide your project scope to receive a unique reference number and formal itemized quotation.
          </p>

          {error && <Alert className="mt-5">{error}</Alert>}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" required>
                {(id) => (
                  <TextInput id={id} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                )}
              </FormField>
              <FormField label="Email Address" required>
                {(id) => (
                  <TextInput id={id} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                )}
              </FormField>
              <FormField label="Phone Number" required>
                {(id) => (
                  <TextInput id={id} required value={phone} onChange={(e) => setPhone(e.target.value)} />
                )}
              </FormField>
              <FormField label="Organization (Optional)">
                {(id) => (
                  <TextInput id={id} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
                )}
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Required Service" required>
                {(id) => (
                  <SelectField id={id} value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {pickText(s.title, locale)}
                      </option>
                    ))}
                  </SelectField>
                )}
              </FormField>
              <FormField label="Project Title" required>
                {(id) => (
                  <TextInput
                    id={id}
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., School Management System"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Project Description" required>
              {(id) => (
                <TextArea
                  id={id}
                  required
                  minLength={15}
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goals, key features, and operational requirements..."
                />
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Estimated Budget (Optional)">
                {(id) => (
                  <TextInput
                    id={id}
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="e.g., $2,500 USD or ETB equivalent"
                  />
                )}
              </FormField>
              <FormField label="Desired Completion Date (Optional)">
                {(id) => (
                  <TextInput
                    id={id}
                    type="date"
                    value={desiredCompletionDate}
                    onChange={(e) => setDesiredCompletionDate(e.target.value)}
                  />
                )}
              </FormField>
            </div>

            {serviceSlug === 'cybersecurity-solutions' && (
              <div className="rounded-[var(--radius-card)] border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <label className="text-sm text-amber-900 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityAuth}
                    onChange={(e) => setSecurityAuth(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <span>
                    I confirm that I am the authorized owner or representative of the target systems or networks for any requested security assessment.
                  </span>
                </label>
              </div>
            )}

            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-5 text-center">
              <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
              <p className={`mt-1.5 ${TYPOGRAPHY.scale.meta} text-[var(--color-ink-secondary)]`}>
                Optional specifications or RFP documents (PDF, DOCX, PNG — up to 5 files)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 5);
                  setAttachmentNames(files.map((f) => f.name));
                }}
                className="mt-3 block w-full max-w-xs mx-auto text-xs text-[var(--color-ink-secondary)] file:mr-3 file:rounded-md file:border file:border-[var(--color-border-strong)] file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-[var(--color-surface-subtle)]"
              />
              {attachmentNames.length > 0 && (
                <p className="mt-2 text-xs font-medium text-blue-700 break-words">
                  Attached: {attachmentNames.join(', ')}
                </p>
              )}
            </div>

            <Button type="submit" loading={submitting} className="w-full sm:w-auto px-7">
              Submit Quotation Request
            </Button>
          </form>
        </Card>

        <aside className="lg:col-span-4 space-y-6">
          <Card variant="dark" padding="md">
            <h2 className="font-display text-lg font-bold">What Happens Next</h2>
            <ol className="mt-4 space-y-4 text-sm text-slate-300">
              <li><strong className="text-white">01. Instant Reference:</strong> Receive a unique tracking reference number immediately.</li>
              <li><strong className="text-white">02. Technical Review:</strong> Our engineering and consulting team evaluates your scope.</li>
              <li><strong className="text-white">03. Itemized Quotation:</strong> Review pricing, currency, and milestones inside your Client Portal.</li>
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ConsultationPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [meetingMode, setMeetingMode] = useState<'ONLINE' | 'IN_PERSON' | 'PHONE'>('ONLINE');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest<{ referenceNumber: string }>('/api/public/consultations', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          organizationName: organizationName || undefined,
          preferredDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Addis_Ababa',
          meetingMode,
          topic,
          notes: notes || undefined,
        }),
      });
      setRefNumber(res.referenceNumber);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${UI.pageShell} ${SPACING.pagePadY}`}>
      <div className="mx-auto max-w-2xl px-4">
        <Card padding="lg">
          {refNumber ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h1 className="font-display text-2xl font-bold text-navy-900">Consultation Requested</h1>
              <p className={TYPOGRAPHY.scale.body}>
                Reference: <span className={`${TYPOGRAPHY.scale.monoMetric} text-blue-700`}>{refNumber}</span>. Our team will confirm your session slot via email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-start sm:items-center gap-3">
                <CalendarClock className="h-7 w-7 text-blue-700 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <h1 className="font-display text-2xl font-bold text-navy-900">Request a Consultation</h1>
                  <p className={TYPOGRAPHY.scale.body}>
                    Book a discovery call with AFRINOVERA engineers and consultants.
                  </p>
                </div>
              </div>

              {error && <Alert>{error}</Alert>}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" required>
                  {(id) => <TextInput id={id} required value={fullName} onChange={(e) => setFullName(e.target.value)} />}
                </FormField>
                <FormField label="Email" required>
                  {(id) => <TextInput id={id} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                </FormField>
                <FormField label="Phone" required>
                  {(id) => <TextInput id={id} required value={phone} onChange={(e) => setPhone(e.target.value)} />}
                </FormField>
                <FormField label="Meeting Mode" required>
                  {(id) => (
                    <SelectField id={id} value={meetingMode} onChange={(e) => setMeetingMode(e.target.value as any)}>
                      <option value="ONLINE">Online Video Call</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="IN_PERSON">In-Person Meeting</option>
                    </SelectField>
                  )}
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Preferred Date & Time" required>
                  {(id) => (
                    <TextInput id={id} required type="datetime-local" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                  )}
                </FormField>
                <FormField label="Organization (Optional)">
                  {(id) => <TextInput id={id} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />}
                </FormField>
              </div>

              <FormField label="Consultation Topic" required>
                {(id) => (
                  <TextInput
                    id={id}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Digital transformation strategy or security review"
                  />
                )}
              </FormField>

              <FormField label="Additional Notes">
                {(id) => <TextArea id={id} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />}
              </FormField>

              <Button type="submit" loading={submitting} fullWidth>
                Book Consultation
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export function ContactPage({
  locale,
  settings,
}: {
  locale: Locale;
  settings: CompanySettings | null;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest<{ referenceNumber: string }>('/api/public/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          organizationName: organizationName || undefined,
          subject,
          message,
        }),
      });
      setRefNumber(res.referenceNumber);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={UI.pageShell}>
      <PageHeroBanner
        eyebrow="Get in Touch"
        title="Contact AFRINOVERA"
        description="Reach our engineering, sales, or support team directly for inquiries and partnerships."
      />

      <div className={`${SPACING.container} ${SPACING.contentPadY} grid gap-8 lg:gap-10 lg:grid-cols-12`}>
        <div className="lg:col-span-5 space-y-6">
          <Card padding="md" className="space-y-5">
            <h2 className={`${TYPOGRAPHY.scale.cardTitle} text-navy-900`}>Contact Information</h2>
            <div className="flex items-start gap-3 text-sm">
              <Mail className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-navy-900">Email</p>
                <p className="text-[var(--color-ink-secondary)] break-all">{settings?.primaryEmail || 'info@afrinovera.com'}</p>
                <p className={`mt-0.5 ${TYPOGRAPHY.scale.meta} break-all`}>
                  Support: {settings?.supportEmail || 'support@afrinovera.com'}
                </p>
              </div>
            </div>
            {settings?.phone && (
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-navy-900">Phone</p>
                  <p className="text-[var(--color-ink-secondary)]">{settings.phone}</p>
                </div>
              </div>
            )}
            {settings?.officeAddress && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-navy-900">Office</p>
                  <p className="text-[var(--color-ink-secondary)]">{settings.officeAddress}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-navy-900">Business Hours</p>
                <p className="text-[var(--color-ink-secondary)]">
                  {settings?.businessHours
                    ? pickText(settings.businessHours, locale)
                    : 'Mon – Fri: 8:30 AM – 5:30 PM EAT'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-7 p-6 sm:p-10">
          {refNumber ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h2 className="font-display text-2xl font-bold text-navy-900">Inquiry Sent</h2>
              <p className={TYPOGRAPHY.scale.body}>
                Reference Number: <span className={`${TYPOGRAPHY.scale.monoMetric} text-blue-700`}>{refNumber}</span>
              </p>
              <Button variant="secondaryLight" onClick={() => setRefNumber(null)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-navy-900">Send a Message</h2>
              {error && <Alert>{error}</Alert>}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" required>
                  {(id) => <TextInput id={id} required value={fullName} onChange={(e) => setFullName(e.target.value)} />}
                </FormField>
                <FormField label="Email" required>
                  {(id) => <TextInput id={id} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                </FormField>
                <FormField label="Phone">
                  {(id) => <TextInput id={id} value={phone} onChange={(e) => setPhone(e.target.value)} />}
                </FormField>
                <FormField label="Organization">
                  {(id) => <TextInput id={id} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />}
                </FormField>
              </div>
              <FormField label="Subject" required>
                {(id) => <TextInput id={id} required value={subject} onChange={(e) => setSubject(e.target.value)} />}
              </FormField>
              <FormField label="Message" required>
                {(id) => <TextArea id={id} required minLength={10} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />}
              </FormField>
              <Button type="submit" loading={submitting} className="w-full sm:w-auto px-7">
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
