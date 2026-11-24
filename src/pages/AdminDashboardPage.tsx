import { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  FileSpreadsheet,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  Send,
  Settings,
  Shield,
  Trash2,
} from 'lucide-react';
import type {
  ActivityLogItem,
  BlogPostItem,
  CompanySettings,
  ConsultationItem,
  InquiryItem,
  ProjectItem,
  ProjectStatus,
  QuotationItem,
  ServiceRequestItem,
  SupportTicketItem,
} from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';

interface AdminOverviewResponse {
  stats: {
    totalClients: number;
    totalInquiries: number;
    newQuoteRequests: number;
    activeProjects: number;
    completedProjects: number;
    openTickets: number;
  };
  requests: ServiceRequestItem[];
  inquiries: InquiryItem[];
  consultations: ConsultationItem[];
  quotations: QuotationItem[];
  projects: ProjectItem[];
  tickets: SupportTicketItem[];
  clients: Array<{ id: string; fullName: string; email: string; organizationName?: string; roles: string[] }>;
  blogPosts: BlogPostItem[];
  settings: CompanySettings;
  recentLogs: ActivityLogItem[];
}

export function AdminDashboardPage({ onSettingsChanged }: { onSettingsChanged: () => void }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState<'overview' | 'requests' | 'quotations' | 'projects' | 'support' | 'cms' | 'settings'>('overview');
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Quotation Builder state
  const [qtRequestId, setQtRequestId] = useState('');
  const [qtClientEmail, setQtClientEmail] = useState('');
  const [qtTitle, setQtTitle] = useState('');
  const [qtCurrency, setQtCurrency] = useState<'USD' | 'ETB' | 'EUR'>('USD');
  const [qtTax, setQtTax] = useState(0);
  const [qtDiscount, setQtDiscount] = useState(0);
  const [qtNotes, setQtNotes] = useState('');
  const [qtItems, setQtItems] = useState([{ description: 'Architecture & Core Development', quantity: 1, unitPrice: 1200 }]);

  // CMS Blog Form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCategory, setBlogCategory] = useState('software-engineering');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Settings Form
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [showStatsOnHome, setShowStatsOnHome] = useState(false);

  // Support replies
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  // Local draft progress values so typing doesn't fire API calls on every keystroke
  const [progressDrafts, setProgressDrafts] = useState<Record<string, string>>({});
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [logFilter, setLogFilter] = useState('');

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<AdminOverviewResponse>('/api/admin/overview', { token });
      setData(res);
      setPrimaryEmail(res.settings.primaryEmail);
      setSupportEmail(res.settings.supportEmail);
      setPhone(res.settings.phone || '');
      setOfficeAddress(res.settings.officeAddress || '');
      setShowStatsOnHome(res.settings.showStatsOnHome);
      const nextDrafts: Record<string, string> = {};
      for (const p of res.projects) {
        nextDrafts[p.id] = String(p.progressPercent);
      }
      setProgressDrafts(nextDrafts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  }

  async function updateRequestStatus(id: string, status: ProjectStatus) {
    setError(null);
    try {
      await apiRequest(`/api/admin/requests/${id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
      flash('Request status updated.');
      await loadOverview();
    } catch (err: any) {
      setError(err?.message || 'Unable to update request status.');
    }
  }

  async function createQuotation(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!qtClientEmail.trim() && !qtRequestId.trim()) {
      setError('Please enter a Client Email or a Linked Request ID so the client can access this quotation.');
      return;
    }
    try {
      const res = await apiRequest<{ quotation: QuotationItem }>('/api/admin/quotations', {
        method: 'POST',
        token,
        body: JSON.stringify({
          serviceRequestId: qtRequestId.trim() || undefined,
          clientEmail: qtClientEmail.trim() || undefined,
          title: qtTitle,
          currency: qtCurrency,
          taxAmount: Number(qtTax),
          discountAmount: Number(qtDiscount),
          notes: qtNotes || undefined,
          sendImmediately: true,
          items: qtItems,
        }),
      });
      flash(`Quotation ${res.quotation.referenceNumber} sent.`);
      setQtRequestId('');
      setQtClientEmail('');
      setQtTitle('');
      setQtNotes('');
      setQtTax(0);
      setQtDiscount(0);
      setQtItems([{ description: 'Architecture & Core Development', quantity: 1, unitPrice: 1200 }]);
      await loadOverview();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updateProjectStage(project: ProjectItem, status: ProjectStatus, progressPercent: number) {
    setError(null);
    try {
      await apiRequest(`/api/admin/projects/${project.id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          status,
          progressPercent,
          updateMessage: `Project moved to ${status.replace(/_/g, ' ')} (${progressPercent}%).`,
        }),
      });
      flash(`Updated ${project.referenceNumber}.`);
      await loadOverview();
    } catch (err: any) {
      setError(err?.message || 'Unable to update project progress.');
    }
  }

  async function togglePortfolio(project: ProjectItem, isPublicPortfolio: boolean, clientDisplayConsent: boolean) {
    setError(null);
    try {
      await apiRequest(`/api/admin/projects/${project.id}/portfolio`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ isPublicPortfolio, clientDisplayConsent }),
      });
      flash(`Portfolio visibility updated for ${project.referenceNumber}.`);
      await loadOverview();
      onSettingsChanged();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function replyTicket(ticketId: string, isInternalNote: boolean) {
    const body = ticketReplies[ticketId]?.trim();
    if (!body || body.length < 2) {
      setError('Please enter at least 2 characters before sending a reply or internal note.');
      return;
    }
    setError(null);
    try {
      await apiRequest(`/api/admin/support/${ticketId}/reply`, {
        method: 'POST',
        token,
        body: JSON.stringify({ body, isInternalNote, status: isInternalNote ? undefined : 'WAITING_ON_CLIENT' }),
      });
      setTicketReplies((prev) => ({ ...prev, [ticketId]: '' }));
      flash('Support ticket updated.');
      await loadOverview();
    } catch (err: any) {
      setError(err?.message || 'Unable to post ticket update.');
    }
  }

  async function publishBlogPost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest('/api/admin/cms/blog-posts', {
        method: 'POST',
        token,
        body: JSON.stringify({
          slug: blogSlug,
          categorySlug: blogCategory,
          titleEn: blogTitle,
          excerptEn: blogExcerpt,
          contentEn: blogContent,
        }),
      });
      flash('Article published to Technology Insights.');
      setBlogTitle('');
      setBlogSlug('');
      setSlugEditedManually(false);
      setBlogExcerpt('');
      setBlogContent('');
      await loadOverview();
      onSettingsChanged();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          primaryEmail,
          supportEmail,
          phone,
          officeAddress,
          showStatsOnHome,
        }),
      });
      flash('Company settings updated.');
      await loadOverview();
      onSettingsChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to save settings.');
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests & Inquiries', icon: Briefcase },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
    { id: 'projects', label: 'Projects & Portfolio', icon: FolderKanban },
    { id: 'support', label: 'Support Desk', icon: LifeBuoy },
    { id: 'cms', label: 'CMS & Insights', icon: FileEdit },
    { id: 'settings', label: 'Settings & RBAC', icon: Settings },
  ] as const;

  const subtotal = qtItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const total = Math.max(0, subtotal + qtTax - qtDiscount);

  return (
    <div className={`flex ${UI.pageShell}`}>
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-navy-950 text-slate-300 border-r border-navy-800 shrink-0">
        <div className="px-5 py-5 border-b border-navy-800">
          <img src="/brand/logo-dark.svg" alt="AFRINOVERA Admin" className="h-9 w-auto" referrerPolicy="no-referrer" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex min-h-[42px] w-full items-center gap-3 rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-navy-800 p-4 text-xs">
          <p className="font-semibold text-white truncate">{user?.fullName}</p>
          <p className="text-slate-400 truncate">{user?.roles.join(', ')}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-ink-muted)]">Administration</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-navy-900 capitalize">{section}</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/')} className="min-h-[36px] text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap">
              Public Site
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className={`${UI.btnSecondaryLight} min-h-[38px] px-3 py-1.5 text-xs whitespace-nowrap`}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 overflow-x-auto flex gap-1.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`${UI.tabButtonBase} ${
                section === item.id ? 'bg-navy-900 text-white' : UI.tabInactive
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {notice && <div className={UI.alertSuccess}>{notice}</div>}
          {error && <div className={UI.alertError}>{error}</div>}

          {loading || !data ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 rounded-[var(--radius-card)] bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {section === 'overview' && (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: 'Registered Clients', val: data.stats.totalClients },
                      { label: 'Inquiries & Consultations', val: data.stats.totalInquiries },
                      { label: 'New Quote Requests', val: data.stats.newQuoteRequests },
                      { label: 'Active Projects', val: data.stats.activeProjects },
                      { label: 'Completed Projects', val: data.stats.completedProjects },
                      { label: 'Open Support Tickets', val: data.stats.openTickets },
                    ].map((card) => (
                      <div key={card.label} className={`${UI.surfaceCard} p-5`}>
                        <p className={`${TYPOGRAPHY.scale.meta} font-medium`}>{card.label}</p>
                        <p className={`mt-2 ${TYPOGRAPHY.scale.monoMetric} text-3xl text-navy-900`}>
                          {card.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={`${UI.surfaceCard} ${SPACING.cardPad}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h2 className="font-display text-base font-bold text-navy-900">Audit Activity Log</h2>
                      {data.recentLogs.length > 0 && (
                        <input
                          type="search"
                          value={logFilter}
                          onChange={(e) => setLogFilter(e.target.value)}
                          placeholder="Filter by action, actor, or summary..."
                          aria-label="Filter audit activity logs"
                          className="w-full sm:w-72 min-h-[38px] rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs text-[var(--color-ink-primary)] placeholder-slate-400 focus:border-blue-600 focus:bg-[var(--color-surface)] focus:outline-none"
                        />
                      )}
                    </div>
                    {data.recentLogs.length === 0 ? (
                      <p className={TYPOGRAPHY.scale.body}>No audit entries recorded yet.</p>
                    ) : (() => {
                      const q = logFilter.trim().toLowerCase();
                      const filteredLogs = q
                        ? data.recentLogs.filter((log) =>
                            `${log.action} ${log.summary} ${log.actorName} ${log.entityType}`
                              .toLowerCase()
                              .includes(q)
                          )
                        : data.recentLogs;
                      return filteredLogs.length === 0 ? (
                        <p className={TYPOGRAPHY.scale.body}>No log entries match “{logFilter.trim()}”.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 text-sm">
                          {filteredLogs.map((log) => (
                            <div key={log.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className={`${TYPOGRAPHY.scale.monoRef} text-blue-700`}>{log.action}</span>
                                <span className="ml-2 text-slate-700 break-words">{log.summary}</span>
                                <span className="ml-2 text-xs text-slate-400">by {log.actorName}</span>
                              </div>
                              <span className="font-mono text-xs tabular-nums text-slate-400 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {section === 'requests' && (
                <div className="space-y-8">
                  <div className={`${UI.surfaceCard} overflow-hidden`}>
                    <div className="border-b border-[var(--color-border)] px-5 sm:px-6 py-4">
                      <h2 className="font-display text-base font-bold text-navy-900">Incoming Quotation & Service Requests</h2>
                    </div>
                    {data.requests.length === 0 ? (
                      <p className={`p-6 ${TYPOGRAPHY.scale.body}`}>No service requests yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                            <tr>
                              <th className="px-4 py-3 whitespace-nowrap">Ref</th>
                              <th className="px-4 py-3 whitespace-nowrap">Requester</th>
                              <th className="px-4 py-3">Project Title</th>
                              <th className="px-4 py-3 whitespace-nowrap">Service</th>
                              <th className="px-4 py-3 whitespace-nowrap">Status</th>
                              <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.requests.map((r) => (
                              <tr key={r.id}>
                                <td className={`px-4 py-3 ${TYPOGRAPHY.scale.monoRef} text-blue-700 whitespace-nowrap`}>{r.referenceNumber}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <p className="font-medium text-navy-900">{r.fullName}</p>
                                  <p className={TYPOGRAPHY.scale.meta}>{r.email}</p>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800 min-w-[180px]">{r.title}</td>
                                <td className="px-4 py-3 text-xs text-[var(--color-ink-secondary)] whitespace-nowrap">{r.serviceSlug}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <select
                                    value={r.status}
                                    onChange={(e) => updateRequestStatus(r.id, e.target.value as ProjectStatus)}
                                    className="min-h-[38px] rounded-md border border-[var(--color-border-strong)] px-2.5 py-1 text-base sm:text-xs font-semibold bg-[var(--color-surface)]"
                                  >
                                    {['SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_SENT', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'CANCELLED'].map((st) => (
                                      <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQtRequestId(r.id);
                                      setQtClientEmail(r.email);
                                      setQtTitle(r.title);
                                      setSection('quotations');
                                    }}
                                    className="min-h-[36px] px-2 text-xs font-semibold text-blue-700 hover:underline"
                                  >
                                    Prepare Quote
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className={`${UI.surfaceCard} ${SPACING.cardPad}`}>
                      <div className="flex items-center gap-2 font-display font-bold text-navy-900 mb-3">
                        <Inbox className="h-4 w-4 text-blue-700 shrink-0" /> Contact Inquiries ({data.inquiries.length})
                      </div>
                      <div className="space-y-3 text-sm">
                        {data.inquiries.map((inq) => (
                          <div key={inq.id} className="border-b border-slate-100 pb-3 last:border-0">
                            <p className="font-mono text-xs text-blue-700 break-all">{inq.referenceNumber} · {inq.email}</p>
                            <p className="font-semibold text-navy-900">{inq.subject}</p>
                            <p className={`mt-1 ${TYPOGRAPHY.scale.meta} text-[var(--color-ink-secondary)] break-words`}>{inq.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${UI.surfaceCard} ${SPACING.cardPad}`}>
                      <div className="flex items-center gap-2 font-display font-bold text-navy-900 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" /> Consultations ({data.consultations.length})
                      </div>
                      <div className="space-y-3 text-sm">
                        {data.consultations.map((c) => (
                          <div key={c.id} className="border-b border-slate-100 pb-3 last:border-0">
                            <p className="font-mono text-xs text-blue-700">{c.referenceNumber} · {c.meetingMode}</p>
                            <p className="font-semibold text-navy-900">{c.topic}</p>
                            <p className={`${TYPOGRAPHY.scale.meta} text-[var(--color-ink-secondary)] break-words`}>
                              {c.fullName} ({c.email}) · {new Date(c.preferredDate).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === 'quotations' && (
                <div className="space-y-8 max-w-4xl">
                  <form onSubmit={createQuotation} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-5`}>
                    <h2 className="font-display text-lg font-bold text-navy-900">Prepare & Send Quotation</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className={UI.labelCompact}>Quotation Title *</label>
                        <input required value={qtTitle} onChange={(e) => setQtTitle(e.target.value)} placeholder="e.g., Enterprise Web & Inventory Platform" className={UI.input} />
                      </div>
                      <div>
                        <label className={UI.labelCompact}>Currency</label>
                        <select value={qtCurrency} onChange={(e) => setQtCurrency(e.target.value as any)} className={UI.select}>
                          <option value="USD">USD ($)</option>
                          <option value="ETB">ETB (Birr)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={UI.labelCompact}>Client Email</label>
                        <input type="email" value={qtClientEmail} onChange={(e) => setQtClientEmail(e.target.value)} placeholder="client@organization.com" className={UI.input} />
                      </div>
                      <div>
                        <label className={UI.labelCompact}>Linked Request ID (Optional)</label>
                        <input value={qtRequestId} onChange={(e) => setQtRequestId(e.target.value)} className={`${UI.input} font-mono`} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--color-ink-secondary)]">Deliverable Line Items</span>
                        <button
                          type="button"
                          onClick={() => setQtItems([...qtItems, { description: '', quantity: 1, unitPrice: 0 }])}
                          className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Item
                        </button>
                      </div>

                      {qtItems.map((it, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-2 items-center rounded-[var(--radius-control)] border border-[var(--color-border)] sm:border-0 bg-[var(--color-surface-muted)] sm:bg-transparent p-3 sm:p-0">
                          <div className="sm:col-span-6">
                            <span className="block sm:hidden text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1">Description</span>
                            <input
                              required
                              placeholder="Deliverable description"
                              value={it.description}
                              onChange={(e) => setQtItems((prev) => prev.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)))}
                              className={`${UI.input} min-h-[42px]`}
                            />
                          </div>
                          <div className="grid grid-cols-12 sm:contents gap-2 items-center">
                            <div className="col-span-4 sm:col-span-2">
                              <span className="block sm:hidden text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1">Qty</span>
                              <input
                                type="number"
                                min={1}
                                value={it.quantity}
                                onChange={(e) => setQtItems((prev) => prev.map((r, i) => (i === idx ? { ...r, quantity: Number(e.target.value) || 1 } : r)))}
                                className={`${UI.input} min-h-[42px] px-2.5 font-mono tabular-nums`}
                              />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                              <span className="block sm:hidden text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1">Unit Price</span>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={it.unitPrice}
                                onChange={(e) => setQtItems((prev) => prev.map((r, i) => (i === idx ? { ...r, unitPrice: Number(e.target.value) || 0 } : r)))}
                                className={`${UI.input} min-h-[42px] px-2.5 font-mono tabular-nums`}
                              />
                            </div>
                            <div className="col-span-3 sm:col-span-1 text-right font-mono text-xs font-semibold tabular-nums pt-4 sm:pt-0">
                              {(it.quantity * it.unitPrice).toFixed(0)}
                            </div>
                            <button
                              type="button"
                              disabled={qtItems.length === 1}
                              onClick={() => setQtItems((prev) => prev.filter((_, i) => i !== idx))}
                              aria-label="Remove line item"
                              className="col-span-1 flex h-10 items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30 mt-4 sm:mt-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                      <textarea rows={2} value={qtNotes} onChange={(e) => setQtNotes(e.target.value)} placeholder="Payment schedule & terms..." className={UI.textarea} />
                      <div className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-3.5 text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-ink-secondary)]">Subtotal</span>
                          <span className="font-mono tabular-nums">{qtCurrency} {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[var(--color-ink-secondary)] text-xs sm:text-sm">Tax / Discount</span>
                          <div className="flex gap-2">
                            <input type="number" min={0} aria-label="Tax amount" value={qtTax} onChange={(e) => setQtTax(Number(e.target.value) || 0)} className="w-20 min-h-[36px] rounded border border-[var(--color-border-strong)] bg-white px-2 py-0.5 text-right font-mono text-base sm:text-xs" />
                            <input type="number" min={0} aria-label="Discount amount" value={qtDiscount} onChange={(e) => setQtDiscount(Number(e.target.value) || 0)} className="w-20 min-h-[36px] rounded border border-[var(--color-border-strong)] bg-white px-2 py-0.5 text-right font-mono text-base sm:text-xs" />
                          </div>
                        </div>
                        <div className="flex justify-between border-t border-[var(--color-border)] pt-1.5 font-bold text-navy-900">
                          <span>Total</span>
                          <span className="font-mono tabular-nums">{qtCurrency} {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className={`${UI.btnPrimary} w-full sm:w-auto`}>
                      <Send className="h-4 w-4" /> Send Quotation to Client
                    </button>
                  </form>

                  <div className={`${UI.surfaceCard} ${SPACING.cardPad}`}>
                    <h3 className="font-display text-base font-bold text-navy-900 mb-3">Issued Quotations</h3>
                    <div className="space-y-2 text-sm">
                      {data.quotations.map((q) => (
                        <div key={q.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2.5">
                          <div>
                            <span className="font-mono text-xs text-blue-700">{q.referenceNumber}</span>
                            <span className="ml-2 font-semibold text-navy-900">{q.title}</span>
                          </div>
                          <div className="font-mono text-xs font-semibold tabular-nums">
                            {q.currency} {q.totalAmount.toFixed(2)} · {q.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section === 'projects' && (
                <div className="space-y-4">
                  {data.projects.map((p) => {
                    const draftProgress = progressDrafts[p.id] ?? String(p.progressPercent);
                    const parsedProgress = Math.min(100, Math.max(0, Number.parseInt(draftProgress, 10) || 0));
                    const progressChanged = parsedProgress !== p.progressPercent;
                    return (
                      <div key={p.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs text-[var(--color-ink-muted)]">{p.referenceNumber} · {p.category}</p>
                            <h3 className="font-display text-lg font-bold text-navy-900">{p.title.en}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={p.status}
                              onChange={(e) => updateProjectStage(p, e.target.value as ProjectStatus, parsedProgress)}
                              className="min-h-[40px] rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-3 py-1.5 text-base sm:text-xs font-semibold bg-[var(--color-surface)]"
                            >
                              {['SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_SENT', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'CANCELLED'].map((st) => (
                                <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              aria-label="Progress percentage"
                              value={draftProgress}
                              onChange={(e) =>
                                setProgressDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                              className="w-20 min-h-[40px] rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-2.5 py-1.5 text-base sm:text-xs font-mono tabular-nums bg-[var(--color-surface)]"
                            />
                            {progressChanged && (
                              <button
                                type="button"
                                onClick={() => updateProjectStage(p, p.status, parsedProgress)}
                                className={UI.btnPrimaryCompact}
                              >
                                Save %
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 pt-3 text-xs">
                          <label className="inline-flex min-h-[36px] items-center gap-2 cursor-pointer font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={p.clientDisplayConsent}
                              onChange={(e) => togglePortfolio(p, p.isPublicPortfolio && e.target.checked, e.target.checked)}
                              className="h-4 w-4"
                            />
                            Client Display Permission Granted
                          </label>
                          <label
                            className={`inline-flex min-h-[36px] items-center gap-2 font-medium ${
                              p.clientDisplayConsent ? 'cursor-pointer text-slate-700' : 'cursor-not-allowed text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={!p.clientDisplayConsent && !p.isPublicPortfolio}
                              checked={p.isPublicPortfolio}
                              onChange={(e) => togglePortfolio(p, e.target.checked, p.clientDisplayConsent)}
                              className="h-4 w-4"
                            />
                            Publish to Public Portfolio
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {section === 'support' && (
                <div className="space-y-4">
                  {data.tickets.length === 0 ? (
                    <div className={`${UI.surfaceCard} p-8 text-center ${TYPOGRAPHY.scale.body}`}>
                      No client support tickets open.
                    </div>
                  ) : (
                    data.tickets.map((t) => (
                      <div key={t.id} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-mono text-xs text-blue-700">
                              {t.referenceNumber} · {t.clientName} · {t.priority}
                            </p>
                            <h3 className="font-display font-bold text-navy-900">{t.subject}</h3>
                          </div>
                          <span className="text-xs font-semibold text-[var(--color-ink-secondary)]">{t.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="space-y-2">
                          {t.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`rounded-[var(--radius-control)] p-3 text-sm ${
                                m.isInternalNote ? 'bg-amber-50 border border-amber-200' : 'bg-[var(--color-surface-muted)]'
                              }`}
                            >
                              <p className={`${TYPOGRAPHY.scale.meta} font-semibold`}>
                                {m.senderName} · {m.isInternalNote ? 'Internal Staff Note' : m.senderRole}
                              </p>
                              <p className="mt-1 text-slate-800 break-words">{m.body}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            value={ticketReplies[t.id] || ''}
                            onChange={(e) => setTicketReplies((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            placeholder="Reply to client or write internal note..."
                            className={`${UI.input} flex-1`}
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => replyTicket(t.id, false)} className={`${UI.btnPrimaryCompact} min-h-[44px] flex-1 sm:flex-none whitespace-nowrap`}>
                              Send Reply
                            </button>
                            <button type="button" onClick={() => replyTicket(t.id, true)} className="min-h-[44px] flex-1 sm:flex-none rounded-[var(--radius-control)] border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap transition-colors">
                              Internal Note
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {section === 'cms' && (
                <form onSubmit={publishBlogPost} className={`max-w-3xl ${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                  <h2 className="font-display text-lg font-bold text-navy-900">Publish Technology Insights Article</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      required
                      value={blogTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBlogTitle(val);
                        if (!slugEditedManually) {
                          setBlogSlug(
                            val
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '')
                          );
                        }
                      }}
                      placeholder="Article Title (English)"
                      className={UI.input}
                    />
                    <input
                      required
                      pattern="^[a-z0-9-]+$"
                      value={blogSlug}
                      onChange={(e) => {
                        setSlugEditedManually(true);
                        setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      }}
                      placeholder="url-slug-lowercase"
                      className={`${UI.input} font-mono`}
                    />
                  </div>
                  <select value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} className={`${UI.select} sm:w-auto`}>
                    <option value="software-engineering">Software Development</option>
                    <option value="cybersecurity">Cybersecurity Awareness</option>
                    <option value="infrastructure">IT Infrastructure</option>
                    <option value="digital-transformation">Digital Transformation</option>
                  </select>
                  <textarea required minLength={10} rows={2} value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} placeholder="Short article summary..." className={UI.textarea} />
                  <textarea required minLength={20} rows={6} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Full article content..." className={UI.textarea} />
                  <button type="submit" className={`${UI.btnPrimary} w-full sm:w-auto`}>
                    Publish Article
                  </button>
                </form>
              )}

              {section === 'settings' && (
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                  <form onSubmit={saveSettings} className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                    <h2 className="font-display text-lg font-bold text-navy-900">Company & Visibility Settings</h2>
                    <div>
                      <label className={UI.labelCompact}>Primary Email</label>
                      <input type="email" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} className={UI.input} />
                    </div>
                    <div>
                      <label className={UI.labelCompact}>Support Email</label>
                      <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={UI.input} />
                    </div>
                    <div>
                      <label className={UI.labelCompact}>Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className={UI.input} />
                    </div>
                    <div>
                      <label className={UI.labelCompact}>Office Address</label>
                      <input value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} className={UI.input} />
                    </div>
                    <label className="flex min-h-[40px] items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={showStatsOnHome} onChange={(e) => setShowStatsOnHome(e.target.checked)} className="h-4 w-4 shrink-0" />
                      Display Verified Statistics Band on Home Page
                    </label>
                    <button type="submit" className={`${UI.btnPrimary} w-full sm:w-auto px-5 py-2.5`}>
                      Save Settings
                    </button>
                  </form>

                  <div className={`${UI.surfaceCard} ${SPACING.cardPad} space-y-4`}>
                    <div className="flex items-center gap-2 font-display font-bold text-navy-900">
                      <Shield className="h-5 w-5 text-blue-700 shrink-0" /> RBAC Roles Matrix
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li><strong>Super Administrator:</strong> Complete platform, RBAC, and system configuration</li>
                      <li><strong>Administrator:</strong> Website, CMS, services, clients, and quotations</li>
                      <li><strong>Project Manager:</strong> Request assignments, 9-stage project progress, delivery</li>
                      <li><strong>Developer / Technical Staff:</strong> Assigned projects and technical updates</li>
                      <li><strong>Customer Support:</strong> Inquiries, support tickets, client replies</li>
                      <li><strong>Client:</strong> Own profile, requests, quotations, projects, support tickets</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
