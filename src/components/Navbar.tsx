import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Briefcase, FolderKanban, Menu, Search, X } from 'lucide-react';
import type { BlogPostItem, Locale, ProjectItem, ServiceItem } from '../types';
import { t } from '../i18n/translations';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildPlatformSearchIndex,
  searchPlatformIndex,
  type SearchResultItem,
} from '../lib/searchIndex';

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={idx}
            className="rounded bg-blue-50 px-0.5 font-semibold text-blue-700"
          >
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}

function ResultIcon({ kind }: { kind: SearchResultItem['kind'] }) {
  if (kind === 'service') return <Briefcase className="h-4 w-4 text-blue-700 shrink-0" />;
  if (kind === 'portfolio') return <FolderKanban className="h-4 w-4 text-emerald-700 shrink-0" />;
  return <BookOpen className="h-4 w-4 text-slate-600 shrink-0" />;
}

export function Navbar({
  locale,
  onLocaleChange,
  services = [],
  projects = [],
  posts = [],
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  services?: ServiceItem[];
  projects?: ProjectItem[];
  posts?: BlogPostItem[];
}) {
  const { pathname: path } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const navItems = [
    { href: '/services', label: t(locale, 'nav.services') },
    { href: '/portfolio', label: t(locale, 'nav.portfolio') },
    { href: '/insights', label: t(locale, 'nav.insights') },
    { href: '/about', label: t(locale, 'nav.about') },
    { href: '/portal', label: t(locale, 'nav.portal') },
  ];

  const searchIndex = useMemo(
    () => buildPlatformSearchIndex({ locale, services, projects, posts }),
    [locale, services, projects, posts]
  );

  const results = useMemo(
    () => searchPlatformIndex(searchIndex, searchQuery).slice(0, 8),
    [searchIndex, searchQuery]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Global keyboard shortcut: Cmd/Ctrl + K to focus search, Escape to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          desktopInputRef.current?.focus();
        } else {
          setMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 20);
        }
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
        setMobileSearchOpen(false);
        desktopInputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function handleNav(href: string) {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setSearchFocused(false);
    navigate(href);
  }

  function handleSelectResult(item: SearchResultItem) {
    setSearchQuery('');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileOpen(false);
    navigate(item.href);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelectResult(results[activeIndex] || results[0]);
    }
  }

  function renderResultsDropdown() {
    const trimmed = searchQuery.trim();
    return (
      <div
        role="listbox"
        aria-label="Platform search results"
        className={`w-full overflow-hidden ${UI.surfaceCard} shadow-xl`}
      >
        {!trimmed ? (
          <div className="p-3 space-y-1">
            <p className="px-2.5 py-1 text-xs font-semibold text-slate-500">
              Quick Navigation
            </p>
            {[
              { label: 'Explore All 6 Services', meta: 'Services', href: '/services' },
              { label: 'Browse Portfolio Case Studies', meta: 'Portfolio', href: '/portfolio' },
              { label: 'Read Technology Insights', meta: 'Insights', href: '/insights' },
              { label: 'Request a Project Quotation', meta: 'Quote', href: '/quote' },
            ].map((quick) => (
              <button
                key={quick.href}
                type="button"
                onClick={() => handleNav(quick.href)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
              >
                <span className="font-medium">{quick.label}</span>
                <span className="text-xs text-slate-400">{quick.meta}</span>
              </button>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="p-5 text-center space-y-2">
            <p className="text-sm font-medium text-navy-900">
              No results for “{trimmed}”
            </p>
            <p className="text-xs text-slate-500">
              Try searching a service name, technology, or article topic.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelectResult(item)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    <ResultIcon kind={item.kind} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        <HighlightMatch text={item.title} query={trimmed} />
                      </p>
                      <span className="shrink-0 text-xs text-slate-500">
                        {item.meta}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                      <HighlightMatch text={item.subtitle} query={trimmed} />
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
      <div className={`flex h-16 items-center justify-between gap-6 ${SPACING.container}`}>
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left"
        >
          <img
            src="/favicon.svg"
            alt=""
            className="h-8 w-8 rounded-lg shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-navy-900">
            AFRINOVERA
          </span>
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const active =
              path === item.href ||
              (item.href !== '/' && path.startsWith(`${item.href}/`));
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  active
                    ? 'border-blue-700 text-navy-900 font-semibold'
                    : 'border-transparent hover:text-navy-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Searchable Interface + Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Desktop Inline Search */}
          <div ref={searchContainerRef} className="relative hidden lg:block">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <input
                ref={desktopInputRef}
                type="search"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search services, projects, posts..."
                aria-label="Search services, portfolio projects, and blog posts"
                className="h-9 w-52 xl:w-64 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-9 pr-8 text-xs text-[var(--color-ink-primary)] placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-[var(--color-surface)] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    desktopInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 hidden xl:inline-block font-mono text-[10px] text-slate-400">
                  ⌘K
                </kbd>
              )}
            </div>

            {searchFocused && (
              <div className="absolute right-0 top-11 z-50 w-[min(26rem,calc(100vw-2rem))] max-h-[calc(100dvh-5rem)]">
                {renderResultsDropdown()}
              </div>
            )}
          </div>

          {/* Mobile / Tablet Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setMobileSearchOpen((prev) => {
                const next = !prev;
                if (next) setTimeout(() => mobileInputRef.current?.focus(), 20);
                return next;
              });
            }}
            aria-label="Toggle platform search"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleNav('/quote')}
            className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-[var(--radius-control)] bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            {t(locale, 'nav.quote')}
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setMobileOpen((prev) => !prev);
            }}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Tablet / Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="mx-auto max-w-3xl space-y-2.5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <input
                ref={mobileInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search services, projects, blog posts..."
                aria-label="Search platform"
                className={`${UI.input} pl-9 pr-9`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 rounded p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {renderResultsDropdown()}
          </div>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNav(item.href)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNav('/process')}
            className="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Our Process
          </button>
          <button
            type="button"
            onClick={() => handleNav('/contact')}
            className="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Contact Us
          </button>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className={TYPOGRAPHY.scale.meta}>Language</span>
            <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-1">
              {(['en', 'om', 'am'] as Locale[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLocaleChange(l)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                    locale === l ? UI.tabActive : 'text-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNav('/quote')}
            className={`mt-2 w-full ${UI.btnPrimary}`}
          >
            {t(locale, 'nav.quote')}
          </button>
        </div>
      )}
    </header>
  );
}
