import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, History, Wand2, Stars, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import OracleSelector from '@/components/oracle/OracleSelector';
import OracleReadingCard from '@/components/oracle/OracleReadingCard';
import OracleHistory from '@/components/oracle/OracleHistory';

const READING_TYPE_LABELS = {
  horoscope: 'Astral Chart', tarot: 'Tarot Pull', iching: 'I Ching',
  runes: 'Rune Cast', numerology: 'Numerology', oracle_cards: 'Oracle Cards',
};

function buildPrompt(readingType, focus, timeframe, profile) {
  const sign = profile?.astrological_sign || 'unknown';
  const rising = profile?.rising_sign;
  const moonSign = profile?.moon_sign;
  const lifePath = profile?.numerology_life_path;
  const destiny = profile?.numerology_destiny;
  const soulUrge = profile?.numerology_soul_urge;
  const enneagram = profile?.enneagram_type;
  const birthCard = profile?.birth_card;
  const birthCard2 = profile?.birth_card_2;
  const humanDesign = profile?.human_design_type;
  const mbti = profile?.mbti_type;
  const birthday = profile?.birthday;
  const displayName = profile?.display_name || 'Seeker';

  const profileBlock = [
    sign !== 'unknown' && `Sun sign: ${sign}`,
    rising && `Rising: ${rising}`,
    moonSign && `Moon: ${moonSign}`,
    lifePath && `Life Path: ${lifePath}`,
    destiny && `Destiny Number: ${destiny}`,
    soulUrge && `Soul Urge: ${soulUrge}`,
    enneagram && `Enneagram: ${enneagram}`,
    birthCard && `Tarot Birth Card: ${birthCard}${birthCard2 ? ` / ${birthCard2}` : ''}`,
    humanDesign && `Human Design: ${humanDesign}`,
    mbti && `MBTI: ${mbti}`,
    birthday && `Birthday: ${birthday}`,
  ].filter(Boolean).join('\n');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const focusMap = {
    general: 'overall life guidance and what energies are present',
    wealth: 'finances, abundance, material prosperity, investments, and wealth-building',
    love: 'romantic relationships, deep connections, intimacy, and heart matters',
    career: 'career path, professional growth, purpose alignment, and work dynamics',
    health: 'physical vitality, mental wellness, energy levels, and healing',
    spiritual: 'spiritual awakening, higher consciousness, meditation, and inner wisdom',
    creativity: 'creative expression, artistic flow, inspiration, and innovation',
    shadow: 'shadow work, unconscious patterns, fears to face, and inner transformation',
  };

  const timeframeMap = {
    daily: `today (${today})`,
    weekly: 'this week',
    monthly: 'this month',
    yearly: 'the year ahead',
  };

  const readingInstructions = {
    horoscope: `Deliver a deeply personal astrological reading using their natal placements. Reference specific planetary transits and aspects happening ${timeframeMap[timeframe]}. Include which houses are activated and what that means for their ${focusMap[focus]}. Use the language of astrology authentically.`,
    tarot: `Perform a 3-card tarot spread (Past Influence / Present Energy / Future Guidance) focused on ${focusMap[focus]} for ${timeframeMap[timeframe]}. Name each card pulled, describe its imagery, and weave a cohesive narrative connecting all three. Reference how the cards interact with their natal profile.`,
    iching: `Cast an I Ching hexagram reading for ${timeframeMap[timeframe]} focused on ${focusMap[focus]}. Name the hexagram number and title. Describe the primary and changing lines. Include the traditional Chinese wisdom alongside modern practical application. Reference how this hexagram relates to their spiritual profile.`,
    runes: `Cast a 3-rune spread (Situation / Challenge / Outcome) from the Elder Futhark for ${timeframeMap[timeframe]} focused on ${focusMap[focus]}. Name each rune, its traditional Norse meaning, and its phonetic value. Weave Norse mythology references into the interpretation. Connect to their profile energies.`,
    numerology: `Deliver a numerological reading for ${timeframeMap[timeframe]} focused on ${focusMap[focus]}. Calculate and interpret the personal day/month/year number. Cross-reference with their Life Path (${lifePath || 'unknown'}) and Destiny Number (${destiny || 'unknown'}). Include master numbers and karmic debt patterns if relevant.`,
    oracle_cards: `Pull 3 oracle cards for ${timeframeMap[timeframe]} focused on ${focusMap[focus]}. Give each card a unique mystical name and archetypal meaning. These should feel like channeled messages from higher guidance—warm, specific, and actionable. Weave their spiritual profile into the interpretation.`,
  };

  return `You are the Oracle of SaintAgent—an ancient, wise, deeply intuitive spiritual counselor who channels divine wisdom through ${READING_TYPE_LABELS[readingType] || 'mystical arts'}.

The seeker's name is ${displayName}. Here is their mystical profile:
${profileBlock || 'No mystical profile data available yet.'}

Today is ${today}.

${readingInstructions[readingType] || readingInstructions.horoscope}

CRITICAL GUIDELINES:
- Make it DEEPLY PERSONAL. Use their name. Reference their specific astrological placements, numerology, and archetypes throughout.
- This must feel like a one-on-one session with a master reader, NOT a generic horoscope.
- Include specific, actionable guidance they can apply ${timeframeMap[timeframe]}.
- Use a warm but authoritative tone—ancient wisdom meeting modern life.
- Structure with markdown: use ## for sections, **bold** for emphasis, > for key wisdom quotes, and --- for section breaks.
- Include a "Power Ritual" or "Sacred Practice" section at the end with a specific exercise they can do.
- Keep it substantive—at least 600 words. This should feel like a premium reading worth paying for.
- End with an empowering affirmation personalized to their energy.`;
}

