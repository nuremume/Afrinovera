import { Globe } from 'lucide-react';
import type { CompanySettings, Locale } from '../types';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { useNavigate } from 'react-router-dom';

export function Footer({
  locale,
  onLocaleChange,
  settings,
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  settings: CompanySettings | null;
}) {
  const navigate = useNavigate();

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800">
      <div className={`${SPACING.container} py-12 sm:py-14`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <img
              src="/brand/logo-dark.svg"
              alt="AFRINOVERA Technologies"
              className="h-10 w-auto"
              referrerPolicy="no-referrer"
            />
            <p className="text-sm leading-relaxed text-slate-400">
              Delivering innovative, reliable, and practical digital solutions to individuals,
              businesses, and organizations.
            </p>
            <p className={TYPOGRAPHY.scale.eyebrowDark}>
              {settings?.tagline || 'Innovation Beyond Boundaries.'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Core Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button type="button" onClick={() => navigate('/services/web-development-design')} className="hover:text-white transition-colors text-left py-0.5">
                  Web Development & Design
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services/software-solutions')} className="hover:text-white transition-colors text-left py-0.5">
                  Software Solutions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services/cybersecurity-solutions')} className="hover:text-white transition-colors text-left py-0.5">
                  Cybersecurity Solutions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services/computer-system-repair')} className="hover:text-white transition-colors text-left py-0.5">
                  Computer & System Repair
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services/it-infrastructure-networking')} className="hover:text-white transition-colors text-left py-0.5">
                  IT Infrastructure & Networking
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services/technology-consulting-support')} className="hover:text-white transition-colors text-left py-0.5">
                  Technology Consulting & Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company & Portals</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button type="button" onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left py-0.5">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/portfolio')} className="hover:text-white transition-colors text-left py-0.5">
                  Project Portfolio
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/process')} className="hover:text-white transition-colors text-left py-0.5">
                  Our 8-Step Process
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/insights')} className="hover:text-white transition-colors text-left py-0.5">
                  Technology Insights
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/portal')} className="hover:text-white transition-colors text-left py-0.5">
                  Client Portal
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/admin')} className="hover:text-white transition-colors text-left py-0.5">
                  Administration Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Contact & Language</h4>
            <ul className="space-y-2 text-sm text-slate-400 break-words">
              <li>
                General:{' '}
                <a href={`mailto:${settings?.primaryEmail || 'info@afrinovera.com'}`} className="text-slate-200 hover:underline break-all">
                  {settings?.primaryEmail || 'info@afrinovera.com'}
                </a>
              </li>
              <li>
                Quotes:{' '}
                <a href={`mailto:${settings?.quotesEmail || 'quotes@afrinovera.com'}`} className="text-slate-200 hover:underline break-all">
                  {settings?.quotesEmail || 'quotes@afrinovera.com'}
                </a>
              </li>
              <li>
                Support:{' '}
                <a href={`mailto:${settings?.supportEmail || 'support@afrinovera.com'}`} className="text-slate-200 hover:underline break-all">
                  {settings?.supportEmail || 'support@afrinovera.com'}
                </a>
              </li>
              {settings?.phone && <li>Phone: <span className="text-slate-200">{settings.phone}</span></li>}
            </ul>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-navy-800 bg-navy-900 p-1">
                <Globe className="ml-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
                {(
                  [
                    { code: 'en', label: 'EN' },
                    { code: 'om', label: 'OM' },
                    { code: 'am', label: 'AM' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onLocaleChange(item.code)}
                    className={`min-h-[34px] min-w-[36px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      locale === item.code
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy-800 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} AFRINOVERA Technologies. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <button type="button" onClick={() => navigate('/consultation')} className="py-1 hover:text-slate-300">
              Request Consultation
            </button>
            <button type="button" onClick={() => navigate('/contact')} className="py-1 hover:text-slate-300">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
