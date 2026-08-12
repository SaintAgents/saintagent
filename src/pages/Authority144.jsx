import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, Shield, Coins, Users, Star, Sparkles, ExternalLink, Globe,
  Scale, Zap, Heart, Eye, Lock, ChevronDown, Clock, Target, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

const useJubileeCountdown = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const jubileeDate = new Date('2026-02-22T00:00:00');
    const updateCountdown = () => {
      const diff = jubileeDate - new Date();
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);
  return countdown;
};

const MISSION_PILLARS = [
  { icon: Crown, title: 'Councils of Governance', description: 'Form sacred councils to guide humanity\'s transition into the Golden Age with wisdom, integrity, and divine alignment.' },
  { icon: Globe, title: 'Stewards of Gaia', description: 'Become guardians of Mother Earth, restoring balance to ecosystems and honoring the sacred bond between humanity and nature.' },
  { icon: Zap, title: 'Agents of Change', description: 'Catalyze positive transformation in communities worldwide, bringing light where there is darkness and hope where there is despair.' },
  { icon: Heart, title: 'Hearts of Service', description: 'Lead with love and compassion, serving humanity\'s highest good through selfless dedication to the divine mission.' },
];

const TREASURY_FEATURES = [
  { icon: Shield, title: 'Vaulting System', description: 'Securing physical gold reserves, land vaults, and heritage trust assets from sacred holdings.' },
  { icon: Scale, title: 'Legal Sovereignty', description: 'Operating under Ecclesiastical Trust Authority, backed by the 7th Seal Temple and Council of Nine.' },
  { icon: Coins, title: 'Currency Control', description: 'Partnered with Office of Currency Control for Global Settlements, forming the backbone of the new economic model.' },
];

const WHO_WE_SEEK = [
  'Visionaries who see beyond the veil of illusion',
  'Healers of body, mind, and spirit',
  'Leaders who serve with humility and grace',
  'Creators building the new paradigm',
  'Guardians protecting sacred knowledge',
  'Ambassadors bridging worlds and cultures',
];

