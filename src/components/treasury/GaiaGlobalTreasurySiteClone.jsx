import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, ChevronUp, Scroll, FileText, Sparkles, 
  Heart, Users, Shield, Leaf, Globe, Scale, Eye
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