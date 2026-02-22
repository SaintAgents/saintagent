import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, ChevronUp, Scroll, FileText, Sparkles, 
  Heart, Users, Shield, Leaf, Globe, Scale, Eye, Coins, Database, Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1764794202628_7b25c685.png";

const ExpandableDocument = ({ title, subtitle, date, icon: Icon, children, defaultOpen = false }) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  
  return (
    <Card className="bg-slate-900/80 border-amber-500/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-start gap-4 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-serif text-amber-400">{title}</h3>
          {subtitle && <p className="text-amber-300/70 text-sm italic">{subtitle}</p>}
          {date && <p className="text-slate-400 text-sm mt-1">{date}</p>}
        </div>
        <div className="text-amber-400">
          {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-6 px-6 border-t border-amber-500/20">
          <div className="prose prose-invert prose-amber max-w-none text-slate-300">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function GaiaGlobalTreasurySiteClone() {
  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16">
      {/* Header */}
      <div className="text-center mb-16 px-6">
        <img 
          src={LOGO_IMAGE} 
          alt="Gaia Global Treasury" 
          className="w-24 h-24 mx-auto mb-6 rounded-full object-cover"
        />
        <h1 className="text-5xl md:text-6xl font-serif text-amber-400 mb-4">
          Gaia Global Treasury
        </h1>
        <div className="w-24 h-1 bg-amber-500 mx-auto mb-4" />
        <p className="text-xl text-slate-300">
          Where Sovereign Trust Meets Quantum Integrity
        </p>
      </div>

      {/* Sacred Charter Section */}
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-amber-400 mb-4">The Sacred Charter</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Before entering the Treasury, we invite you to read the foundational documents that 
            establish our divine mandate and sacred mission. These declarations represent our 
            covenant with humanity and the Earth.
          </p>
        </div>

        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mx-auto block w-fit mb-6">
          FOUNDATIONAL COVENANT
        </Badge>

        {/* Charter Document */}
        <ExpandableDocument
          title="Charter of the Gaia Global Treasury"
          subtitle="A Covenant of Stewardship for the Earth and Humanity"
          icon={Scroll}
          defaultOpen={true}
        >
          <div className="space-y-6">
            <section>
              <h4 className="text-amber-400 font-semibold mb-2">PREAMBLE</h4>
              <p>
                We, as conscious participants in the unfolding story of Earth, recognize that this 
                planet—Gaia—is not property to be owned, exploited, or divided, but a living system 
                entrusted to humanity for wise stewardship.
              </p>
              <p className="mt-3">
                We affirm that all natural resources—land, water, air, minerals, forests, oceans, 
                and the unseen energetic systems that sustain life—are sacred inheritances of the 
                whole human family and future generations yet unborn.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE I — Sacred Stewardship</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>The Earth is a living system, not a commodity.</li>
                <li>Humanity holds stewardship, not ownership, over natural resources.</li>
                <li>All extraction must be balanced by regeneration.</li>
                <li>No resource use shall irreversibly harm the planetary life-support systems.</li>
                <li>Decisions shall consider seven generations forward.</li>
              </ol>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE II — The Principle of Divine Balance</h4>
              <p>The Most High expresses through balance:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>✦ Masculine and feminine</li>
                <li>✦ Structure and compassion</li>
                <li>✦ Power and mercy</li>
                <li>✦ Justice and restoration</li>
              </ul>
              <p className="mt-3">All governance of resources must embody this balance.</p>
              <p className="mt-2">All decisions must be rooted in: Wisdom, Responsibility, Transparency, Service</p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE III — The Rights of Humanity</h4>
              <p>Every human being has the right to:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Clean water</li>
                <li>Nutritious food</li>
                <li>Clean air</li>
                <li>Shelter</li>
                <li>Energy access</li>
                <li>Participation in stewardship</li>
              </ol>
              <p className="mt-3">No system shall hoard what sustains life. Basic life-support resources shall never be weaponized.</p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE IV — The Rights of the Earth</h4>
              <p>The Earth itself has rights:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>The right to regenerate</li>
                <li>The right to biodiversity</li>
                <li>The right to unpolluted ecosystems</li>
                <li>The right to restoration where harmed</li>
              </ol>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE V — Governance Principles</h4>
              <p>The Gaia Global Treasury shall operate under these foundational commitments:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Transparency in accounting of resource flows</li>
                <li>Public reporting of environmental impact</li>
                <li>Independent oversight mechanisms</li>
                <li>Anti-corruption safeguards</li>
                <li>Ethical allocation standards</li>
                <li>Open access to non-sensitive stewardship data</li>
              </ol>
              <p className="mt-3 font-semibold">No authority is absolute. All power is accountable.</p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE VI — Regenerative Economics</h4>
              <p>The economic system aligned with this Charter shall:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>✦ Reward restoration over extraction</li>
                <li>✦ Incentivize circular systems</li>
                <li>✦ Prioritize renewable energy</li>
                <li>✦ Price in environmental impact</li>
                <li>✦ Penalize irreversible harm</li>
              </ul>
              <p className="mt-3 font-semibold">Profit shall never override planetary survival.</p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE VII — Intergenerational Covenant</h4>
              <p className="font-semibold">We acknowledge: We borrow the Earth from our children.</p>
              <p className="mt-2">All major resource decisions must include:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>✦ Long-term ecological modeling</li>
                <li>✦ Climate impact analysis</li>
                <li>✦ Water system preservation</li>
                <li>✦ Soil regeneration strategy</li>
              </ul>
              <p className="mt-3">The unborn shall be considered stakeholders.</p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE VIII — Unity of Humanity</h4>
              <p>This Charter recognizes:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>No nation owns the sky.</li>
                <li>No corporation owns the oceans.</li>
                <li>No generation owns the future.</li>
              </ul>
              <p className="mt-3">
                Humanity is one family, living on one planet, sustained by one biosphere.
                Collaboration must replace competition where survival resources are concerned.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE IX — Spiritual Foundation</h4>
              <p>The Most High—Father/Mother Source—manifests through:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>✦ Order in nature</li>
                <li>✦ Harmony in ecosystems</li>
                <li>✦ Reciprocity in life cycles</li>
                <li>✦ Sacred geometry in creation</li>
                <li>✦ Interdependence of all beings</li>
              </ul>
              <p className="mt-3">
                Stewardship must reflect these divine patterns.
                Dominion without wisdom is destruction.
                Authority without humility is corruption.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">ARTICLE X — Rules of the Road for Humanity</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Take only what can be replenished.</li>
                <li>Restore more than you consume.</li>
                <li>Share essential resources equitably.</li>
                <li>Protect biodiversity.</li>
                <li>Act transparently.</li>
                <li>Correct harm swiftly.</li>
                <li>Align technology with life.</li>
                <li>Honor indigenous wisdom.</li>
                <li>Safeguard water above all.</li>
                <li>Remember that future generations are watching through us.</li>
              </ol>
            </section>

            <section className="border-t border-amber-500/30 pt-6">
              <h4 className="text-amber-400 font-semibold mb-2">DECLARATION</h4>
              <p className="italic">
                This Charter does not seek domination. It seeks alignment.<br />
                It does not claim ownership of Earth's resources. It affirms responsibility for their protection.<br />
                It does not elevate an institution above humanity. It calls humanity upward into higher stewardship.
              </p>
              <p className="mt-4 text-amber-300">
                May wisdom guide governance.<br />
                May balance guide power.<br />
                May humility guide leadership.<br />
                May love guide action.<br />
                And may Earth flourish.
              </p>
            </section>
          </div>
        </ExpandableDocument>

        {/* Declaration of Sovereign Authority */}
        <ExpandableDocument
          title="Declaration of Sovereign Authority"
          date="October 2025"
          icon={FileText}
        >
          <p>
            Official proclamation of M1 authority under the Council of Nine Dragon Families.
          </p>
          <p className="mt-4">
            This declaration establishes the divine mandate of Gaia Global Treasury to operate as 
            the M1 authority, holding sovereign control over asset-backed currency issuance and 
            planetary wealth distribution.
          </p>
          <p className="mt-4">
            Under the protection of the 7th Seal Temple and Council of Nine oversight, this authority 
            supersedes all corporate and statutory claims to Earth's resources.
          </p>
          <p className="mt-4">
            We, the appointed stewards, hereby declare our sacred duty to manage, protect, and distribute 
            the wealth of nations in accordance with divine law and the principles of equity, justice, 
            and compassion for all sentient beings.
          </p>
          <p className="mt-4">
            This proclamation is sealed under ecclesiastical authority and recognized by the sovereign 
            trust structures that predate all modern corporate governance systems.
          </p>
        </ExpandableDocument>

        {/* Golden Age Economic Framework */}
        <ExpandableDocument
          title="Golden Age Economic Framework"
          date="September 2025"
          icon={Sparkles}
        >
          <p>Blueprint for transition from fiat to asset-backed divine economy.</p>
          <p className="mt-4">
            The Golden Age Economic Framework outlines the systematic transition from debt-based 
            fiat currency to gold-backed, spiritually-aligned financial systems.
          </p>
          <p className="mt-4">
            This framework ensures fair wealth distribution, elimination of usury, and restoration 
            of humanity's divine inheritance through quantum-sealed vaulting systems and 
            ecclesiastical trust structures.
          </p>
          <div className="mt-4 space-y-3">
            <p className="font-semibold text-amber-400">Key pillars of the framework include:</p>
            <div>
              <p className="font-semibold">• Asset-Backed Currency:</p>
              <p className="text-sm">All new currency issuance will be backed by tangible assets including gold, silver, platinum, and other precious resources held in sovereign vaults.</p>
            </div>
            <div>
              <p className="font-semibold">• Elimination of Usury:</p>
              <p className="text-sm">Interest-based lending will be replaced with equitable profit-sharing models that honor both lender and borrower.</p>
            </div>
            <div>
              <p className="font-semibold">• Quantum Financial System:</p>
              <p className="text-sm">A secure, transparent, and incorruptible digital ledger system that ensures accountability at every level of transaction.</p>
            </div>
            <div>
              <p className="font-semibold">• Universal Prosperity Funds:</p>
              <p className="text-sm">Dedicated allocations for every nation to ensure no community is left behind in the transition to the new economy.</p>
            </div>
          </div>
        </ExpandableDocument>

        {/* Humanitarian Covenant */}
        <ExpandableDocument
          title="Humanitarian Covenant"
          date="August 2025"
          icon={Heart}
        >
          <p>Sacred commitment to uplift the forgotten and marginalized.</p>
          <p className="mt-4">
            Through our 508(c)(1)(a) faith-based auxiliary, Gaia Global Treasury commits to channeling 
            divine abundance toward those most in need.
          </p>
          <p className="mt-4">
            This covenant ensures that wealth serves its highest purpose: feeding the hungry, 
            sheltering the homeless, uplifting single mothers, and restoring dignity to all who 
            have been cast aside by worldly systems.
          </p>
          <div className="mt-4 space-y-3">
            <p className="font-semibold text-amber-400">Our sacred commitments include:</p>
            <div>
              <p className="font-semibold">• Global Food Security:</p>
              <p className="text-sm">Establishing sustainable food distribution networks to eliminate hunger in every region of the world.</p>
            </div>
            <div>
              <p className="font-semibold">• Housing for All:</p>
              <p className="text-sm">Building dignified, sustainable housing communities for the displaced and homeless.</p>
            </div>
            <div>
              <p className="font-semibold">• Education & Empowerment:</p>
              <p className="text-sm">Creating free educational institutions that teach both practical skills and spiritual wisdom.</p>
            </div>
            <div>
              <p className="font-semibold">• Healthcare Access:</p>
              <p className="text-sm">Funding holistic healthcare centers that address body, mind, and spirit.</p>
            </div>
            <div>
              <p className="font-semibold">• Environmental Restoration:</p>
              <p className="text-sm">Dedicating resources to heal damaged ecosystems and protect sacred natural sites.</p>
            </div>
          </div>
          <p className="mt-4 italic text-amber-300">
            This covenant is not merely a document — it is a living promise, sealed in the hearts of those who serve.
          </p>
        </ExpandableDocument>

        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mx-auto block w-fit mb-6 mt-12">
          DIGITAL ASSET INFRASTRUCTURE
        </Badge>

        {/* Neo-NFT Framework */}
        <ExpandableDocument
          title="Neo-NFTs: The Sovereign Framework for Real-World Asset Digitization"
          subtitle="Non-Fungible Titles - From Speculative Tokens to Sovereign Instruments"
          icon={Gem}
        >
          <div className="space-y-6">
            <p>
              The Neo-NFT (Non-Fungible Title) ecosystem represents a fundamental shift from speculative digital tokens to sovereign-grade financial instruments. By bridging the gap between physical law and digital scarcity, Neo-NFTs provide a secure, transparent, and scalable architecture for global asset stewardship.
            </p>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">1. The Core Definition: From "Tokens" to "Titles"</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Non-Fungible Titles:</p>
                  <p className="text-sm">Unlike conventional NFTs, which often lack legal backing, Neo-NFTs are digital representations of Real-World Assets (RWAs). This includes land deeds, strategic mineral deposits, energy credits, and bullion.</p>
                </div>
                <div>
                  <p className="font-semibold">The Legal-Digital Merger:</p>
                  <p className="text-sm">The bridge between the physical asset and the digital token is "perfected" through UCC (Uniform Commercial Code) filings. This ensures the digital title is legally recognized as a binding record of ownership outside the digital space.</p>
                </div>
                <div>
                  <p className="font-semibold">Heritage & Provenance:</p>
                  <p className="text-sm">Every Neo-NFT carries an immutable audit trail within the StarChain archive, ensuring that ownership and value are verifiable for centuries.</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">2. Technical Architecture & Security</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">StarChain Integration:</p>
                  <p className="text-sm">Operating on a multi-dimensional L3 blockchain, Neo-NFTs utilize "digital twinning" to create a secure data encapsulation for physical objects.</p>
                </div>
                <div>
                  <p className="font-semibold">The Hybrid Bridge (ETH 1155):</p>
                  <p className="text-sm">During the current phase, the system utilizes the ERC-1155 standard to manage both fungible currency (GGG) and non-fungible titles within a single contract. This enables "Batch Transfers," allowing the instant delivery of a title and its settlement currency in a single, cost-efficient transaction.</p>
                </div>
                <div>
                  <p className="font-semibold">Military-Grade Infrastructure:</p>
                  <p className="text-sm">Built within a secure environment utilizing white-noise technology and lower-frequency communication to ensure private, incorruptible global transactions.</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">3. The G3Dex Market Ecosystem</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">The Global Digital Commodities Exchange (G3Dex):</p>
                  <p className="text-sm">A next-generation trading platform operating outside traditional BIS/IMF control. Neo-NFTs serve as the primary asset class for this exchange.</p>
                </div>
                <div>
                  <p className="font-semibold">GGG Settlement (Gaia Gold Gram):</p>
                  <p className="text-sm">To eliminate the volatility seen in standard crypto markets, all Neo-NFTs are priced and settled in GGG, a gold-backed currency.</p>
                </div>
                <div>
                  <p className="font-semibold">Intrinsic Floor Value:</p>
                  <p className="text-sm">Each Neo-NFT can be pegged to a specific amount of gold in the Gaia Global Treasury Repository (GGTR). As gold appreciates, the Neo-NFT inherits that value increase, providing a "gold-anchored" stability.</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">4. Global Impact & Stewardship</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Unlocking In-Ground Wealth:</p>
                  <p className="text-sm">Through geospatial scanning and AI modeling, nations can tokenize mineral reserves (gold veins, lithium fields) without premature extraction. This allows sovereign entities to access development capital while preserving the land.</p>
                </div>
                <div>
                  <p className="font-semibold">Ecological Preservation:</p>
                  <p className="text-sm">Strategic territories like the Amazon are brought into protected trust structures. Their value—trees, biodiversity, and carbon sinks—is tokenized as a sovereign asset, turning preservation into a form of economic stabilization.</p>
                </div>
                <div>
                  <p className="font-semibold">Financial Inclusion:</p>
                  <p className="text-sm">The system is designed for "Instant Delivery," providing the unbanked in remote areas with the ability to hold and trade resource-backed wealth via mobile devices and the GaiaPay system.</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">5. Key Applications</h4>
              <ul className="list-none space-y-1">
                <li>✦ <strong>Sovereign Instruments:</strong> Managing debt-forgiveness packages and credit guarantees.</li>
                <li>✦ <strong>Resource Rights:</strong> Tokenizing water rights, timber reserves, and energy credits.</li>
                <li>✦ <strong>Art & Culture:</strong> Digitizing works of heritage where the asset is tied to physical gold, making creators true custodians of value.</li>
                <li>✦ <strong>Real Estate:</strong> Moving land registry to a transparent, self-authenticating ledger.</li>
              </ul>
            </section>

            <section className="border-t border-amber-500/30 pt-6">
              <h4 className="text-amber-400 font-semibold mb-2">The Neo-NFT Philosophy</h4>
              <p className="italic text-amber-300 text-lg">
                "Wealth must be real, value must be sacred, and digital systems must serve humanity."
              </p>
              <p className="mt-4">
                By combining the permanence of physical resources with the flexibility of a global digital network, Neo-NFTs ensure that every asset contributes to long-term planetary stability, fairness, and economic modernization.
              </p>
            </section>
          </div>
        </ExpandableDocument>

        {/* GGTR Overview */}
        <ExpandableDocument
          title="The Gaia Global Treasury Repository (GGTR)"
          subtitle="Sovereign-Grade Reserve Architecture for Global Asset Stewardship"
          icon={Database}
        >
          <div className="space-y-6">
            <p>
              The Gaia Global Treasury Repository (GGTR) stands as the structural backbone of a new era in global asset stewardship. Designed as a sovereign-grade reserve architecture, GGTR integrates gold reserves, noble metals, rare earth elements, energy commodities, real estate, agricultural resources, and strategic mineral deposits into a unified, transparent registry.
            </p>
            
            <p>
              Unlike legacy reserve systems that rely on fragmented reporting and opaque custodianship, GGTR operates as a living ledger of verified global reserves — combining physical vault holdings with in-ground resource certifications. This creates a harmonized framework where tangible wealth is measured, validated, and responsibly activated.
            </p>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">G3Dex Integration</h4>
              <p>
                At the core of this ecosystem is G3Dex (Global Digital Commodity Exchange) — a next-generation trading and settlement platform with next level Neo-NFT (semi-fungible token - SFT) digital titles to physical resources, engineered to track, tokenize, and exchange commodity-backed instruments with precision.
              </p>
              <p className="mt-3">
                Through advanced geospatial scanning technologies, satellite spectral analysis, ground-penetrating radar, and AI-assisted geological modeling, in-ground collateral such as gold veins, lithium fields, copper deposits, rare earth mineral clusters, and energy reserves can be identified, quantified, and digitized into secure asset tokens.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">Noble Metals Foundation</h4>
              <p>
                The noble metals — gold, silver, platinum, palladium — remain foundational anchors within GGTR vaulting systems. These vaults are not merely storage facilities; they function as audited reserve nodes linked directly into G3Dex.
              </p>
              <p className="mt-3">
                Historic artifacts such as the Spanish gold coin symbolize the legacy of ungrounded or undisclosed vaults — wealth once hidden, displaced, or lost through centuries of conflict and secrecy. Within the new framework, such symbols represent reconciliation and restoration: bringing dormant or misallocated reserves back into transparent, accountable circulation.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">Strategic Commodities</h4>
              <p>
                Beyond precious metals, GGTR integrates strategic commodities including:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>✦ Rare earth elements essential for advanced technology</li>
                <li>✦ Battery metals such as lithium and cobalt</li>
                <li>✦ Copper for infrastructure</li>
                <li>✦ Freshwater rights</li>
                <li>✦ Timber reserves</li>
                <li>✦ Agricultural land values</li>
              </ul>
              <p className="mt-3">
                Each asset class can be measured, certified, and responsibly tokenized, allowing sovereign entities to establish credit facilities backed by verified in-ground wealth. Rather than forcing countries into extractive desperation, this model enables structured credit lines against reserves while preserving long-term ecological and economic balance.
              </p>
            </section>

            <section>
              <h4 className="text-amber-400 font-semibold mb-2">Stewardship & Preservation</h4>
              <p>
                Gaia Global's mandate extends beyond financial activation into stewardship. Strategic land acquisitions — including rainforest territories such as sections of the Amazon — are envisioned not for exploitation, but for preservation.
              </p>
              <p className="mt-3">
                By bringing such lands into protected trust structures, their ecological value becomes part of the reserve calculus. Trees, biodiversity, freshwater systems, and carbon sinks are treated as enduring assets rather than expendable resources. Preservation itself becomes a form of sovereign wealth stabilization.
              </p>
            </section>

            <section className="border-t border-amber-500/30 pt-6">
              <h4 className="text-amber-400 font-semibold mb-2">The Vision</h4>
              <p>
                Through GGTR and G3Dex, nations can tokenize in-ground wealth responsibly and gain access to development capital without surrendering sovereignty or overleveraging future generations.
              </p>
              <p className="mt-3">
                This architecture bridges natural abundance with structured liquidity, aligning environmental guardianship with economic modernization. The result is a system where reserves are no longer hidden, mismanaged, or extracted without balance — but measured, protected, and intelligently mobilized in service of long-term planetary stability.
              </p>
            </section>
          </div>
        </ExpandableDocument>

        {/* Leadership Section */}
        <div className="mt-16 text-center">
          <Badge className="bg-slate-700 text-slate-300 mb-4">Leadership</Badge>
          <h2 className="text-3xl font-serif text-amber-400 mb-4">
            Co-Founders of Gaia Global Treasury
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Two complementary minds united by a shared commitment to ethical stewardship, 
            financial integrity, and the future of humanity.
          </p>

          <div className="space-y-6">
            <Card className="bg-slate-900/80 border-amber-500/30 p-8 text-left">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-serif text-amber-400">MS</span>
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-amber-400 mb-1">Mathew Louis Schlueter</h3>
                  <p className="text-slate-400 mb-4">Co-Founder</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Visionary Architect</Badge>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Systems Strategist</Badge>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Spiritual-Economic Philosopher</Badge>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Mathew Louis Schlueter is a multidisciplinary systems thinker whose work bridges finance, 
                    technology, governance design, and spiritual philosophy. With over two decades of experience 
                    in high-level financial structuring, enterprise development, and systems architecture, he has 
                    cultivated a reputation for seeing large-scale structural patterns where others see fragmentation.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mt-3">
                    Beyond technical and financial architecture, Mathew is known for articulating a values-driven 
                    approach to resource management. He advocates for regenerative economics, planetary stewardship, 
                    and governance models that integrate long-term ecological balance with human prosperity.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-amber-500/30 p-8 text-left">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-serif text-amber-400">MC</span>
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-amber-400 mb-1">Marc Chagnon</h3>
                  <p className="text-slate-400 mb-4">Co-Founder</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Strategic Operations</Badge>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Global Development</Badge>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">Partnership Architecture</Badge>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Marc Chagnon brings decades of experience in strategic operations, international business development, 
                    and partnership architecture to Gaia Global Treasury. His expertise spans cross-border coordination, 
                    stakeholder alignment, and the practical implementation of complex financial structures.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mt-3">
                    Marc's approach combines pragmatic execution with ethical vision, ensuring that the Treasury's 
                    ambitious goals translate into real-world impact. He specializes in building bridges between 
                    diverse stakeholders—from sovereign entities to grassroots communities—fostering the collaborative 
                    networks essential for global stewardship.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Content sourced from GaiaGlobalTreasury.org</p>
          <Button 
            variant="outline" 
            className="mt-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            onClick={() => window.open('https://GaiaGlobalTreasury.org', '_blank')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Visit Official Website
          </Button>
        </div>
      </div>
    </div>
  );
}