export default function CelestialInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [readingType, setReadingType] = useState('horoscope');
  const [focus, setFocus] = useState('general');
  const [timeframe, setTimeframe] = useState('daily');
  const [currentReading, setCurrentReading] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('consult');

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.email }),
    enabled: !!user?.email,
    staleTime: 300000,
  });
  const profile = profiles?.[0];

  const { data: pastReadings = [] } = useQuery({
    queryKey: ['oracleReadings', user?.email],
    queryFn: () => base44.entities.OracleReading.filter({ user_id: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const handleGenerate = async () => {
    if (!user?.email) return;
    setIsGenerating(true);
    setActiveTab('consult');

    const prompt = buildPrompt(readingType, focus, timeframe, profile);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
      });

      const readingText = typeof result === 'string' ? result : result?.response || result?.text || JSON.stringify(result);

      setCurrentReading(readingText);

      // Save to entity
      await base44.entities.OracleReading.create({
        user_id: user.email,
        reading_type: readingType,
        focus,
        timeframe,
        reading: readingText,
        profile_context: {
          astrological_sign: profile?.astrological_sign,
          rising_sign: profile?.rising_sign,
          moon_sign: profile?.moon_sign,
          numerology_life_path: profile?.numerology_life_path,
          enneagram_type: profile?.enneagram_type,
          mbti_type: profile?.mbti_type,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['oracleReadings'] });
      toast.success('Your reading has been revealed ✨');
    } catch (err) {
      console.error('Oracle reading failed:', err);
      toast.error('The Oracle is momentarily veiled. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistorySelect = (reading) => {
    setCurrentReading(reading.reading);
    setReadingType(reading.reading_type);
    setFocus(reading.focus);
    setTimeframe(reading.timeframe);
    setActiveTab('consult');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-16 left-2/3 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse" style={{ animationDelay: '1.3s' }} />
        </div>
        <div className="hero-content relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-6 h-6 text-violet-300" />
            <Stars className="w-8 h-8 text-amber-300" />
            <Sun className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-heading">
            Celestial Insights
          </h1>
          <p className="text-violet-200 text-base md:text-lg max-w-2xl mx-auto">
            Ancient wisdom meets your unique cosmic blueprint. Choose your oracle, set your intention, and receive guidance that speaks directly to your soul.
          </p>
          {profile?.astrological_sign && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <Badge className="bg-white/10 text-violet-200 border-violet-400/30">☉ {profile.astrological_sign}</Badge>
              {profile.rising_sign && <Badge className="bg-white/10 text-violet-200 border-violet-400/30">↑ {profile.rising_sign}</Badge>}
              {profile.moon_sign && <Badge className="bg-white/10 text-violet-200 border-violet-400/30">☽ {profile.moon_sign}</Badge>}
              {profile.numerology_life_path && <Badge className="bg-white/10 text-violet-200 border-violet-400/30">LP {profile.numerology_life_path}</Badge>}
              {profile.enneagram_type && <Badge className="bg-white/10 text-violet-200 border-violet-400/30">E{profile.enneagram_type}</Badge>}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet-600" />
                  Configure Your Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <OracleSelector
                  readingType={readingType}
                  focus={focus}
                  timeframe={timeframe}
                  onReadingTypeChange={setReadingType}
                  onFocusChange={setFocus}
                  onTimeframeChange={setTimeframe}
                />
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12 text-base font-semibold"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Channeling the Oracle...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Reveal My Reading
                    </>
                  )}
                </Button>
                {!profile?.astrological_sign && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg text-center">
                    💡 Add your birthday & signs in your Profile → Spiritual tab for personalized readings
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Reading / History */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="consult" className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Current Reading
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <History className="w-3.5 h-3.5" /> Past Readings
                  {pastReadings.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{pastReadings.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="consult">
                {isGenerating ? (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="absolute -inset-2 rounded-full border-2 border-violet-300 animate-ping opacity-30" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">The Oracle is Speaking...</h3>
                      <p className="text-slate-500">Channeling celestial wisdom through the {READING_TYPE_LABELS[readingType] || 'stars'}</p>
                    </CardContent>
                  </Card>
                ) : currentReading ? (
                  <OracleReadingCard
                    reading={currentReading}
                    readingType={readingType}
                    focus={focus}
                    timeframe={timeframe}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <div className="text-5xl mb-4">🔮</div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Your Oracle</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Select a reading type, focus area, and timeframe, then tap "Reveal My Reading" to receive your personalized celestial guidance.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Your Reading Archive
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OracleHistory readings={pastReadings} onSelect={handleHistorySelect} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}