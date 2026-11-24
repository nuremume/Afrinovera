import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, FolderOpen, Target } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Locale, ProjectItem } from '../types';
import { pickText } from '../i18n/translations';
import { SPACING, TYPOGRAPHY, UI } from '../DesignSystem';
import { Button, Card, EmptyState, Modal, PageHeroBanner, SkeletonGrid } from '../components/ui';

const CATEGORIES = [
  { slug: 'all', label: 'All Projects' },
  { slug: 'web-development-design', label: 'Web Development' },
  { slug: 'software-solutions', label: 'Software Solutions' },
  { slug: 'cybersecurity-solutions', label: 'Cybersecurity' },
  { slug: 'it-infrastructure-networking', label: 'Networking & IT' },
  { slug: 'technology-consulting-support', label: 'Consulting' },
];

export function PortfolioPage({
  locale,
  projects,
  loading = false,
}: {
  locale: Locale;
  projects: ProjectItem[];
  loading?: boolean;
}) {
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const projectSlugParam = query.get('project');

  useEffect(() => {
    if (!projectSlugParam) return;
    const match = projects.find(
      (p) => p.isPublicPortfolio && p.clientDisplayConsent && p.slug === projectSlugParam
    );
    if (match) {
      setSelectedCategory('all');
      setActiveProject(match);
    }
  }, [projectSlugParam, projects]);

  const publicProjects = projects.filter(
    (p) =>
      p.isPublicPortfolio &&
      p.clientDisplayConsent &&
      (selectedCategory === 'all' || p.category === selectedCategory)
  );

  function closeModal() {
    setActiveProject(null);
    if (projectSlugParam) navigate('/portfolio', { replace: true });
  }

  return (
    <div className={UI.pageShell}>
      <PageHeroBanner
        eyebrow="Case Studies"
        title="Project Portfolio"
        description="Selected web platforms, custom software systems, and infrastructure engagements published with explicit client permission."
      />

      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className={`${SPACING.container} py-3.5`}>
          <div className={UI.tabList} role="tablist" aria-label="Portfolio categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`${UI.tabButtonBase} ${
                  selectedCategory === cat.slug ? UI.tabActive : UI.tabInactive
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${SPACING.container} ${SPACING.contentPadY}`}>
        {loading && projects.length === 0 ? (
          <SkeletonGrid count={3} heightClass="h-80" />
        ) : publicProjects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title="No Published Projects in This Category"
            description="AFRINOVERA publishes case studies only after explicit client display permission is recorded."
            action={
              <Button onClick={() => navigate('/quote')}>
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        ) : (
          <div className={`grid ${SPACING.gridGap} md:grid-cols-2 lg:grid-cols-3`}>
            {publicProjects.map((project) => (
              <article
                key={project.id}
                className={`flex flex-col overflow-hidden ${UI.surfaceCardInteractive}`}
              >
                <div className="aspect-[4/3] bg-navy-900 overflow-hidden">
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={pickText(project.title, locale)}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-slate-300">
                      {pickText(project.title, locale)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className={TYPOGRAPHY.scale.meta}>
                    <span className="capitalize">{project.category.replace(/-/g, ' ')}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{project.referenceNumber}</span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-navy-900">
                    {pickText(project.title, locale)}
                  </h2>
                  <p className={`mt-2 flex-1 ${TYPOGRAPHY.scale.body}`}>
                    {pickText(project.summary, locale)}
                  </p>

                  <p className={`mt-4 ${TYPOGRAPHY.scale.meta}`}>
                    {project.technologies.join(' · ')}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <Button variant="link" onClick={() => setActiveProject(project)}>
                      Read Case Study
                    </Button>
                    {project.liveUrl && /^https?:\/\//i.test(project.liveUrl) && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-900"
                      >
                        Live Site <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(activeProject)}
        onClose={closeModal}
        title={activeProject ? pickText(activeProject.title, locale) : ''}
        eyebrow={
          activeProject ? (
            <span className="capitalize">
              {activeProject.category.replace(/-/g, ' ')} ·{' '}
              <span className="font-mono tabular-nums">{activeProject.referenceNumber}</span>
            </span>
          ) : null
        }
        footer={
          activeProject ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                const cat = activeProject.category;
                setActiveProject(null);
                navigate(`/quote?service=${cat}`);
              }}
            >
              Request Similar Solution <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null
        }
      >
        {activeProject && (
          <>
            <p className={TYPOGRAPHY.scale.body}>
              {pickText(activeProject.summary, locale)}
            </p>

            {activeProject.objectives && (
              <Card variant="muted" padding="sm" className="mt-6">
                <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <Target className="h-4 w-4 text-blue-700 shrink-0" /> Project Objectives
                </div>
                <p className={`mt-2 ${TYPOGRAPHY.scale.body}`}>
                  {pickText(activeProject.objectives, locale)}
                </p>
              </Card>
            )}

            {activeProject.results && (
              <div className="mt-4 rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Project Results
                </div>
                <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
                  {pickText(activeProject.results, locale)}
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className={UI.labelCompact}>Technologies Used</p>
              <p className="mt-1.5 text-sm font-medium text-navy-900">
                {activeProject.technologies.join(' · ')}
              </p>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
