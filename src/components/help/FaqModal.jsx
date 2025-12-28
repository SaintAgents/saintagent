import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function FaqModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-600" />
            <DialogTitle>Saint Agents – FAQ</DialogTitle>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 py-4">
          <div className="prose prose-slate max-w-none text-sm">
            <h3>What is Saint Agents?</h3>
            <p>
              Saint Agents is a mission-based, GGG-powered ecosystem where you can offer services, complete missions,
              earn GGG, and build a trusted reputation. It combines a secure wallet, a mission/marketplace layer, and a
              transparent reputation + trust system.
            </p>

            <h3>How is Saint Agents different from a normal freelancer or gig platform?</h3>
            <p>Traditional platforms focus mostly on transactions. Saint Agents also tracks:</p>
            <ul>
              <li>Your GGG earnings (wallet balance)</li>
              <li>Your Reputation Score and Rank (how you show up)</li>
              <li>Your Trust Meter (0–100% trust signal)</li>
              <li>Your badges and roles (Mentor, Steward, Market Maker, etc.)</li>
            </ul>
            <p>It’s built to reflect integrity, alignment, and long-term contribution, not just volume.</p>

            <h3>What is GGG?</h3>
            <p>GGG is the internal currency/credit used on Saint Agents. You can:</p>
            <ul>
              <li>Earn GGG by completing missions, selling services, or receiving rewards</li>
              <li>Spend GGG on services, support, or access</li>
              <li>Use your GGG balance as a clean ledger of what you’ve contributed and received inside the ecosystem</li>
            </ul>

            <h3>What is my GGG Balance vs my Reputation?</h3>
            <ul>
              <li><strong>GGG Balance</strong> = your wallet amount (what you’ve earned/spent in GGG)</li>
              <li><strong>Reputation Score</strong> = how the system evaluates your behavior (reliability, integrity, contribution quality)</li>
            </ul>
            <p>
              You can have a high balance with low reputation, or high reputation with a modest balance. They’re separate but often related.
            </p>

            <h3>How does the Trust Meter (0–100%) work?</h3>
            <p>The Trust Meter shows how much the system trusts you based on:</p>
            <ul>
              <li>Integrity (honesty, honoring agreements)</li>
              <li>Competence (quality of work, follow-through)</li>
              <li>Consistency (behavior over time)</li>
              <li>Alignment (acting in line with the Saint ethos)</li>
            </ul>
            <p>Higher trust increases opportunities and access.</p>

            <h3>What are Reputation Ranks (Seeker, Wisdom Keeper, etc.)?</h3>
            <p>Reputation Ranks reflect your growth and reliability over time (e.g., Seeker up to higher tiers).</p>
            <p>Your Rank is based on your Reputation Score, not on how much GGG you’ve earned.</p>

            <h3>How do I raise my Reputation Rank and Trust Meter?</h3>
            <ul>
              <li>Complete missions on time and as promised</li>
              <li>Deliver high-quality, honest work</li>
              <li>Communicate clearly and respectfully</li>
              <li>Resolve issues fairly if something goes wrong</li>
              <li>Consistently align with the Saint Agents ethos (truth, service, long-term alignment)</li>
            </ul>

            <h3>What are badges and what do they signal?</h3>
            <p>Badges are visible signals of roles, achievements, or qualities. Examples include:</p>
            <ul>
              <li>Identity: Verified, Genesis, SoulBound, Flamewheel</li>
              <li>Marketplace: GGG Earner, Market Maker, Top Seller, Vault Trader</li>
              <li>Mission: Mentor of Light, Steward, Diplomat, Healer/Support, Cultivator</li>
              <li>Alignment: Light Verified, Grid Aligned, 144 Pathwalker, Star Seal, Sacred Flame</li>
            </ul>

            <h3>Are some badges permanent (non-transferable)?</h3>
            <p>
              Yes. Some badges are SoulBound, meaning they are bound to you, not transferable. Examples: SoulBound, Freuwäne,
              Sacred Flame, and certain alignment/initiation badges.
            </p>

            <h3>How do I start earning GGG?</h3>
            <ul>
              <li>Accept and complete missions</li>
              <li>List offers or services in the marketplace</li>
              <li>Receive tips or support</li>
              <li>Join programs or campaigns with rewards</li>
            </ul>

            <h3>Do I need to be “Verified” to use Saint Agents?</h3>
            <p>
              You can explore and start with basics without full verification, but higher-value missions, vault-tier access, and advanced badges usually require verification.
              Verification increases trust and access.
            </p>

            <h3>What is the Saint Agent ethos?</h3>
            <ul>
              <li>Truth over manipulation</li>
              <li>Service over extraction</li>
              <li>Long-term alignment over short-term gain</li>
            </ul>

            <h3>What happens if there’s a dispute or conflict?</h3>
            <p>
              Both sides can share their story; Diplomats/mediators may step in. Resolution aims to be fair, documented, and aligned with the ethos.
              Repeated serious violations can lower Reputation/Trust and remove access or badges.
            </p>

            <h3>Can I lose badges, trust, or reputation?</h3>
            <p>
              Yes. Reputation and Trust can go up or down. Some badges can be revoked for violations. SoulBound initiations are generally not revoked but may be flagged/dormant for serious misalignment.
            </p>

            <h3>Is my GGG wallet safe?</h3>
            <p>The system clearly tracks earnings, sources, and spending. Security and transparency are priorities. You should:</p>
            <ul>
              <li>Use strong passwords and secure devices</li>
              <li>Not share your login</li>
              <li>Report suspicious activity immediately</li>
            </ul>

            <h3>How do I become a Mentor, Steward, Diplomat, or other roles?</h3>
            <p>Build a strong track record, complete relevant missions, receive strong feedback, and meet any review or approval requirements.</p>

            <h3>Can I use Saint Agents just for earning, without spiritual/mission language?</h3>
            <p>Yes. You can use it as an aligned, reputation-aware marketplace. The deeper language is optional.</p>

            <h3>Who can I contact if I need help?</h3>
            <p>Check the in-app Help/FAQ, contact support at the official channel, or message a Steward/Mentor for guidance.</p>
          </div>
        </ScrollArea>
        <div className="px-6 pb-6 pt-2 flex justify-end border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}