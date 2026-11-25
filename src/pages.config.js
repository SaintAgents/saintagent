import { lazy } from 'react';
import __Layout from './Layout.jsx';

// Keep the legacy route allowlist; additional pages get explicit routes in App.jsx.
const pageNames = `ActivityFeed Admin Advice AdviceDetail AffiliateCenter AffiliateDashboard Authority144 BetaFeedback Broadcast CRM Circles CommandDeck CommunityFeed ContentEditor ContentStudio CourseDetail DailyOps DatingMatches Deals DemoLogin DemoPreview DigitalRightsExchange EvaluationDocs EvaluationSpec EventDetail Events FAQ FindCollaborators Forum G3Dex GGGCrypto GaiaGlobalTreasury Gamification Home Initiations Insights Join Landing LeaderChannel Leaderboards LearningHub ListingDetail Lottery Marketplace MatchSettings Matches Meetings Mentorship Messages MissionCollaboration MissionDetail Missions NeoNFTProvenance News Notes Onboarding Planner PressAnalytics Profile Profiles ProjectCreate ProjectOnboard ProjectTrack Projects Quests ResourceHub Schedule Settings SovereignAlliance SpiritTube Studio SynchronicityEngine Teams Terms Testimonials TopGGGMission UserGuide Videos`.split(' ');
const loaders = import.meta.glob('./pages/*.jsx');
export const PAGES = Object.fromEntries(pageNames.map(name => [name, lazy(loaders[`./pages/${name}.jsx`])]));

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};