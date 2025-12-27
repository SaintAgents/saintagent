import CommandDeck from './pages/CommandDeck';
import Matches from './pages/Matches';
import Meetings from './pages/Meetings';
import Missions from './pages/Missions';
import Marketplace from './pages/Marketplace';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CommandDeck": CommandDeck,
    "Matches": Matches,
    "Meetings": Meetings,
    "Missions": Missions,
    "Marketplace": Marketplace,
}

export const pagesConfig = {
    mainPage: "CommandDeck",
    Pages: PAGES,
    Layout: __Layout,
};