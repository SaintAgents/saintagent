import ActivityFeed from './pages/ActivityFeed';
import Admin from './pages/Admin';
import AffiliateCenter from './pages/AffiliateCenter';
import Circles from './pages/Circles';
import CommandDeck from './pages/CommandDeck';
import DailyOps from './pages/DailyOps';
import EventDetail from './pages/EventDetail';
import FAQ from './pages/FAQ';
import FindCollaborators from './pages/FindCollaborators';
import InviteLanding from './pages/InviteLanding';
import LeaderChannel from './pages/LeaderChannel';
import Leaderboards from './pages/Leaderboards';
import ListingDetail from './pages/ListingDetail';
import Marketplace from './pages/Marketplace';
import Matches from './pages/Matches';
import Meetings from './pages/Meetings';
import Mentorship from './pages/Mentorship';
import Messages from './pages/Messages';
import MissionCollaboration from './pages/MissionCollaboration';
import MissionDetail from './pages/MissionDetail';
import Missions from './pages/Missions';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProjectCreate from './pages/ProjectCreate';
import ProjectOnboard from './pages/ProjectOnboard';
import Projects from './pages/Projects';
import ResourceHub from './pages/ResourceHub';
import Settings from './pages/Settings';
import Studio from './pages/Studio';
import Terms from './pages/Terms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityFeed": ActivityFeed,
    "Admin": Admin,
    "AffiliateCenter": AffiliateCenter,
    "Circles": Circles,
    "CommandDeck": CommandDeck,
    "DailyOps": DailyOps,
    "EventDetail": EventDetail,
    "FAQ": FAQ,
    "FindCollaborators": FindCollaborators,
    "InviteLanding": InviteLanding,
    "LeaderChannel": LeaderChannel,
    "Leaderboards": Leaderboards,
    "ListingDetail": ListingDetail,
    "Marketplace": Marketplace,
    "Matches": Matches,
    "Meetings": Meetings,
    "Mentorship": Mentorship,
    "Messages": Messages,
    "MissionCollaboration": MissionCollaboration,
    "MissionDetail": MissionDetail,
    "Missions": Missions,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "ProjectCreate": ProjectCreate,
    "ProjectOnboard": ProjectOnboard,
    "Projects": Projects,
    "ResourceHub": ResourceHub,
    "Settings": Settings,
    "Studio": Studio,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "CommandDeck",
    Pages: PAGES,
    Layout: __Layout,
};