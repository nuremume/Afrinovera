import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type {
  BlogPostItem,
  CompanySettings,
  Locale,
  ProjectItem,
  ServiceItem,
} from './types';
import { apiRequest } from './lib/api';
import { UI } from './DesignSystem';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminConsoleGuard, ClientPortalGuard } from './routes/RouteGuards';
import { HomePage } from './pages/HomePage';
import { ServiceDetailPage, ServicesOverviewPage } from './pages/ServicesPages';
import { PortfolioPage } from './pages/PortfolioPage';
import { ProcessPage } from './pages/ProcessPage';
import { InsightDetailPage, InsightsPage } from './pages/InsightsPage';
import { AboutPage } from './pages/AboutPage';
import { ConsultationPage, ContactPage, QuotePage } from './pages/ContactQuotePages';
import { AuthPage } from './pages/AuthPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

interface BootstrapPayload {
  settings: CompanySettings;
  services: ServiceItem[];
  featuredProjects: ProjectItem[];
  latestPosts: BlogPostItem[];
}

function PublicLayout({
  locale,
  onLocaleChange,
  services,
  projects,
  posts,
  settings,
  hideFooter = false,
  children,
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  services: ServiceItem[];
  projects: ProjectItem[];
  posts: BlogPostItem[];
  settings: CompanySettings | null;
  hideFooter?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={UI.pageShellWhite}>
      <Navbar
        locale={locale}
        onLocaleChange={onLocaleChange}
        services={services}
        projects={projects}
        posts={posts}
      />
      <main className="flex-1">{children}</main>
      {!hideFooter && (
        <Footer locale={locale} onLocaleChange={onLocaleChange} settings={settings} />
      )}
    </div>
  );
}

function AppShell() {
  const [locale, setLocale] = useState<Locale>('en');
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);
  const [portfolioProjects, setPortfolioProjects] = useState<ProjectItem[]>([]);
  const [insightPosts, setInsightPosts] = useState<BlogPostItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const loadPublicData = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [boot, port, ins] = await Promise.all([
        apiRequest<BootstrapPayload>('/api/public/bootstrap'),
        apiRequest<{ projects: ProjectItem[] }>('/api/public/portfolio'),
        apiRequest<{ posts: BlogPostItem[] }>('/api/public/insights'),
      ]);
      setBootstrap(boot);
      setPortfolioProjects(port.projects);
      setInsightPosts(ins.posts);
    } catch (err: any) {
      console.error('Failed to load public catalog:', err);
      setCatalogError(err?.message || 'Unable to load public catalog');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  const services = bootstrap?.services || [];
  const featuredProjects = bootstrap?.featuredProjects || [];
  const latestPosts = bootstrap?.latestPosts || [];
  const settings = bootstrap?.settings || null;

  const layoutProps = {
    locale,
    onLocaleChange: setLocale,
    services,
    projects: portfolioProjects,
    posts: insightPosts,
    settings,
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminConsoleGuard
              fallback={
                <PublicLayout {...layoutProps}>
                  <AuthPage defaultMode="admin" />
                </PublicLayout>
              }
            >
              <AdminDashboardPage onSettingsChanged={loadPublicData} />
            </AdminConsoleGuard>
          }
        />

        <Route
          path="/portal/*"
          element={
            <ClientPortalGuard
              fallback={
                <PublicLayout {...layoutProps}>
                  <AuthPage defaultMode="client" />
                </PublicLayout>
              }
            >
              <PublicLayout {...layoutProps} hideFooter>
                <ClientPortalPage />
              </PublicLayout>
            </ClientPortalGuard>
          }
        />

        <Route
          path="/"
          element={
            <PublicLayout {...layoutProps}>
              <HomePage
                locale={locale}
                onLocaleChange={setLocale}
                services={services}
                featuredProjects={featuredProjects}
                latestPosts={latestPosts}
                settings={settings}
                loading={catalogLoading}
                error={catalogError}
                onRetry={loadPublicData}
              />
            </PublicLayout>
          }
        />
        <Route
          path="/services"
          element={
            <PublicLayout {...layoutProps}>
              <ServicesOverviewPage locale={locale} services={services} loading={catalogLoading} />
            </PublicLayout>
          }
        />
        <Route
          path="/services/:slug"
          element={
            <PublicLayout {...layoutProps}>
              <ServiceDetailPage locale={locale} services={services} loading={catalogLoading} />
            </PublicLayout>
          }
        />
        <Route
          path="/portfolio"
          element={
            <PublicLayout {...layoutProps}>
              <PortfolioPage locale={locale} projects={portfolioProjects} loading={catalogLoading} />
            </PublicLayout>
          }
        />
        <Route
          path="/process"
          element={
            <PublicLayout {...layoutProps}>
              <ProcessPage />
            </PublicLayout>
          }
        />
        <Route
          path="/insights"
          element={
            <PublicLayout {...layoutProps}>
              <InsightsPage locale={locale} posts={insightPosts} loading={catalogLoading} />
            </PublicLayout>
          }
        />
        <Route
          path="/insights/:slug"
          element={
            <PublicLayout {...layoutProps}>
              <InsightDetailPage locale={locale} posts={insightPosts} loading={catalogLoading} />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout {...layoutProps}>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout {...layoutProps}>
              <ContactPage locale={locale} settings={settings} />
            </PublicLayout>
          }
        />
        <Route
          path="/quote"
          element={
            <PublicLayout {...layoutProps}>
              <QuotePage locale={locale} services={services} />
            </PublicLayout>
          }
        />
        <Route
          path="/consultation"
          element={
            <PublicLayout {...layoutProps}>
              <ConsultationPage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout {...layoutProps}>
              <AuthPage defaultMode="client" />
            </PublicLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PublicLayout {...layoutProps}>
              <AuthPage defaultMode="register" />
            </PublicLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
