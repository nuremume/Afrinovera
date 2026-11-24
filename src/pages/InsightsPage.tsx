import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BlogPostItem, Locale } from '../types';
import { pickText } from '../i18n/translations';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Button, EmptyState, PageHeroBanner, SkeletonGrid } from '../components/ui';

export function InsightsPage({
  locale,
  posts,
  loading = false,
}: {
  locale: Locale;
  posts: BlogPostItem[];
  loading?: boolean;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts) {
      map.set(p.categorySlug, pickText(p.categoryName, locale));
    }
    return Array.from(map.entries());
  }, [posts, locale]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
      if (selectedTag && !p.tags.includes(selectedTag)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${pickText(p.title, locale)} ${pickText(p.excerpt, locale)} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedTag, search, locale]);

  return (
    <div className={UI.pageShell}>
      <PageHeroBanner
        eyebrow="AFRINOVERA Insights"
        title="Technology Insights & Tutorials"
        description="Engineering tutorials, cybersecurity awareness, software architecture, and digital transformation guides."
      >
        <div className="mt-8 max-w-xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, cybersecurity, software..."
            aria-label="Search technology insights articles"
            className="w-full min-h-[44px] rounded-[var(--radius-control)] border border-navy-800 bg-navy-900 py-2.5 pl-11 pr-4 text-base sm:text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </PageHeroBanner>

      <div className={`${SPACING.container} ${SPACING.contentPadY}`}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className={UI.tabList} role="tablist" aria-label="Article categories">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all' && !selectedTag}
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className={`${UI.tabButtonBase} ${
                selectedCategory === 'all' && !selectedTag ? UI.tabActive : UI.tabInactive
              }`}
            >
              All Topics
            </button>
            {categories.map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                role="tab"
                aria-selected={selectedCategory === slug}
                onClick={() => setSelectedCategory(slug)}
                className={`${UI.tabButtonBase} ${
                  selectedCategory === slug ? UI.tabActive : UI.tabInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="min-h-[36px] text-xs font-semibold text-blue-700 hover:underline"
            >
              Clear tag filter: #{selectedTag}
            </button>
          )}
        </div>

        {loading && posts.length === 0 ? (
          <SkeletonGrid count={3} heightClass="h-80" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-10 w-10" />}
            title="No Matching Articles"
            description="Adjust your search terms or clear active topic filters."
            action={
              (search || selectedCategory !== 'all' || selectedTag) ? (
                <Button
                  variant="secondaryLight"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setSelectedTag(null);
                  }}
                >
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={`grid ${SPACING.gridGap} md:grid-cols-2 lg:grid-cols-3`}>
            {filtered.map((post) => (
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

                  <h2 className="mt-2.5 text-lg font-bold text-navy-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => navigate(`/insights/${post.slug}`)}
                      className="text-left hover:text-blue-700 transition-colors"
                    >
                      {pickText(post.title, locale)}
                    </button>
                  </h2>

                  <p className={`mt-2 flex-1 ${TYPOGRAPHY.scale.body}`}>
                    {pickText(post.excerpt, locale)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs">
                    {post.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className="py-1 font-medium text-slate-500 hover:text-blue-700"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InsightDetailPage({
  locale,
  posts,
  loading = false,
}: {
  locale: Locale;
  posts: BlogPostItem[];
  loading?: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);

  if (loading && !post) {
    return (
      <div className={`${SPACING.containerProse} ${SPACING.contentPadY} space-y-6`}>
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="h-64 rounded-[var(--radius-card)] bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="Article Not Found"
          description="The requested article could not be found."
          action={
            <Button variant="secondaryLight" onClick={() => navigate('/insights')}>
              Back to Insights
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <article className={`${SPACING.containerProse} ${SPACING.contentPadY}`}>
      <Button
        variant="link"
        onClick={() => navigate('/insights')}
        className="hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Technology Insights
      </Button>

      <header className="mt-6 space-y-3 border-b border-[var(--color-border)] pb-6">
        <div className={TYPOGRAPHY.scale.meta}>
          <span>{pickText(post.categoryName, locale)}</span>
          <span aria-hidden="true"> · </span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          <span aria-hidden="true"> · </span>
          <span>{post.readTime}</span>
          <span aria-hidden="true"> · </span>
          <span>By {post.authorName}</span>
        </div>
        <h1 className={`${TYPOGRAPHY.scale.articleTitle} text-navy-900`}>
          {pickText(post.title, locale)}
        </h1>
      </header>

      {post.coverImageUrl && (
        <div className={`mt-8 aspect-[16/9] overflow-hidden ${UI.surfaceCard} bg-slate-100`}>
          <img
            src={post.coverImageUrl}
            alt={pickText(post.title, locale)}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mt-8 whitespace-pre-line break-words text-base leading-relaxed text-slate-700">
        {pickText(post.content, locale)}
      </div>

      <div className={`mt-10 border-t border-[var(--color-border)] pt-6 ${TYPOGRAPHY.scale.meta}`}>
        Topics: {post.tags.join(' · ')}
      </div>
    </article>
  );
}
