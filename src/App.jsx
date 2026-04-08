import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import BudgetForecast from './pages/BudgetForecast';
import MissionGantt from './pages/MissionGantt';
import ResourceScheduler from './pages/ResourceScheduler';
import TeamWorkload from './pages/TeamWorkload';
import MyDashboard from './pages/MyDashboard';
import ClientPortal from './pages/ClientPortal';
import ImpactDashboard from './pages/ImpactDashboard';
import OutreachSequences from './pages/OutreachSequences';
import DailyPlanner from './pages/DailyPlanner';
import Analytics from './pages/Analytics';
import BookCall from './pages/BookCall';
import WhatsAppDashboard from './pages/WhatsAppDashboard';
import BusinessEntities from './pages/BusinessEntities';
import BusinessEntityProfile from './pages/BusinessEntityProfile';
import Glossary from './pages/Glossary';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App