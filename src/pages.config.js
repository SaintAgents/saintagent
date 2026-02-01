/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ActivityFeed from './pages/ActivityFeed';
import Admin from './pages/Admin';
import AffiliateCenter from './pages/AffiliateCenter';
import Authority144 from './pages/Authority144';
import BetaFeedback from './pages/BetaFeedback';
import CRM from './pages/CRM';
import Circles from './pages/Circles';
import CommandDeck from './pages/CommandDeck';
import CommunityFeed from './pages/CommunityFeed';
import CourseDetail from './pages/CourseDetail';
import DailyOps from './pages/DailyOps';
import DatingMatches from './pages/DatingMatches';
import EvaluationDocs from './pages/EvaluationDocs';
import EvaluationSpec from './pages/EvaluationSpec';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import FAQ from './pages/FAQ';
import FindCollaborators from './pages/FindCollaborators';
import Forum from './pages/Forum';
import G3Dex from './pages/G3Dex';
import GGGCrypto from './pages/GGGCrypto';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import Initiations from './pages/Initiations';
import Insights from './pages/Insights';
import Join from './pages/Join';
import Landing from './pages/Landing';
import LeaderChannel from './pages/LeaderChannel';
import Leaderboards from './pages/Leaderboards';
import LearningHub from './pages/LearningHub';
import ListingDetail from './pages/ListingDetail';
import Lottery from './pages/Lottery';
import Marketplace from './pages/Marketplace';
import MatchSettings from './pages/MatchSettings';
import Matches from './pages/Matches';
import Meetings from './pages/Meetings';
import Mentorship from './pages/Mentorship';
import Messages from './pages/Messages';
import MissionCollaboration from './pages/MissionCollaboration';
import MissionDetail from './pages/MissionDetail';
import Missions from './pages/Missions';
import NeoNFTProvenance from './pages/NeoNFTProvenance';
import News from './pages/News';
import Notes from './pages/Notes';
import Onboarding from './pages/Onboarding';
import Planner from './pages/Planner';
import PressAnalytics from './pages/PressAnalytics';
import Profile from './pages/Profile';
import Profiles from './pages/Profiles';
import ProjectCreate from './pages/ProjectCreate';
import ProjectOnboard from './pages/ProjectOnboard';
import Projects from './pages/Projects';
import Quests from './pages/Quests';
import ResourceHub from './pages/ResourceHub';
import Settings from './pages/Settings';
import SovereignAlliance from './pages/SovereignAlliance';
import Studio from './pages/Studio';
import SynchronicityEngine from './pages/SynchronicityEngine';
import Teams from './pages/Teams';
import Terms from './pages/Terms';
import TopGGGMission from './pages/TopGGGMission';
import UserGuide from './pages/UserGuide';
import Videos from './pages/Videos';
import DemoLogin from './pages/DemoLogin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityFeed": ActivityFeed,
    "Admin": Admin,
    "AffiliateCenter": AffiliateCenter,
    "Authority144": Authority144,
    "BetaFeedback": BetaFeedback,
    "CRM": CRM,
    "Circles": Circles,
    "CommandDeck": CommandDeck,
    "CommunityFeed": CommunityFeed,
    "CourseDetail": CourseDetail,
    "DailyOps": DailyOps,
    "DatingMatches": DatingMatches,
    "EvaluationDocs": EvaluationDocs,
    "EvaluationSpec": EvaluationSpec,
    "EventDetail": EventDetail,
    "Events": Events,
    "FAQ": FAQ,
    "FindCollaborators": FindCollaborators,
    "Forum": Forum,
    "G3Dex": G3Dex,
    "GGGCrypto": GGGCrypto,
    "Gamification": Gamification,
    "Home": Home,
    "Initiations": Initiations,
    "Insights": Insights,
    "Join": Join,
    "Landing": Landing,
    "LeaderChannel": LeaderChannel,
    "Leaderboards": Leaderboards,
    "LearningHub": LearningHub,
    "ListingDetail": ListingDetail,
    "Lottery": Lottery,
    "Marketplace": Marketplace,
    "MatchSettings": MatchSettings,
    "Matches": Matches,
    "Meetings": Meetings,
    "Mentorship": Mentorship,
    "Messages": Messages,
    "MissionCollaboration": MissionCollaboration,
    "MissionDetail": MissionDetail,
    "Missions": Missions,
    "NeoNFTProvenance": NeoNFTProvenance,
    "News": News,
    "Notes": Notes,
    "Onboarding": Onboarding,
    "Planner": Planner,
    "PressAnalytics": PressAnalytics,
    "Profile": Profile,
    "Profiles": Profiles,
    "ProjectCreate": ProjectCreate,
    "ProjectOnboard": ProjectOnboard,
    "Projects": Projects,
    "Quests": Quests,
    "ResourceHub": ResourceHub,
    "Settings": Settings,
    "SovereignAlliance": SovereignAlliance,
    "Studio": Studio,
    "SynchronicityEngine": SynchronicityEngine,
    "Teams": Teams,
    "Terms": Terms,
    "TopGGGMission": TopGGGMission,
    "UserGuide": UserGuide,
    "Videos": Videos,
    "DemoLogin": DemoLogin,
}

export const pagesConfig = {
    mainPage: "ActivityFeed",
    Pages: PAGES,
    Layout: __Layout,
};