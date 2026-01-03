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
import Marketplace from './pages/Marketplace';
import Matches from './pages/Matches';
import Meetings from './pages/Meetings';
import Messages from './pages/Messages';
import MissionCollaboration from './pages/MissionCollaboration';
import MissionDetail from './pages/MissionDetail';
import Missions from './pages/Missions';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Studio from './pages/Studio';
import Terms from './pages/Terms';
import ProjectOnboard from './pages/ProjectOnboard';
import ProjectCreate from './pages/ProjectCreate';
import __Layout from './Layout.jsx';


export const PAGES = {
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
    "Marketplace": Marketplace,
    "Matches": Matches,
    "Meetings": Meetings,
    "Messages": Messages,
    "MissionCollaboration": MissionCollaboration,
    "MissionDetail": MissionDetail,
    "Missions": Missions,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "Settings": Settings,
    "Studio": Studio,
    "Terms": Terms,
    "ProjectOnboard": ProjectOnboard,
    "ProjectCreate": ProjectCreate,
}

export const pagesConfig = {
    mainPage: "CommandDeck",
    Pages: PAGES,
    Layout: __Layout,
};