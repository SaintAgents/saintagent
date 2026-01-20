import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Crown, 
  Shield, 
  Coins, 
  Users, 
  Star, 
  Sparkles, 
  ExternalLink, 
  Globe,
  Scale,
  Zap,
  Heart,
  Eye,
  Lock,
  ChevronDown,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';

// Jubilee countdown calculator
const useJubileeCountdown = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const jubileeDate = new Date('2026-02-22T00:00:00');
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = jubileeDate - now;
      
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

const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/authority_hero.jpg";

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
  const profile = profiles?.[0];

  // Count verified leaders
  const { data: verifiedLeaders = [] } = useQuery({
    queryKey: ['verifiedLeaders'],
    queryFn: () => base44.entities.UserProfile.filter({ leader_tier: 'verified144k' }),
  });

  const foundingSoulsCount = verifiedLeaders.length;
  const seatsRemaining = Math.max(0, 144 - foundingSoulsCount);
  const totalSoulsProgress = Math.min(100, (foundingSoulsCount / 144000) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {/* Mystical Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-800/80 to-indigo-900/90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80')] bg-cover bg-center opacity-30" />
        
        {/* Sacred Geometry Overlay */}
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
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {/* Golden Coin/Seal */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/50">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center">
                <div className="text-amber-900">
                  <Crown className="w-16 h-16 md:w-20 md:h-20" />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-amber-100 drop-shadow-2xl mb-4"
            style={{ textShadow: '0 0 40px rgba(251,191,36,0.5)' }}
          >
            144 Authority
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-amber-200/90 font-light tracking-wide mb-2"
          >
            Welcome to the Vault of Earth's Divine Treasury
          </motion.p>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-base md:text-lg text-purple-200/80 max-w-2xl"
          >
            Where Sovereign Trust Meets Quantum Integrity
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30"
              onClick={() => setActiveTab('treasury')}
            >
              Enter the Treasury
            </Button>
            <Button 
              variant="outline"
              className="border-amber-400/50 text-amber-200 hover:bg-amber-500/20 px-6 py-3 rounded-xl"
              onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Gaia Treasury
            </Button>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-amber-300/60" />
        </motion.div>
      </div>

      {/* Jubilee Countdown */}
      <div className="bg-gradient-to-r from-purple-900/50 via-violet-800/50 to-purple-900/50 border-y border-amber-500/30 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-2">
              <Clock className="w-3 h-3 mr-1" />
              The Jubilee
            </Badge>
            <h2 className="text-2xl font-serif text-amber-100">February 22nd, 2026</h2>
            <p className="text-purple-200/70 text-sm mt-1">The moment when divine wealth flows freely to humanity</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-lg">
                  {item.value}
                </div>
                <div className="text-xs text-purple-300/70 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-8 bg-purple-900/50 border border-purple-700/50">
            <TabsTrigger value="overview" className="text-purple-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="144k" className="text-purple-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              The 144,000
            </TabsTrigger>
            <TabsTrigger value="treasury" className="text-purple-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              Treasury
            </TabsTrigger>
            <TabsTrigger value="mission" className="text-purple-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              Mission
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-purple-700/50">
                <CardContent className="pt-6 text-center">
                  <Users className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-300">144,000</div>
                  <div className="text-purple-200/70 text-sm">Souls Called to Sacred Service</div>
                  <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Gathering in Progress
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-purple-700/50">
                <CardContent className="pt-6 text-center">
                  <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-300">{foundingSoulsCount}</div>
                  <div className="text-purple-200/70 text-sm">Founding Souls Recorded</div>
                  <div className="text-xs text-purple-300/50 mt-1">{seatsRemaining} Sacred Seats Remaining</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-purple-700/50">
                <CardContent className="pt-6 text-center">
                  <Shield className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-300">2026</div>
                  <div className="text-purple-200/70 text-sm">The Great Restoration</div>
                  <Badge className="mt-2 bg-amber-500/20 text-amber-300 border-amber-500/30">
                    Jubilee Year
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Mission Pillars */}
            <div>
              <h3 className="text-2xl font-serif text-amber-100 mb-6 text-center">Sacred Calling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MISSION_PILLARS.map((pillar, i) => (
                  <Card key={i} className="bg-purple-900/40 border-purple-700/30 hover:border-amber-500/50 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/20">
                          <pillar.icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-200 mb-1">{pillar.title}</h4>
                          <p className="text-sm text-purple-200/70">{pillar.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* External Link Card */}
            <Card className="bg-gradient-to-r from-amber-500/10 via-purple-900/40 to-amber-500/10 border-amber-500/30">
              <CardContent className="py-8 text-center">
                <Globe className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-serif text-amber-100 mb-2">Gaia Global Treasury</h3>
                <p className="text-purple-200/70 mb-4 max-w-lg mx-auto">
                  Divine wealth restoring humanity's inheritance through sacred stewardship and golden age economics.
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-amber-950 gap-2"
                  onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Official Site
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 144,000 Tab */}
          <TabsContent value="144k" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-amber-100 mb-4">The 144,000</h2>
              <p className="text-purple-200/80 max-w-2xl mx-auto">
                We are seeking the 144,000 awakened souls to serve as Councils of Governance and Agents of Positive Change — the chosen stewards of the New Earth, Gaia.
              </p>
            </div>

            {/* Progress */}
            <Card className="bg-purple-900/40 border-purple-700/30">
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-200 font-medium">Gathering Progress</span>
                  <span className="text-amber-400 font-bold">{totalSoulsProgress.toFixed(2)}%</span>
                </div>
                <Progress value={totalSoulsProgress} className="h-3 bg-purple-800/50" />
                <div className="flex justify-between mt-2 text-xs text-purple-300/60">
                  <span>{foundingSoulsCount} joined</span>
                  <span>144,000 goal</span>
                </div>
              </CardContent>
            </Card>

            {/* Who We Seek */}
            <Card className="bg-purple-900/40 border-purple-700/30">
              <CardHeader>
                <CardTitle className="text-amber-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  Who We Seek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {WHO_WE_SEEK.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-purple-800/30">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-purple-100 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-900/40 border border-amber-500/30">
              <p className="text-lg text-amber-200/90 mb-4 font-serif italic">
                "If your soul resonates with this sacred calling, you are being invited to step forward and claim your place among the 144,000."
              </p>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold px-8 py-3"
                onClick={() => window.location.href = createPageUrl('Initiations')}
              >
                Answer the Calling
              </Button>
              <p className="text-purple-300/60 text-sm mt-4 italic">
                "Many are called, few are chosen. Will you answer?"
              </p>
            </div>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-amber-100 mb-4">The Seat of Divine Currency Control</h2>
              <p className="text-purple-200/80 max-w-3xl mx-auto">
                Gaia Global Treasury is not merely a financial construct — it is a divinely-seeded planetary trust, formed from ancient covenants and protected lineages, designed to safeguard and redistribute the true wealth of Earth for the ascension of humanity.
              </p>
            </div>

            {/* Treasury Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TREASURY_FEATURES.map((feature, i) => (
                <Card key={i} className="bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-purple-700/50 hover:border-amber-500/50 transition-all">
                  <CardContent className="pt-6 text-center">
                    <div className="p-4 rounded-full bg-amber-500/20 w-fit mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="font-semibold text-amber-200 mb-2">{feature.title}</h4>
                    <p className="text-sm text-purple-200/70">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Iframe Embed */}
            <Card className="bg-purple-900/20 border-purple-700/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-amber-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-400" />
                    Live Treasury Portal
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-amber-300 hover:text-amber-200"
                    onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Full Site
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full h-[600px] bg-purple-950">
                  <iframe
                    src="https://gaiaglobaltreasury.org/"
                    className="w-full h-full border-0"
                    title="Gaia Global Treasury"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mission Tab */}
          <TabsContent value="mission" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-amber-100 mb-4">The Return Mission</h2>
              <p className="text-purple-200/80 max-w-2xl mx-auto">
                To Restore What Was Lost & Activate What Was Dormant
              </p>
            </div>

            {/* Mission Points */}
            <Card className="bg-purple-900/40 border-purple-700/30">
              <CardHeader>
                <CardTitle className="text-amber-100">The Return Mission exists to:</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-purple-800/30">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-400">{i + 1}</span>
                      </div>
                      <span className="text-purple-100 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* The Great Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'The Great Jubilee', desc: 'A cleansing of burdens, debts, karmic cycles, and generational limitations.' },
                { title: 'The Great Restoration', desc: 'The rebalancing of systems and emergence of higher structures aligned with divine order.' },
                { title: 'The Great Awakening', desc: 'A global shift in consciousness unlocking spiritual gifts and soul memory.' },
                { title: 'The Great Reunification', desc: 'The healing of divided timelines, fractured identities, and separated soul-families.' },
              ].map((event, i) => (
                <Card key={i} className="bg-gradient-to-br from-amber-500/10 to-purple-900/40 border-amber-500/30">
                  <CardContent className="pt-6">
                    <h4 className="font-serif text-xl text-amber-200 mb-2">{event.title}</h4>
                    <p className="text-purple-200/70 text-sm">{event.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Declaration */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/60 to-violet-900/60 border border-purple-700/50">
              <h3 className="text-xl font-serif text-amber-200 mb-6">The Declaration of the Return</h3>
              <div className="space-y-2 text-purple-100/90 font-light">
                <p>We are here because the cycle has completed.</p>
                <p>We are here because the lineage has awakened.</p>
                <p>We are here because the codes have returned.</p>
                <p className="text-amber-300 font-medium pt-2">We are here because it is time.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Partner Sites Footer */}
      <div className="bg-purple-950/50 border-t border-purple-700/30 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-xl font-serif text-amber-100 mb-6">Connected Platforms</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button 
              variant="outline"
              className="border-amber-500/30 text-amber-200 hover:bg-amber-500/20"
              onClick={() => window.open('https://gaiaglobaltreasury.org/', '_blank')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Gaia Global Treasury
            </Button>
            <Button 
              variant="outline"
              className="border-violet-500/30 text-violet-200 hover:bg-violet-500/20"
              onClick={() => window.open('https://www.saintagents.com/', '_blank')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Saint Agents
            </Button>
          </div>
          <p className="text-purple-300/50 text-sm mt-6 italic">
            "We are not here to rule. We are here to restore, to correct, to guide, and to rebuild."
          </p>
        </div>
      </div>
    </div>
  );
}