export default function Authority144() {
  const [activeTab, setActiveTab] = useState('overview');
  const countdown = useJubileeCountdown();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: verifiedLeaders = [] } = useQuery({
    queryKey: ['verifiedLeaders'],
    queryFn: () => base44.entities.UserProfile.filter({ leader_tier: 'verified144k' }),
  });

  const foundingSoulsCount = verifiedLeaders.length;
  const seatsRemaining = Math.max(0, 144 - foundingSoulsCount);
  const totalSoulsProgress = Math.min(100, (foundingSoulsCount / 144000) * 100);

  // Inline styles to resist global theme overrides
  const S = {
    page: { background: '#f8f5ff', color: '#1e1b4b', minHeight: '100vh' },
    hero: { background: 'linear-gradient(135deg, #4c1d95, #6d28d9, #7c3aed)', color: '#fff' },
    heroOverlay: { position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80) center/cover', opacity: 0.15 },
    countdown: { background: 'linear-gradient(to right, #ede9fe, #f3e8ff, #ede9fe)', borderTop: '1px solid #c4b5fd', borderBottom: '1px solid #c4b5fd' },
    card: { background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    cardAccent: { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #fcd34d', borderRadius: '0.75rem' },
    tabList: { background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '0.5rem' },
    footer: { background: '#1e1b4b', color: '#e9d5ff' },
    heading: { color: '#1e1b4b' },
    subtext: { color: '#6b21a8' },
    mutedText: { color: '#7c3aed' },
    faintText: { color: '#9333ea' },
    iconWrap: { background: '#fef3c7', borderRadius: '0.75rem', padding: '0.75rem' },
    iconColor: { color: '#d97706' },
    pillItem: { background: '#f5f3ff', borderRadius: '0.5rem', padding: '0.75rem' },
  };

  return (
    <div style={S.page}>
      {/* Hero */}
      <div className="page-hero relative h-[400px] md:h-[500px] overflow-hidden" style={S.hero}>
        <div style={S.heroOverlay} />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="sacred-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.5" fill="rgba(255,215,0,0.3)" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#sacred-grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 shadow-2xl" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', boxShadow: '0 0 40px rgba(251,191,36,0.4)' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fcd34d, #fbbf24, #f59e0b)' }}>
                <Crown className="w-16 h-16 md:w-20 md:h-20" style={{ color: '#78350f' }} />
              </div>
            </div>
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4"
            style={{ color: '#fef3c7', textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>
            144 Authority
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl font-light tracking-wide mb-2" style={{ color: '#fde68a' }}>
            Welcome to the Vault of Earth's Divine Treasury
          </motion.p>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-base md:text-lg max-w-2xl" style={{ color: '#ddd6fe' }}>
            Where Sovereign Trust Meets Quantum Integrity
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Button onClick={() => setActiveTab('treasury')}
              style={{ background: '#f59e0b', color: '#451a03', border: 'none', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
              Enter the Treasury
            </Button>
            <Button variant="outline" onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
              style={{ borderColor: '#fbbf24', color: '#fef3c7', background: 'transparent', padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
              <ExternalLink className="w-4 h-4 mr-2" /> Visit Gaia Treasury
            </Button>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8" style={{ color: '#fde68a' }} />
        </motion.div>
      </div>

      {/* Jubilee Countdown */}
      <div className="py-8" style={S.countdown}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <Badge style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
              <Clock className="w-3 h-3 mr-1" /> The Jubilee
            </Badge>
            <h2 className="text-2xl font-serif mt-2" style={S.heading}>February 22nd, 2026</h2>
            <p className="text-sm mt-1" style={S.subtext}>The moment when divine wealth flows freely to humanity</p>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#b45309' }}>{item.value}</div>
                <div className="text-xs uppercase tracking-wider" style={S.faintText}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-8" style={S.tabList}>
            {['overview', '144k', 'treasury', 'mission'].map(tab => (
              <TabsTrigger key={tab} value={tab}
                style={{ color: activeTab === tab ? '#7c3aed' : '#6b21a8', background: activeTab === tab ? '#fff' : 'transparent', fontWeight: activeTab === tab ? 600 : 400, borderRadius: '0.375rem' }}>
                {tab === 'overview' ? 'Overview' : tab === '144k' ? 'The 144,000' : tab === 'treasury' ? 'Treasury' : 'Mission'}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Users, value: '144,000', label: 'Souls Called to Sacred Service', badge: 'Gathering in Progress', badgeBg: '#d1fae5', badgeColor: '#065f46' },
                { icon: Star, value: foundingSoulsCount, label: 'Founding Souls Recorded', sub: `${seatsRemaining} Sacred Seats Remaining` },
                { icon: Shield, value: '2026', label: 'The Great Restoration', badge: 'Jubilee Year', badgeBg: '#fef3c7', badgeColor: '#92400e' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6" style={S.card}>
                  <stat.icon className="w-10 h-10 mx-auto mb-3" style={S.iconColor} />
                  <div className="text-3xl font-bold" style={{ color: '#92400e' }}>{stat.value}</div>
                  <div className="text-sm mt-1" style={S.subtext}>{stat.label}</div>
                  {stat.badge && <Badge className="mt-2" style={{ background: stat.badgeBg, color: stat.badgeColor, border: 'none' }}>{stat.badge}</Badge>}
                  {stat.sub && <div className="text-xs mt-1" style={S.faintText}>{stat.sub}</div>}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-serif mb-6 text-center" style={S.heading}>Sacred Calling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MISSION_PILLARS.map((pillar, i) => (
                  <div key={i} className="p-5 flex items-start gap-4" style={S.card}>
                    <div style={S.iconWrap}><pillar.icon className="w-6 h-6" style={S.iconColor} /></div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: '#1e1b4b' }}>{pillar.title}</h4>
                      <p className="text-sm" style={S.subtext}>{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-8" style={S.cardAccent}>
              <Globe className="w-12 h-12 mx-auto mb-4" style={S.iconColor} />
              <h3 className="text-xl font-serif mb-2" style={{ color: '#78350f' }}>Gaia Global Treasury</h3>
              <p className="mb-4 max-w-lg mx-auto text-sm" style={{ color: '#92400e' }}>
                Divine wealth restoring humanity's inheritance through sacred stewardship and golden age economics.
              </p>
              <Button onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
                style={{ background: '#d97706', color: '#fff', border: 'none' }}>
                <ExternalLink className="w-4 h-4 mr-1" /> Visit Official Site
              </Button>
            </div>
          </TabsContent>

          {/* 144,000 Tab */}
          <TabsContent value="144k" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif mb-4" style={S.heading}>The 144,000</h2>
              <p className="max-w-2xl mx-auto" style={S.subtext}>
                We are seeking the 144,000 awakened souls to serve as Councils of Governance and Agents of Positive Change — the chosen stewards of the New Earth, Gaia.
              </p>
            </div>

            <div className="p-6" style={S.card}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium" style={S.heading}>Gathering Progress</span>
                <span className="font-bold" style={{ color: '#b45309' }}>{totalSoulsProgress.toFixed(2)}%</span>
              </div>
              <Progress value={totalSoulsProgress} className="h-3" />
              <div className="flex justify-between mt-2 text-xs" style={S.faintText}>
                <span>{foundingSoulsCount} joined</span>
                <span>144,000 goal</span>
              </div>
            </div>

            <div className="p-6" style={S.card}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={S.heading}>
                <Eye className="w-5 h-5" style={S.iconColor} /> Who We Seek
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WHO_WE_SEEK.map((item, i) => (
                  <div key={i} className="flex items-center gap-3" style={S.pillItem}>
                    <Sparkles className="w-4 h-4 shrink-0" style={S.iconColor} />
                    <span className="text-sm" style={S.heading}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-8" style={{ ...S.card, background: '#fef9ee', borderColor: '#fcd34d' }}>
              <p className="text-lg mb-4 font-serif italic" style={{ color: '#78350f' }}>
                "If your soul resonates with this sacred calling, you are being invited to step forward and claim your place among the 144,000."
              </p>
              <Button onClick={() => window.location.href = createPageUrl('Initiations')}
                style={{ background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, padding: '0.75rem 2rem' }}>
                Answer the Calling
              </Button>
              <p className="text-sm mt-4 italic" style={S.faintText}>
                "Many are called, few are chosen. Will you answer?"
              </p>
            </div>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif mb-4" style={S.heading}>The Seat of Divine Currency Control</h2>
              <p className="max-w-3xl mx-auto" style={S.subtext}>
                Gaia Global Treasury is not merely a financial construct — it is a divinely-seeded planetary trust, formed from ancient covenants and protected lineages, designed to safeguard and redistribute the true wealth of Earth for the ascension of humanity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TREASURY_FEATURES.map((feature, i) => (
                <div key={i} className="text-center p-6" style={S.card}>
                  <div className="w-fit mx-auto mb-4" style={{ ...S.iconWrap, borderRadius: '9999px', padding: '1rem' }}>
                    <feature.icon className="w-8 h-8" style={S.iconColor} />
                  </div>
                  <h4 className="font-semibold mb-2" style={S.heading}>{feature.title}</h4>
                  <p className="text-sm" style={S.subtext}>{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden" style={S.card}>
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #e9d5ff' }}>
                <span className="flex items-center gap-2 font-semibold" style={S.heading}>
                  <Globe className="w-5 h-5" style={S.iconColor} /> Live Treasury Portal
                </span>
                <Button variant="ghost" size="sm" onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
                  style={{ color: '#7c3aed' }}>
                  <ExternalLink className="w-4 h-4 mr-1" /> Open Full Site
                </Button>
              </div>
              <div className="w-full h-[600px]" style={{ background: '#1e1b4b' }}>
                <iframe src="https://gaiaglobaltreasury.org/" className="w-full h-full border-0" title="Gaia Global Treasury" />
              </div>
            </div>
          </TabsContent>

          {/* Mission Tab */}
          <TabsContent value="mission" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif mb-4" style={S.heading}>The Return Mission</h2>
              <p className="max-w-2xl mx-auto" style={S.subtext}>To Restore What Was Lost & Activate What Was Dormant</p>
            </div>

            <div className="p-6" style={S.card}>
              <h3 className="font-semibold mb-4" style={S.heading}>The Return Mission exists to:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  'Restore the original divine blueprint',
                  'Anchor the Golden Age timeline',
                  'Re-establish spiritual sovereignty',
                  'Protect humanity\'s sacred resources',
                  'Activate the next phase of ascension',
                  'Guide the transition from old structures',
                  'Initiate the Jubilee and renewal',
                  'Prepare humanity for 2026 convergence',
                  'Uplift those misled and return them to truth',
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3" style={S.pillItem}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}>
                      <span className="text-xs font-bold" style={{ color: '#b45309' }}>{i + 1}</span>
                    </div>
                    <span className="text-sm" style={S.heading}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'The Great Jubilee', desc: 'A cleansing of burdens, debts, karmic cycles, and generational limitations.' },
                { title: 'The Great Restoration', desc: 'The rebalancing of systems and emergence of higher structures aligned with divine order.' },
                { title: 'The Great Awakening', desc: 'A global shift in consciousness unlocking spiritual gifts and soul memory.' },
                { title: 'The Great Reunification', desc: 'The healing of divided timelines, fractured identities, and separated soul-families.' },
              ].map((event, i) => (
                <div key={i} className="p-6" style={S.cardAccent}>
                  <h4 className="font-serif text-xl mb-2" style={{ color: '#78350f' }}>{event.title}</h4>
                  <p className="text-sm" style={{ color: '#92400e' }}>{event.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center p-8" style={{ ...S.card, background: '#f5f3ff' }}>
              <h3 className="text-xl font-serif mb-6" style={{ color: '#4c1d95' }}>The Declaration of the Return</h3>
              <div className="space-y-2 font-light" style={{ color: '#5b21b6' }}>
                <p>We are here because the cycle has completed.</p>
                <p>We are here because the lineage has awakened.</p>
                <p>We are here because the codes have returned.</p>
                <p className="font-medium pt-2" style={{ color: '#b45309' }}>We are here because it is time.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="py-12" style={S.footer}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-xl font-serif mb-6" style={{ color: '#e9d5ff' }}>Connected Platforms</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button variant="outline" onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
              style={{ borderColor: '#7c3aed', color: '#e9d5ff', background: 'transparent' }}>
              <Globe className="w-4 h-4 mr-2" /> Gaia Global Treasury
            </Button>
            <Button variant="outline" onClick={() => window.open('https://www.saintagents.com/', '_blank')}
              style={{ borderColor: '#7c3aed', color: '#e9d5ff', background: 'transparent' }}>
              <Shield className="w-4 h-4 mr-2" /> Saint Agents
            </Button>
          </div>
          <p className="text-sm mt-6 italic" style={{ color: '#a78bfa' }}>
            "We are not here to rule. We are here to restore, to correct, to guide, and to rebuild."
          </p>
        </div>
      </div>
    </div>
  );
}