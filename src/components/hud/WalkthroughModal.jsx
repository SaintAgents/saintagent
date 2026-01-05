import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Sparkles, Users, Target, Briefcase, MessageCircle, LayoutDashboard, Network, Activity, ShoppingBag, Lightbulb } from "lucide-react";

export default function WalkthroughModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-violet-600" />
            SaintAgent User Guide
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-8 text-sm">
            <p className="text-slate-600">
              SaintAgent is a mission-driven social network and marketplace for people who want to learn, collaborate and contribute to causes that matter. This guide provides a walkthrough of the key features, screens and workflows available on the platform.
            </p>

            {/* Getting Started */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                Getting Started and Onboarding
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">Account Creation</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-2">
                    <li><strong>Visit the website</strong> – Navigate to saintagent.world in a browser. Click Sign up and enter your email or social-login details. You'll be asked to choose a display name and a unique handle.</li>
                    <li><strong>Verify your email</strong> – After creating an account you may receive an email with a verification link. Complete verification to continue.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium text-slate-800 mb-2">Onboarding Walk-Through</h3>
                  <p className="text-slate-600 mb-2">After logging in, SaintAgent guides you through a multi-step onboarding process:</p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-2">
                    <li><strong>Intentions & Role</strong> – Select reasons for joining (e.g., learning, finding collaborators, investing).</li>
                    <li><strong>Mystical profile</strong> – Optionally describe your mystical or spiritual identifiers.</li>
                    <li><strong>Region & Availability</strong> – Enter your city and choose meeting preferences.</li>
                    <li><strong>Values</strong> – Choose values that reflect what is important to you.</li>
                    <li><strong>Skills</strong> – Select or type in skills you can offer.</li>
                    <li><strong>Desires & Intentions</strong> – Indicate your goals such as Build a team, Find investors/partners, or Join a mission.</li>
                    <li><strong>Hopes & North Star</strong> – Choose long-term aspirations and specify a time horizon.</li>
                    <li><strong>Relationship preferences</strong> – Optional step for personal preferences.</li>
                    <li><strong>Final summary</strong> – Click Enter Command Deck to finish.</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Command Deck */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-violet-600" />
                The Command Deck (Dashboard)
              </h2>
              <p className="text-slate-600 mb-3">
                The Command Deck is your mission control centre where you monitor progress and access all features. The top displays your username, current seeker rank, badges and trust score. Below this you'll see your GGG balance, Rank Points, followers and upcoming meetings.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Badges</strong> – Earn badges for achievements. Hover over a badge for details.</li>
                <li>• <strong>GGG & Rank Panel</strong> – Shows your current GGG balance and the amount required for the next rank.</li>
                <li>• <strong>Online Now</strong> – Displays the number of users currently online.</li>
                <li>• <strong>Users & Regions</strong> – Breaks down users by region.</li>
                <li>• <strong>Activity Cards</strong> – Quick-launch cards for common tasks.</li>
              </ul>
            </section>

            {/* Matches */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Matches – The Synchronicity Engine
              </h2>
              <p className="text-slate-600 mb-3">
                The Matches page uses AI to suggest people whose values, skills and intentions align with yours.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Search or filter</strong> – Use the search bar to find specific people or filter by values, practices and proximity.</li>
                <li>• <strong>Sort</strong> – Change the sort order to Match score or another criterion.</li>
                <li>• <strong>Generate AI Matches</strong> – Click for a fresh set of personalised matches.</li>
                <li>• <strong>Tabs</strong> – Filter matches by People, Offers, Missions, Events, Teachers or Dating.</li>
              </ul>
            </section>

            {/* Meetings */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-violet-600" />
                Meetings & Connections
              </h2>
              <p className="text-slate-600 mb-3">
                The Meetings page helps you schedule, join and manage virtual or in-person meetings.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Request Meeting</strong> – Open a form to select a person, choose a session type, set a date/time and add a note.</li>
                <li>• <strong>Meeting Tabs</strong> – Use Pending, Upcoming and Completed tabs to view meetings.</li>
                <li>• <strong>Meeting cards</strong> – Each card shows title, participants, date/time, duration and buttons to Join or Reschedule.</li>
                <li>• <strong>Completed meetings</strong> – Verifying a meeting may award you additional GGG.</li>
              </ul>
            </section>

            {/* Missions */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600" />
                Missions & Quests
              </h2>
              <p className="text-slate-600 mb-3">
                Missions are collaborative quests that earn GGG, rank points and boosts.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Active vs. Past</strong> – Toggle between Active and Past missions. Filter by type, region or leader.</li>
                <li>• <strong>Mission Cards</strong> – Display mission name, description, number of participants and progress.</li>
                <li>• <strong>View Mission</strong> – Click to see tasks, guidelines and the join button.</li>
                <li>• <strong>Create Mission</strong> – Users with permission can create new missions.</li>
                <li>• <strong>Earnings Matrix</strong> – Opens details about how GGG payouts work.</li>
              </ul>
            </section>

            {/* Projects */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-600" />
                Projects
              </h2>
              <p className="text-slate-600 mb-3">
                Projects provide a place to manage complex endeavours and collaborate with others.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• Top counters show Total, Approved, Pending and Drafts.</li>
                <li>• <strong>Add Project</strong> – Define a title, description, timeline, roles needed and tasks.</li>
                <li>• Use the search bar and status filter to locate specific projects.</li>
              </ul>
            </section>

            {/* Contact Network */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-violet-600" />
                Contact Network (CRM)
              </h2>
              <p className="text-slate-600 mb-3">
                SaintAgent includes a built-in CRM to manage your professional network.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Import or Add Contacts</strong> – Use Import CSV to upload a contact list or Add Contact to manually input someone.</li>
                <li>• <strong>Contribution Tier</strong> – Shows your level. Higher tiers unlock additional networking features.</li>
                <li>• <strong>Tabs</strong> – View My Contacts, Federated Network and Access Requests.</li>
                <li>• <strong>Search and Filter</strong> – Search contacts by name or filter by domain.</li>
              </ul>
            </section>

            {/* Activity Feed */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-600" />
                Activity Feed
              </h2>
              <p className="text-slate-600 mb-3">
                The Activity Feed aggregates updates from across SaintAgent: new marketplace listings, mission announcements, testimonials and reputation updates.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Category Tabs</strong> – Filter by Listings, Missions, Testimonials or Reputation.</li>
                <li>• If you're new, your feed may be empty. Buttons encourage you to browse the marketplace, explore missions, or find matches.</li>
              </ul>
            </section>

            {/* Collaborators */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Collaborators
              </h2>
              <p className="text-slate-600 mb-3">
                Use the Collaborators page to match people to your mission or project. Specify the mission, list required skills or roles and provide notes.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• SaintAgent suggests top collaborators based on your inputs.</li>
                <li>• Use this tool to quickly recruit team members for your projects or missions.</li>
              </ul>
            </section>

            {/* Marketplace */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-violet-600" />
                Marketplace
              </h2>
              <p className="text-slate-600 mb-3">
                The Marketplace is where you offer your skills, find mentors or purchase services.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Create Listing</strong> – Define a service or course with type, price, duration and meeting mode.</li>
                <li>• <strong>Listings Tabs</strong> – All Listings, Offers and Requests tabs.</li>
                <li>• <strong>Listing Cards</strong> – Display session type, price, description and provider profile.</li>
              </ul>
            </section>

            {/* Messages */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-violet-600" />
                Messages
              </h2>
              <p className="text-slate-600 mb-3">
                Messaging is built into SaintAgent, allowing private conversations and group chats.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>New Message / New Group</strong> – Start a one-on-one message or a group chat.</li>
                <li>• <strong>Search</strong> – Use the search bar to find messages by keyword.</li>
                <li>• <strong>Conversations list</strong> – Existing conversations appear with avatars, names and message previews.</li>
                <li>• <strong>Conversation view</strong> – Send text, attachments or emojis.</li>
              </ul>
            </section>

            {/* Additional Features */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                Additional Features
              </h2>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Quick Create</strong> – Opens shortcuts to create meetings, missions, projects or marketplace listings.</li>
                <li>• <strong>Presence & Availability</strong> – Shows your Rank Points and status (Online/Offline).</li>
                <li>• <strong>Top Leaders</strong> – A leaderboard section lists top community members by GGG earned.</li>
                <li>• <strong>Dark Mode</strong> – Toggle dark mode using the switch at the bottom of the sidebar.</li>
              </ul>
            </section>

            {/* Tips for Success */}
            <section className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Tips for Success</h2>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Engage regularly</strong> – The more you participate in missions, meetings and the marketplace, the more GGG and rank points you'll earn.</li>
                <li>• <strong>Complete your profile</strong> – Detailed skills and values improve the quality of AI matches and collaborations.</li>
                <li>• <strong>Respect the community</strong> – SaintAgent emphasises integrity and accountability. Uphold these values in interactions and contributions.</li>
              </ul>
              <p className="text-slate-700 mt-4 font-medium">
                SaintAgent's holistic approach combines networking, learning and purposeful work. By following this guide and exploring each section, you'll quickly become proficient at navigating the platform and contributing to its mission.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}