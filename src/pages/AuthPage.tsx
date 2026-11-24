import { useEffect, useState } from 'react';
import { Loader2, Lock, ShieldCheck, UserPlus } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth, type AuthUser } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';

export function AuthPage({ defaultMode = 'client' }: { defaultMode?: 'client' | 'register' | 'admin' }) {
  const { token, isStaff, setSession } = useAuth();
  const navigate = useNavigate();

  const initialTab = defaultMode === 'admin' ? 'admin' : defaultMode === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register' | 'admin'>(initialTab);
  const [adminStatus, setAdminStatus] = useState<{
    claimed: boolean;
    envPasscodeActive: boolean;
    claimedEmailHint?: string;
  } | null>(null);
  const [adminStatusError, setAdminStatusError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(defaultMode === 'admin' ? 'admin' : defaultMode === 'register' ? 'register' : 'login');
    setError(null);
  }, [defaultMode]);

  useEffect(() => {
    if (token) {
      navigate(isStaff ? '/admin' : '/portal', { replace: true });
    }
  }, [token, isStaff, navigate]);

  useEffect(() => {
    apiRequest<{ claimed: boolean; envPasscodeActive: boolean; claimedEmailHint?: string }>(
      '/api/auth/admin-status'
    )
      .then((res) => {
        setAdminStatus(res);
        setAdminStatusError(null);
      })
      .catch((err: any) => {
        setAdminStatusError(err?.message || 'Unable to verify administrator configuration status.');
      });
  }, []);

  async function handleClientLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setSession(res.token, res.user);
      navigate('/portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClientRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ token: string; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          organizationName: organizationName.trim() || undefined,
          password,
        }),
      });
      setSession(res.token, res.user);
      navigate('/portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminStatus) {
      setError('Verifying administrator setup status. Please try again in a moment.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const shouldClaim = !adminStatus.claimed && !adminStatus.envPasscodeActive;
      const endpoint = shouldClaim ? '/api/auth/admin-claim' : '/api/auth/admin-login';
      const body = shouldClaim
        ? { fullName: fullName.trim(), email: email.trim(), password }
        : { email: email.trim() || undefined, password };

      const res = await apiRequest<{ token: string; user: AuthUser }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setSession(res.token, res.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isFirstRunClaim =
    tab === 'admin' && adminStatus && !adminStatus.claimed && !adminStatus.envPasscodeActive;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[var(--color-surface-muted)] flex items-center justify-center px-4 py-10 sm:py-12">
      <div className={`w-full max-w-md ${UI.surfaceCard} ${SPACING.cardPadLg} shadow-sm`}>
        <div className="mb-6">
          <p className={TYPOGRAPHY.scale.eyebrowLight}>Account Access</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">
            {tab === 'login'
              ? 'Client Portal Sign In'
              : tab === 'register'
              ? 'Create Client Account'
              : isFirstRunClaim
              ? 'Set Up Administrator Account'
              : 'Administrator Sign In'}
          </h1>
        </div>

        {/* Mode Switcher */}
        <div className="mb-6 grid grid-cols-3 gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`${UI.tabButtonBase} min-h-[40px] ${
              tab === 'login' ? UI.tabActive : UI.tabInactive
            }`}
          >
            Client Login
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`${UI.tabButtonBase} min-h-[40px] ${
              tab === 'register' ? UI.tabActive : UI.tabInactive
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setError(null);
            }}
            className={`${UI.tabButtonBase} min-h-[40px] ${
              tab === 'admin' ? UI.tabActive : UI.tabInactive
            }`}
          >
            Admin
          </button>
        </div>

        {error && <div className={`mb-5 ${UI.alertError}`}>{error}</div>}

        {tab === 'login' && (
          <form onSubmit={handleClientLogin} className="space-y-4">
            <div>
              <label className={UI.label}>Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={UI.input} />
            </div>
            <div>
              <label className={UI.label}>Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={UI.input} />
            </div>
            <button type="submit" disabled={loading} className={`${UI.btnPrimary} w-full`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Sign In to Portal
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleClientRegister} className="space-y-4">
            <div>
              <label className={UI.label}>Full Name *</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={UI.input} />
            </div>
            <div>
              <label className={UI.label}>Email *</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={UI.input} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={UI.label}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={UI.input} />
              </div>
              <div>
                <label className={UI.label}>Organization</label>
                <input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} className={UI.input} />
              </div>
            </div>
            <div>
              <label className={UI.label}>Password (min 8 chars) *</label>
              <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={UI.input} />
            </div>
            <button type="submit" disabled={loading} className={`${UI.btnPrimary} w-full`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create Client Account
            </button>
          </form>
        )}

        {tab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {adminStatusError && (
              <div className={UI.alertError}>{adminStatusError}</div>
            )}
            {isFirstRunClaim ? (
              <div className="rounded-[var(--radius-control)] border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900 leading-relaxed">
                <strong>First-Run Setup:</strong> No administrator password is set yet. Claim your Super Administrator credentials below to manage quotations, projects, clients, and CMS content.
              </div>
            ) : (
              adminStatus?.claimedEmailHint && (
                <p className={TYPOGRAPHY.scale.meta}>
                  Registered Admin: <span className="font-mono break-all">{adminStatus.claimedEmailHint}</span>
                </p>
              )
            )}

            {isFirstRunClaim && (
              <div>
                <label className={UI.label}>Administrator Name *</label>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Nuur Tech" className={UI.input} />
              </div>
            )}

            {(!adminStatus?.envPasscodeActive) && (
              <div>
                <label className={UI.label}>Administrator Email *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@afrinovera.com" className={UI.input} />
              </div>
            )}

            <div>
              <label className={UI.label}>
                {adminStatus?.envPasscodeActive ? 'Administrator Passcode *' : 'Password (min 8 chars) *'}
              </label>
              <input
                required
                minLength={adminStatus?.envPasscodeActive ? 1 : 8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={UI.input}
              />
            </div>

            <button type="submit" disabled={loading || !adminStatus} className={`${UI.btnNavy} w-full`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {!adminStatus
                ? 'Checking Admin Setup...'
                : isFirstRunClaim
                ? 'Claim & Open Admin Console'
                : 'Sign In to Admin Console'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
