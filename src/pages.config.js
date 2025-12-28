import CommandDeck from './pages/CommandDeck';
import Matches from './pages/Matches';
import Meetings from './pages/Meetings';
import Missions from './pages/Missions';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Circles from './pages/Circles';
import Studio from './pages/Studio';
import Onboarding from './pages/Onboarding';
import AffiliateCenter from './pages/AffiliateCenter';
import Admin from './pages/Admin';
import LeaderChannel from './pages/LeaderChannel';
import Landing from './pages/Landing';
import MissionDetail from './pages/MissionDetail';
import FindCollaborators from './pages/FindCollaborators';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CommandDeck": CommandDeck,
    "Matches": Matches,
    "Meetings": Meetings,
    "Missions": Missions,
    "Marketplace": Marketplace,
    "Profile": Profile,
    "Settings": Settings,
    "Messages": Messages,
    "Circles": Circles,
    "Studio": Studio,
    "Onboarding": Onboarding,
    "AffiliateCenter": AffiliateCenter,
    "Admin": Admin,
    "LeaderChannel": LeaderChannel,
    "Landing": Landing,
    "MissionDetail": MissionDetail,
    "FindCollaborators": FindCollaborators,
}

export const pagesConfig = {
    mainPage: "CommandDeck",
    Pages: PAGES,
    Layout: __Layout,
};