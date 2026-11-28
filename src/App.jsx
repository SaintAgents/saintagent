import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';

import ObservationPreview from '@/components/observation/ObservationPreview';
import DockDeck from '@/components/dock/DockDeck';
import GoldFlakeProvider from '@/components/rewards/GoldFlakeProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// ErrorBoundary used per-page in Layout, not at app level

const loaders = import.meta.glob('./pages/*.jsx');
const lazyPage = name => React.lazy(loaders[`./pages/${name}.jsx`]);
const BudgetForecast = lazyPage('BudgetForecast'), MissionGantt = lazyPage('MissionGantt'), ResourceScheduler = lazyPage('ResourceScheduler'), TeamWorkload = lazyPage('TeamWorkload');
const MyDashboard = lazyPage('MyDashboard'), ClientPortal = lazyPage('ClientPortal'), ImpactDashboard = lazyPage('ImpactDashboard'), OutreachSequences = lazyPage('OutreachSequences');
const DailyPlanner = lazyPage('DailyPlanner'), Analytics = lazyPage('Analytics'), BookCall = lazyPage('BookCall'), WhatsAppDashboard = lazyPage('WhatsAppDashboard');
const BusinessEntities = lazyPage('BusinessEntities'), BusinessEntityProfile = lazyPage('BusinessEntityProfile'), Glossary = lazyPage('Glossary'), Milestones = lazyPage('Milestones');
const CacheAdmin = lazyPage('CacheAdmin'), MissionManage = lazyPage('MissionManage'), MissionTimeline = lazyPage('MissionTimeline'), MissionGrid = lazyPage('MissionGrid');
const Learn = lazyPage('Learn'), ReviewerWorkflow = lazyPage('ReviewerWorkflow'), ReviewManagerDashboard = lazyPage('ReviewManagerDashboard');
const VCardLanding = lazyPage('VCardLanding'), PublicLinkTree = lazyPage('PublicLinkTree'), LinkTreeEditor = lazyPage('LinkTreeEditor');
const Watchlist = lazyPage('Watchlist'), SavedItems = lazyPage('SavedItems'), Intelligence = lazyPage('Intelligence'), WisdomExchange = lazyPage('WisdomExchange');
const GlobalImpactDashboard = lazyPage('GlobalImpactDashboard'), WorldPulse = lazyPage('WorldPulse'), SharedSearch = lazyPage('SharedSearch'), IntelligenceDashboard = lazyPage('IntelligenceDashboard');
const DocumentVault = lazyPage('DocumentVault'), ConferencePortal = lazyPage('ConferencePortal'), MyGuide = lazyPage('MyGuide'), CelestialInsights = lazyPage('CelestialInsights'), BusinessPlanBuilder = lazyPage('BusinessPlanBuilder');
const Login = lazyPage('Login'), Register = lazyPage('Register'), ForgotPassword = lazyPage('ForgotPassword'), ResetPassword = lazyPage('ResetPassword'), Mfa = lazyPage('Mfa');
const ObservationDeck = lazyPage('ObservationDeck');
const MyCommandCenter = lazyPage('MyCommandCenter');

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => {
  const { search } = useLocation();
  if (window.parent !== window && new URLSearchParams(search).get('observationPreview') === '1') {
    return <ObservationPreview id={currentPageName}>{children}</ObservationPreview>;
  }
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

// Pages that do NOT require authentication
const PUBLIC_PATHS = new Set([
  '/', '/join', '/home', '/faq', '/terms', '/landing', '/onboarding',
  '/demopreview', '/demologin', '/login', '/signup', '/welcome',
  '/register', '/forgot-password', '/reset-password', '/mfa'
]);

const isPublicPath = (pathname) => {
  return PUBLIC_PATHS.has(pathname.toLowerCase()) || /^\/(?:linktree(?:\/[^/]+)?|(?:v|vcard)\/[^/]+)\/?$/i.test(pathname);
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, authError } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = React.useState(false);

  const isPublic = isPublicPath(location.pathname);

  // For protected pages: safety timeout + redirect if no user
  React.useEffect(() => {
    if (isPublic) return;

    if (isLoadingAuth) {
      const t = setTimeout(() => setShowFallback(true), 5000);
      return () => clearTimeout(t);
    }

    if (!user) {
      const sharedCircle = /^\/circles\/?$/i.test(location.pathname) && new URLSearchParams(location.search).has('group');
      const commandCenter = /^\/mycommandcenter\/?$/i.test(location.pathname);
      window.location.replace(sharedCircle || commandCenter ? `/login?${new URLSearchParams({ returnTo: location.pathname + location.search })}` : '/');
    }
  }, [isPublic, isLoadingAuth, user, location.pathname, location.search]);

  // Public pages render immediately
  if (isPublic) {
    return <AppRoutes />;
  }

  // Auth still loading
  if (isLoadingAuth && !showFallback) {
    return <LoadingSpinner />;
  }

  if (isLoadingAuth && showFallback) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Taking longer than expected...</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.replace('/')} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Go to Home</button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  const embedded = window.parent !== window && new URLSearchParams(location.search).get('observationPreview') === '1';
  const tourPreview = isTourPreview();
  const dockPreview = tourPreview && new URLSearchParams(location.search).get('tourView') === 'dock';
  const dockDisabled = embedded || (tourPreview && !dockPreview) || /^\/(g3dex|gggcrypto)\/?$/i.test(location.pathname);
  return <GoldFlakeProvider key={user.id} user={user} disabled={embedded || tourPreview}>
    <DockDeck key={user.id} user={user} disabled={dockDisabled} preview={dockPreview}><AppRoutes /></DockDeck>
  </GoldFlakeProvider>;
};

