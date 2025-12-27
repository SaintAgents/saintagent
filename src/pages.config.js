import CommandDeck from './pages/CommandDeck';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CommandDeck": CommandDeck,
}

export const pagesConfig = {
    mainPage: "CommandDeck",
    Pages: PAGES,
    Layout: __Layout,
};