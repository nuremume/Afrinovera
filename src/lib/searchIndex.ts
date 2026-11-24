import type { BlogPostItem, Locale, ProjectItem, ServiceItem } from '../types';
import { pickText } from '../i18n/translations';

export type SearchResultKind = 'service' | 'portfolio' | 'insight';

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  searchableText: string;
}

function allLocalizedStrings(text?: { en?: string; om?: string; am?: string } | null): string {
  if (!text) return '';
  return [text.en, text.om, text.am].filter(Boolean).join(' ');
}

export function buildPlatformSearchIndex(params: {
  locale: Locale;
  services: ServiceItem[];
  projects: ProjectItem[];
  posts: BlogPostItem[];
}): SearchResultItem[] {
  const { locale, services, projects, posts } = params;

  const serviceItems: SearchResultItem[] = services.map((svc) => {
    const title = pickText(svc.title, locale);
    const summary = pickText(svc.summary, locale);
    return {
      id: `svc-${svc.id}`,
      kind: 'service',
      title,
      subtitle: summary,
      meta: 'Service',
      href: `/services/${svc.slug}`,
      searchableText: `${allLocalizedStrings(svc.title)} ${allLocalizedStrings(svc.summary)}`.toLowerCase(),
    };
  });

  const portfolioItems: SearchResultItem[] = projects
    .filter((p) => p.isPublicPortfolio && p.clientDisplayConsent)
    .map((prj) => {
      const title = pickText(prj.title, locale);
      const description = pickText(prj.summary, locale);
      return {
        id: `prj-${prj.id}`,
        kind: 'portfolio',
        title,
        subtitle: description,
        meta: `Portfolio · ${prj.category.replace(/-/g, ' ')}`,
        href: `/portfolio?project=${encodeURIComponent(prj.slug)}`,
        searchableText: `${allLocalizedStrings(prj.summary)} ${allLocalizedStrings(prj.objectives)} ${allLocalizedStrings(prj.results)} ${allLocalizedStrings(prj.title)} ${prj.technologies.join(' ')}`.toLowerCase(),
      };
    });

  const insightItems: SearchResultItem[] = posts.map((post) => {
    const title = pickText(post.title, locale);
    const excerpt = pickText(post.excerpt, locale);
    return {
      id: `post-${post.id}`,
      kind: 'insight',
      title,
      subtitle: excerpt,
      meta: `Insight · ${pickText(post.categoryName, locale)}`,
      href: `/insights/${post.slug}`,
      searchableText: `${allLocalizedStrings(post.title)} ${allLocalizedStrings(post.excerpt)} ${post.tags.join(' ')}`.toLowerCase(),
    };
  });

  return [...serviceItems, ...portfolioItems, ...insightItems];
}

export function searchPlatformIndex(
  index: SearchResultItem[],
  rawQuery: string
): SearchResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  return index
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const subtitleLower = item.subtitle.toLowerCase();
      const allMatch = tokens.every((tok) => item.searchableText.includes(tok));
      if (!allMatch) return null;

      let score = 0;
      if (titleLower.includes(q)) score += 10;
      if (subtitleLower.includes(q)) score += 6;
      for (const tok of tokens) {
        if (titleLower.includes(tok)) score += 4;
        if (subtitleLower.includes(tok)) score += 2;
      }
      return { item, score };
    })
    .filter((entry): entry is { item: SearchResultItem; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
