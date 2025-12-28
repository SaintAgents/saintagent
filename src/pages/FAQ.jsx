import React from "react";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Help / FAQ</h1>
          <p className="text-slate-600 mt-1">Answers to the most common questions about Saint Agents</p>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-6 text-slate-800">
            <section>
              <h2 className="text-xl font-semibold">What is Saint Agents?</h2>
              <p className="mt-2 text-slate-600">
                Saint Agents is a mission-based, GGG-powered ecosystem where you can offer services, complete missions,
                earn GGG, and build a trusted reputation. It combines a secure wallet, a mission/marketplace layer, and a
                transparent reputation + trust system.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">How is Saint Agents different from a normal freelancer or gig platform?</h2>
              <p className="mt-2 text-slate-600">Traditional platforms focus mostly on transactions. Saint Agents also tracks:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Your GGG earnings (wallet balance)</li>
                <li>Your Reputation Score and Rank (how you show up)</li>
                <li>Your Trust Meter (0–100% trust signal)</li>
                <li>Your badges and roles (Mentor, Steward, Market Maker, etc.)</li>
              </ul>
              <p className="mt-2 text-slate-600">It’s built to reflect integrity, alignment, and long-term contribution, not just volume.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What is GGG?</h2>
              <p className="mt-2 text-slate-600">GGG is the internal currency/credit used on Saint Agents. You can:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Earn GGG by completing missions, selling services, or receiving rewards</li>
                <li>Spend GGG on services, support, or access</li>
                <li>Use your GGG balance as a clean ledger of what you’ve contributed and received inside the ecosystem</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What is my GGG Balance vs my Reputation?</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li><strong>GGG Balance</strong> = your wallet amount (what you’ve earned/spent in GGG)</li>
                <li><strong>Reputation Score</strong> = how the system evaluates your behavior (reliability, integrity, contribution quality)</li>
              </ul>
              <p className="mt-2 text-slate-600">
                You can have a high balance with low reputation, or high reputation with a modest balance. They’re separate but often related.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">How does the Trust Meter (0–100%) work?</h2>
              <p className="mt-2 text-slate-600">The Trust Meter reflects:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Integrity (honesty, honoring agreements)</li>
                <li>Competence (quality of work, follow-through)</li>
                <li>Consistency (behavior over time)</li>
                <li>Alignment (acting in line with the Saint ethos)</li>
              </ul>
              <p className="mt-2 text-slate-600">Higher trust increases opportunities and access.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What are Reputation Ranks?</h2>
              <p className="mt-2 text-slate-600">
                Reputation Ranks are tiers that show your growth and reliability over time (e.g., Seeker, Wisdom Keeper, up to Weaver of Balance).
                Your Rank is based on your Reputation Score, not on how much GGG you’ve earned.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">How do I raise my Reputation Rank and Trust Meter?</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Complete missions on time and as promised</li>
                <li>Deliver high-quality, honest work</li>
                <li>Communicate clearly and respectfully</li>
                <li>Resolve issues fairly if something goes wrong</li>
                <li>Consistently align with the Saint Agents ethos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What are badges and what do they signal?</h2>
              <p className="mt-2 text-slate-600">Badges are visible signals of specific roles, achievements, or qualities. Examples include:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Identity badges: Verified, Genesis, SoulBound, Flamewheel</li>
                <li>Marketplace badges: GGG Earner, Market Maker, Top Seller, Vault Trader</li>
                <li>Mission badges: Mentor of Light, Steward, Diplomat, Healer/Support, Cultivator</li>
                <li>Alignment badges: Light Verified, Grid Aligned, 144 Pathwalker, Star Seal, Sacred Flame</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Are some badges permanent (non-transferable)?</h2>
              <p className="mt-2 text-slate-600">
                Yes. Some badges are SoulBound, meaning they are bound to you (e.g., SoulBound, Freuwäne, Sacred Flame).
                They represent deep identity or initiation markers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">How do I start earning GGG?</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Accept and complete missions</li>
                <li>List offers or services in the marketplace</li>
                <li>Receive tips or support from other users</li>
                <li>Participate in programs, campaigns, or bonuses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Do I need to be “Verified” to use Saint Agents?</h2>
              <p className="mt-2 text-slate-600">
                You can explore without full verification, but higher-value missions, vault-tier access, and advanced badges usually require it.
                Becoming Verified increases trust and access and is recommended for deeper participation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What is the Saint Agent ethos?</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Truth over manipulation</li>
                <li>Service over extraction</li>
                <li>Long-term alignment over short-term gain</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What happens if there’s a dispute or conflict?</h2>
              <p className="mt-2 text-slate-600">When a dispute happens:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Both sides can share their story and evidence</li>
                <li>Mediators or Diplomats may step in</li>
                <li>A fair, documented resolution is sought</li>
              </ul>
              <p className="mt-2 text-slate-600">Repeated serious violations can lower Reputation and Trust, and may remove access or badges.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Can I lose badges, trust, or reputation?</h2>
              <p className="mt-2 text-slate-600">
                Yes. Reputation and Trust are dynamic. Some badges can be revoked for violations. SoulBound initiations are not revoked,
                but can be marked dormant or flagged if serious misalignment occurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Is my GGG wallet safe?</h2>
              <p className="mt-2 text-slate-600">The system is designed to clearly track earnings and spend. For security, you should:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Use strong passwords and secure devices</li>
                <li>Never share your login</li>
                <li>Report suspicious activity immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">How do I become a Mentor, Steward, Diplomat, or other roles?</h2>
              <p className="mt-2 text-slate-600">In general:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Build a strong track record (Reputation + Trust)</li>
                <li>Complete relevant missions</li>
                <li>Receive strong feedback</li>
                <li>Some roles require admin/council review</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Can I use Saint Agents just for earning, without the spiritual/mission language?</h2>
              <p className="mt-2 text-slate-600">
                Yes. You can treat it as a clean, reputation-aware marketplace for earning and offering services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Who can I contact if I need help?</h2>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-slate-600">
                <li>Check the in-app Help/FAQ section</li>
                <li>Contact support via the provided support channel</li>
                <li>Message a Steward or Mentor for guidance where available</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}