import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Clock,
  FileText,
  FolderKanban,
  LifeBuoy,
  LogOut,
  Plus,
  Send,
  User,
} from 'lucide-react';
import type {
  QuotationItem,
  ProjectItem,
  ServiceRequestItem,
  SupportTicketItem,
} from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';

const PROJECT_STAGES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUOTATION_SENT',
  'AWAITING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'TESTING',
  'COMPLETED',
] as const;

function ProjectStepper({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <p className="text-xs font-semibold text-red-700">Status: Cancelled</p>
    );
  }
  const currentIdx = PROJECT_STAGES.indexOf(status as any);
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {PROJECT_STAGES.map((stage, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-1.5 shrink-0">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                done
                  ? 'bg-emerald-700 text-white'
                  : active
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </span>
            <span
              className={`text-xs whitespace-nowrap ${
                active ? 'font-bold text-navy-900' : 'text-[var(--color-ink-muted)]'
              }`}
            >
              {stage.replace(/_/g, ' ')}
            </span>
            {idx < PROJECT_STAGES.length - 1 && (
              <span className="h-px w-4 bg-slate-300" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ClientPortalPage() {
  const { token, user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'overview' | 'requests' | 'quotations' | 'projects' | 'support' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);

  // New Ticket Form
  const [ticketCategory, setTicketCategory] = useState<'GENERAL' | 'TECHNICAL_ISSUE' | 'BILLING_QUOTATION' | 'SECURITY_INCIDENT' | 'FEATURE_REQUEST'>('TECHNICAL_ISSUE');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Profile Form
  const [profName, setProfName] = useState(user?.fullName || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profOrg, setProfOrg] = useState(user?.organizationName || '');
  const [profSaved, setProfSaved] = useState(false);

  useEffect(() => {
    setProfName(user?.fullName || '');
    setProfPhone(user?.phone || '');
    setProfOrg(user?.organizationName || '');
  }, [user]);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{
        requests: ServiceRequestItem[];
        quotations: QuotationItem[];
        projects: ProjectItem[];
        tickets: SupportTicketItem[];
      }>('/api/portal/dashboard', { token });
      setRequests(data.requests);
      setQuotations(data.quotations);
      setProjects(data.projects);
      setTickets(data.tickets);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function cancelRequest(id: string) {
    setError(null);
    setBusyAction(`cancel-${id}`);
    try {
      await apiRequest(`/api/portal/requests/${id}/cancel`, { method: 'PATCH', token });
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || 'Unable to cancel request.');
    } finally {
      setBusyAction(null);
    }
  }

  async function respondQuotation(id: string, decision: 'APPROVED' | 'REVISION_REQUESTED') {
    setError(null);
    setBusyAction(`quote-${id}`);
    try {
      await apiRequest(`/api/portal/quotations/${id}/respond`, {
        method: 'POST',
        token,
        body: JSON.stringify({ decision }),
      });
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || 'Unable to update quotation response.');
    } finally {
      setBusyAction(null);
    }
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusyAction('create-ticket');
    try {
      await apiRequest('/api/portal/support-tickets', {
        method: 'POST',
        token,
        body: JSON.stringify({
          category: ticketCategory,
          priority: ticketPriority,
          subject: ticketSubject,
          message: ticketMessage,
        }),
      });
      setTicketSubject('');
      setTicketMessage('');
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || 'Unable to create support ticket.');
    } finally {
      setBusyAction(null);
    }
  }

  async function sendTicketReply(ticketId: string) {
    const body = replyDrafts[ticketId]?.trim();
    if (!body || body.length < 2) {
      setError('Please enter at least 2 characters for your ticket reply.');
      return;
    }
    setError(null);
    setBusyAction(`reply-${ticketId}`);
    try {
      await apiRequest(`/api/portal/support-tickets/${ticketId}/messages`, {
        method: 'POST',
        token,
        body: JSON.stringify({ body }),
      });
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || 'Unable to send reply.');
    } finally {
      setBusyAction(null);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusyAction('save-profile');
    try {
      const res = await apiRequest<{ user: any }>('/api/portal/profile', {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          fullName: profName,
          phone: profPhone || undefined,
          organizationName: profOrg || undefined,
        }),
      });
      updateUser(res.user);
      setProfSaved(true);
      setTimeout(() => setProfSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Unable to save profile.');
    } finally {
      setBusyAction(null);
    }
  }

  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Requests' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'projects', label: 'Projects' },
    { id: 'support', label: 'Support' },
    { id: 'profile', label: 'Profile' },
  ] as const;

  return (
    <div className={UI.pageShell}>
      {/* Portal Top Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className={`${SPACING.container} py-4 flex flex-wrap items-center justify-between gap-4`}>
          <div className="min-w-0">
            <p className={`${TYPOGRAPHY.scale.meta} truncate`}>Client Portal · {user?.email}</p>
            <h1 className="font-display text-xl font-bold text-navy-900 truncate">
              Welcome, {user?.fullName}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/quote')}
              className={UI.btnPrimaryCompact}
            >
              <Plus className="h-3.5 w-3.5" /> New Request
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className={`${UI.btnSecondaryLight} min-h-[40px] px-3.5 py-2 text-xs`}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs */}
        <div className={`${SPACING.container} pb-3`}>
          <div className={UI.tabList}>
            {navTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`${UI.tabButtonBase} ${
                  tab === item.id ? UI.tabActive : UI.tabInactive
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${SPACING.container} py-6 sm:py-8`}>
        {error && <div className={`mb-6 ${UI.alertError}`}>{error}</div>}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 rounded-[var(--radius-card)] bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Service Requests', val: requests.length, icon: Clock },
                    { label: 'Pending Quotations', val: quotations.filter((q) => q.status === 'SENT').length, icon: FileText },
                    { label: 'Projects', val: projects.length, icon: FolderKanban },
                    { label: 'Open Support Tickets', val: tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length, icon: LifeBuoy },
                  ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={kpi.label} className={`${UI.surfaceCard} p-5 flex items-center justify-between`}>
                        <div>
                          <p className={`${TYPOGRAPHY.scale.meta} font-medium`}>{kpi.label}</p>
                          <p className={`mt-1.5 ${TYPOGRAPHY.scale.monoMetric} text-2xl text-navy-900`}>
                            {kpi.val}
                          </p>
                        </div>
                        <Icon className="h-5 w-5 text-blue-700 shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {projects.length === 0 ? (
                  <div className={`${UI.surfaceCard} p-8 text-center`}>
                    <p className="text-sm font-semibold text-navy-900">No Active Delivery Projects Yet</p>
                    <p className={`mt-1 ${TYPOGRAPHY.scale.meta} text-[var(--color-ink-secondary)]`}>
                      Submit a service request and approve a quotation to begin live 9-stage tracking.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="font-display text-base font-bold text-navy-900">Active Project Tracking</h2>
                    {projects.map((p) => (
                      <div key={p.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-mono text-xs text-[var(--color-ink-muted)]">{p.referenceNumber}</p>
                            <h3 className="font-display text-lg font-bold text-navy-900">{p.title.en}</h3>
                          </div>
                          <span className={`${TYPOGRAPHY.scale.monoMetric} text-sm text-blue-700`}>
                            {p.progressPercent}% Complete
                          </span>
                        </div>
                        <ProjectStepper status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'requests' && (
              <div className={`${UI.surfaceCard} overflow-hidden`}>
                <div className="border-b border-[var(--color-border)] px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-base font-bold text-navy-900">My Service Requests</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/quote')}
                    className="min-h-[36px] text-xs font-semibold text-blue-700 hover:underline"
                  >
                    + Submit Request
                  </button>
                </div>
                {requests.length === 0 ? (
                  <div className={`p-8 text-center ${TYPOGRAPHY.scale.body}`}>
                    No service requests submitted under your email yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs font-semibold text-[var(--color-ink-muted)]">
                        <tr>
                          <th className="px-4 sm:px-5 py-3 whitespace-nowrap">Reference</th>
                          <th className="px-4 sm:px-5 py-3">Title</th>
                          <th className="px-4 sm:px-5 py-3 whitespace-nowrap">Service</th>
                          <th className="px-4 sm:px-5 py-3 whitespace-nowrap">Status</th>
                          <th className="px-4 sm:px-5 py-3 text-right whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map((r) => (
                          <tr key={r.id} className="hover:bg-[var(--color-surface-muted)]">
                            <td className={`px-4 sm:px-5 py-3 ${TYPOGRAPHY.scale.monoRef} text-blue-700 whitespace-nowrap`}>{r.referenceNumber}</td>
                            <td className="px-4 sm:px-5 py-3 font-medium text-navy-900 min-w-[180px]">{r.title}</td>
                            <td className="px-4 sm:px-5 py-3 text-xs text-[var(--color-ink-secondary)] whitespace-nowrap">{r.serviceSlug}</td>
                            <td className="px-4 sm:px-5 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">{r.status.replace(/_/g, ' ')}</td>
                            <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap">
                              {['SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_SENT'].includes(r.status) && (
                                <button
                                  type="button"
                                  disabled={busyAction === `cancel-${r.id}`}
                                  onClick={() => cancelRequest(r.id)}
                                  className="min-h-[36px] px-2 text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                                >
                                  {busyAction === `cancel-${r.id}` ? 'Cancelling...' : 'Cancel Request'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'quotations' && (
              <div className="space-y-4">
                {quotations.length === 0 ? (
                  <div className={`${UI.surfaceCard} p-10 text-center ${TYPOGRAPHY.scale.body}`}>
                    No quotations received yet.
                  </div>
                ) : (
                  quotations.map((q) => (
                    <div key={q.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <p className="font-mono text-xs text-[var(--color-ink-muted)]">
                            {q.referenceNumber} · Status: {q.status.replace(/_/g, ' ')}
                          </p>
                          <h3 className="mt-1 font-display text-lg font-bold text-navy-900">{q.title}</h3>
                        </div>
                        <p className={`${TYPOGRAPHY.scale.monoMetric} text-xl text-navy-900`}>
                          {q.currency} {q.totalAmount.toFixed(2)}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-[var(--color-ink-muted)] border-b border-slate-100">
                              <th className="py-2 pr-4 text-left">Item</th>
                              <th className="py-2 px-3 text-right whitespace-nowrap">Qty</th>
                              <th className="py-2 px-3 text-right whitespace-nowrap">Unit Price</th>
                              <th className="py-2 pl-3 text-right whitespace-nowrap">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {q.items.map((it, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 pr-4 text-slate-800 min-w-[180px]">{it.description}</td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">{it.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">{it.unitPrice.toFixed(2)}</td>
                                <td className="py-2.5 pl-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap">{it.lineTotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {q.status === 'SENT' && (
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                          <button
                            type="button"
                            disabled={busyAction === `quote-${q.id}`}
                            onClick={() => respondQuotation(q.id, 'APPROVED')}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
                          >
                            Approve Quotation & Start Project
                          </button>
                          <button
                            type="button"
                            disabled={busyAction === `quote-${q.id}`}
                            onClick={() => respondQuotation(q.id, 'REVISION_REQUESTED')}
                            className={`${UI.btnSecondaryLight} text-xs disabled:opacity-60`}
                          >
                            Request Revision
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'projects' && (
              <div className="space-y-5">
                {projects.length === 0 ? (
                  <div className={`${UI.surfaceCard} p-10 text-center ${TYPOGRAPHY.scale.body}`}>
                    No active projects found.
                  </div>
                ) : (
                  projects.map((p) => (
                    <div key={p.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-5`}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs text-[var(--color-ink-muted)]">{p.referenceNumber}</p>
                          <h3 className="font-display text-lg font-bold text-navy-900">{p.title.en}</h3>
                        </div>
                        <span className={`${TYPOGRAPHY.scale.monoMetric} text-sm text-blue-700`}>
                          {p.progressPercent}% Complete
                        </span>
                      </div>
                      <ProjectStepper status={p.status} />
                      {p.updates.length > 0 && (
                        <div className="border-t border-slate-100 pt-4 space-y-2.5">
                          <p className={`${TYPOGRAPHY.scale.meta} font-semibold`}>Delivery Updates</p>
                          {p.updates.map((u) => (
                            <div key={u.id} className="text-sm text-slate-700">
                              <strong>{u.title}:</strong> {u.message}{' '}
                              <span className="text-xs text-slate-400">
                                — {u.authorName} · {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'support' && (
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
                <form onSubmit={createTicket} className={`lg:col-span-5 ${UI.surfaceCard} ${SPACING.cardPad} space-y-4 h-fit`}>
                  <h2 className="font-display text-base font-bold text-navy-900">Open Support Ticket</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={UI.labelCompact}>Category</label>
                      <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value as any)} className={UI.select}>
                        <option value="TECHNICAL_ISSUE">Technical Issue</option>
                        <option value="GENERAL">General</option>
                        <option value="BILLING_QUOTATION">Billing & Quotation</option>
                        <option value="SECURITY_INCIDENT">Security Incident</option>
                        <option value="FEATURE_REQUEST">Feature Request</option>
                      </select>
                    </div>
                    <div>
                      <label className={UI.labelCompact}>Priority</label>
                      <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value as any)} className={UI.select}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={UI.labelCompact}>Subject *</label>
                    <input required minLength={4} value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className={UI.input} />
                  </div>
                  <div>
                    <label className={UI.labelCompact}>Description *</label>
                    <textarea required minLength={10} rows={4} value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} className={UI.textarea} />
                  </div>
                  <button type="submit" disabled={busyAction === 'create-ticket'} className={`${UI.btnPrimary} w-full`}>
                    {busyAction === 'create-ticket' ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4">
                  {tickets.length === 0 ? (
                    <div className={`${UI.surfaceCard} p-8 text-center ${TYPOGRAPHY.scale.body}`}>
                      No support tickets opened yet.
                    </div>
                  ) : (
                    tickets.map((t) => (
                      <div key={t.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <p className="font-mono text-xs text-[var(--color-ink-muted)]">
                              {t.referenceNumber} · {t.category.replace(/_/g, ' ')} · {t.priority}
                            </p>
                            <h3 className="font-display font-bold text-navy-900">{t.subject}</h3>
                          </div>
                          <span className="text-xs font-semibold text-blue-700">{t.status.replace(/_/g, ' ')}</span>
                        </div>

                        <div className="space-y-3">
                          {t.messages.map((m) => (
                            <div key={m.id} className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-3 text-sm">
                              <p className={`${TYPOGRAPHY.scale.meta} font-semibold`}>
                                {m.senderName} ({m.senderRole}) · {new Date(m.createdAt).toLocaleString()}
                              </p>
                              <p className="mt-1 text-slate-800 break-words">{m.body}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            value={replyDrafts[t.id] || ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className={`${UI.input} flex-1`}
                          />
                          <button
                            type="button"
                            disabled={busyAction === `reply-${t.id}`}
                            onClick={() => sendTicketReply(t.id)}
                            className={`${UI.btnNavy} px-4 py-2 text-xs`}
                          >
                            <Send className="h-3.5 w-3.5" /> {busyAction === `reply-${t.id}` ? 'Sending...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'profile' && (
              <form onSubmit={saveProfile} className={`max-w-lg ${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                <div className="flex items-center gap-2 text-navy-900 font-display font-bold">
                  <User className="h-5 w-5 text-blue-700" /> Account Information
                </div>
                {profSaved && (
                  <p className="text-xs font-semibold text-emerald-700">Profile saved.</p>
                )}
                <div>
                  <label className={UI.labelCompact}>Full Name *</label>
                  <input required value={profName} onChange={(e) => setProfName(e.target.value)} className={UI.input} />
                </div>
                <div>
                  <label className={UI.labelCompact}>Phone</label>
                  <input value={profPhone} onChange={(e) => setProfPhone(e.target.value)} className={UI.input} />
                </div>
                <div>
                  <label className={UI.labelCompact}>Organization</label>
                  <input value={profOrg} onChange={(e) => setProfOrg(e.target.value)} className={UI.input} />
                </div>
                <button type="submit" disabled={busyAction === 'save-profile'} className={`${UI.btnPrimary} w-full sm:w-auto px-5 py-2.5`}>
                  {busyAction === 'save-profile' ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