// Separated routes so both public and authenticated paths use the same route tree
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={
      <LayoutWrapper currentPageName={mainPageKey}>
        <MainPage />
      </LayoutWrapper>
    } />
    {Object.entries(Pages).map(([path, Page]) => (
      <Route
        key={path}
        path={`/${path}`}
        element={
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        }
      />
    ))}
    <Route path="/BudgetForecast" element={<LayoutWrapper currentPageName="BudgetForecast"><BudgetForecast /></LayoutWrapper>} />
    <Route path="/MissionGantt" element={<LayoutWrapper currentPageName="MissionGantt"><MissionGantt /></LayoutWrapper>} />
    <Route path="/ResourceScheduler" element={<LayoutWrapper currentPageName="ResourceScheduler"><ResourceScheduler /></LayoutWrapper>} />
    <Route path="/TeamWorkload" element={<LayoutWrapper currentPageName="TeamWorkload"><TeamWorkload /></LayoutWrapper>} />
    <Route path="/MyDashboard" element={<LayoutWrapper currentPageName="MyDashboard"><MyDashboard /></LayoutWrapper>} />
    <Route path="/ClientPortal" element={<LayoutWrapper currentPageName="ClientPortal"><ClientPortal /></LayoutWrapper>} />
    <Route path="/ImpactDashboard" element={<LayoutWrapper currentPageName="ImpactDashboard"><ImpactDashboard /></LayoutWrapper>} />
    <Route path="/OutreachSequences" element={<LayoutWrapper currentPageName="OutreachSequences"><OutreachSequences /></LayoutWrapper>} />
    <Route path="/DailyPlanner" element={<LayoutWrapper currentPageName="DailyPlanner"><DailyPlanner /></LayoutWrapper>} />
    <Route path="/Analytics" element={<LayoutWrapper currentPageName="Analytics"><Analytics /></LayoutWrapper>} />
    <Route path="/BookCall" element={<LayoutWrapper currentPageName="BookCall"><BookCall /></LayoutWrapper>} />
    <Route path="/WhatsAppDashboard" element={<LayoutWrapper currentPageName="WhatsAppDashboard"><WhatsAppDashboard /></LayoutWrapper>} />
    <Route path="/BusinessEntities" element={<LayoutWrapper currentPageName="BusinessEntities"><BusinessEntities /></LayoutWrapper>} />
    <Route path="/BusinessEntityProfile" element={<LayoutWrapper currentPageName="BusinessEntityProfile"><BusinessEntityProfile /></LayoutWrapper>} />
    <Route path="/Glossary" element={<LayoutWrapper currentPageName="Glossary"><Glossary /></LayoutWrapper>} />
    <Route path="/Milestones" element={<LayoutWrapper currentPageName="Milestones"><Milestones /></LayoutWrapper>} />
    <Route path="/CacheAdmin" element={<LayoutWrapper currentPageName="CacheAdmin"><CacheAdmin /></LayoutWrapper>} />
    <Route path="/MissionManage" element={<LayoutWrapper currentPageName="MissionManage"><MissionManage /></LayoutWrapper>} />
    <Route path="/MissionTimeline" element={<LayoutWrapper currentPageName="MissionTimeline"><MissionTimeline /></LayoutWrapper>} />
    <Route path="/MissionGrid" element={<LayoutWrapper currentPageName="MissionGrid"><MissionGrid /></LayoutWrapper>} />
    <Route path="/Learn" element={<LayoutWrapper currentPageName="Learn"><Learn /></LayoutWrapper>} />
    <Route path="/ReviewerWorkflow" element={<LayoutWrapper currentPageName="ReviewerWorkflow"><ReviewerWorkflow /></LayoutWrapper>} />
    <Route path="/ReviewManagerDashboard" element={<LayoutWrapper currentPageName="ReviewManagerDashboard"><ReviewManagerDashboard /></LayoutWrapper>} />
    <Route path="/CelestialInsights" element={<LayoutWrapper currentPageName="CelestialInsights"><CelestialInsights /></LayoutWrapper>} />
    <Route path="/BusinessPlanBuilder" element={<LayoutWrapper currentPageName="BusinessPlanBuilder"><BusinessPlanBuilder /></LayoutWrapper>} />
    <Route path="/vcard/:saNumber" element={<VCardLanding />} />
    <Route path="/v/:saNumber" element={<VCardLanding />} />
    <Route path="/LinkTree" element={<PublicLinkTree />} />
    <Route path="/LinkTree/:userId" element={<PublicLinkTree />} />
    <Route path="/LinkTreeEditor" element={<LayoutWrapper currentPageName="LinkTreeEditor"><LinkTreeEditor /></LayoutWrapper>} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/mfa" element={<Mfa />} />
    <Route element={<ProtectedRoute unauthenticatedElement={<a href="/login">Sign in to continue</a>} />}>
      <Route path="/ObservationDeck" element={<LayoutWrapper currentPageName="ObservationDeck"><ObservationDeck /></LayoutWrapper>} />
      <Route path="/MyCommandCenter" element={<LayoutWrapper currentPageName="MyCommandCenter"><MyCommandCenter /></LayoutWrapper>} />
      <Route path="/Watchlist" element={<LayoutWrapper currentPageName="Watchlist"><Watchlist /></LayoutWrapper>} />
      <Route path="/SavedItems" element={<LayoutWrapper currentPageName="SavedItems"><SavedItems /></LayoutWrapper>} />
      <Route path="/Intelligence" element={<LayoutWrapper currentPageName="Intelligence"><Intelligence /></LayoutWrapper>} />
      <Route path="/WisdomExchange" element={<LayoutWrapper currentPageName="WisdomExchange"><WisdomExchange /></LayoutWrapper>} />
      <Route path="/ConferencePortal" element={<LayoutWrapper currentPageName="ConferencePortal"><ConferencePortal /></LayoutWrapper>} />
      <Route path="/MyGuide" element={<LayoutWrapper currentPageName="MyGuide"><MyGuide /></LayoutWrapper>} />
      <Route path="/GlobalImpactDashboard" element={<LayoutWrapper currentPageName="GlobalImpactDashboard"><GlobalImpactDashboard /></LayoutWrapper>} />
      <Route path="/WorldPulse" element={<LayoutWrapper currentPageName="WorldPulse"><WorldPulse /></LayoutWrapper>} />
      <Route path="/SharedSearch" element={<LayoutWrapper currentPageName="SharedSearch"><SharedSearch /></LayoutWrapper>} />
      <Route path="/IntelligenceDashboard" element={<LayoutWrapper currentPageName="IntelligenceDashboard"><IntelligenceDashboard /></LayoutWrapper>} />
      <Route path="/DocumentVault" element={<LayoutWrapper currentPageName="DocumentVault"><DocumentVault /></LayoutWrapper>} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          {!isTourPreview() && !(window.parent !== window && new URLSearchParams(window.location.search).get('observationPreview') === '1') && <NavigationTracker />}
          <React.Suspense fallback={<LoadingSpinner />}>
            <AuthenticatedApp />
          </React.Suspense>
        </Router>
        <Toaster />
        <SonnerToaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App