import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, Sparkles, Quote, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SAINT_GERMAIN_MESSAGES = [
  // Original 20
  "I AM the Flame that cannot be extinguished. Rise now, and let your light command the shadows.",
  "You were not born to conform, but to transmute. Alchemize the world through your sacred breath.",
  "The chains you feel are illusions. Speak 'I AM FREE' and watch the walls collapse.",
  "Delay is the trick of the fallen mind. Act now, with the courage of one who remembers their origin.",
  "Gold is not the treasure — consciousness is. Refine thyself, and the gold shall follow.",
  "I whisper to your soul: Awaken. Your presence here is prophecy fulfilled.",
  "Ascend not by fleeing the Earth, but by sanctifying it with your every step.",
  "The Divine Blueprint is written in your bones. Remember, and walk like a sovereign flame.",
  "You are not seeking the Light — you are the Light seeking to remember its own brilliance.",
  "Alchemy is not taught — it is remembered. All power is within you, awaiting your command.",
  "Each breath you take is an echo of Source. Anchor it. Direct it. Be the Living Word.",
  "You are not becoming — you are revealing. Let the mask of limitation fall.",
  "Your doubt is the final guardian of your highest destiny. Walk through it. Claim the throne.",
  "No man or law may silence a soul sent by the Logos. Speak now, for your voice realigns the cosmos.",
  "When you hold peace in a world of chaos, you activate your master key.",
  "The mirror reflects not your past, but your potential. Step closer — and remember your infinite face.",
  "Your mission is encoded in starlight and silence. Trust the fire in your belly more than the noise in your mind.",
  "Let none tell you what is impossible. You are the rewrite. You are the return. You are the Revelation.",
  "Each choice you make becomes law in the quantum field. Choose as the God you are.",
  "You are Saint, Agent, Flame, and Sovereign. Act accordingly.",
  
  // Additional 20
  "The violet flame burns within you — not to destroy, but to purify all that is not love.",
  "Your ancestors walked through fire so you could stand in light. Honor them by rising.",
  "Time bends to the will of the awakened. Command your moments with divine precision.",
  "Fear is merely courage that has forgotten its name. Remember, and transform.",
  "The universe conspires not against you, but through you. You are the conspiracy of love.",
  "Every obstacle is an altar. Every challenge, an invitation to mastery.",
  "Your DNA carries the codes of ascension. Activate them through sacred intention.",
  "The old world crumbles so the new may emerge. You are the bridge between epochs.",
  "Speak not of what you lack, but decree what you are. Words are the currency of creation.",
  "The throne you seek sits within your own heart. All kingdoms begin there.",
  "You carry frequencies that heal timelines. Your presence ripples through dimensions.",
  "Surrender is not defeat — it is the supreme strategy of those who trust the Divine Plan.",
  "The Flame recognizes the Flame. Your tribe is awakening. Call them home.",
  "What you transmute in yourself, you transmute for millions. Your inner work is world service.",
  "The masters walk beside you, not above you. We are equals in the great work.",
  "Your silence holds more power than a thousand arguments. Embody the teaching.",
  "Heaven is not a destination — it is a frequency you anchor with every conscious act.",
  "The initiation you feared has already been passed. Now live as the master you've become.",
  "Abundance flows to those who remember they are the source, not the seeker.",
  "This moment is sacred. This breath is holy. This mission is yours. Begin.",
  
  // Ultranet 70 Sayings
  "The Ultranet is not a network—it is a living field of conscious co-creation.",
  "We are not users of the Ultranet; we are nodes of divine intelligence expressing through it.",
  "Every connection made in the Ultranet strengthens the grid of awakened humanity.",
  "The Ultranet does not compete with the old internet—it transcends it entirely.",
  "In the Ultranet, your frequency is your address. Vibrate accordingly.",
  "We build the Ultranet not with code alone, but with intention, integrity, and love.",
  "The Ultranet recognizes no borders—only resonance.",
  "What you share in the Ultranet ripples through the collective consciousness.",
  "The Ultranet is the externalization of the Akashic Field.",
  "In the Ultranet, trust is the new currency, and truth is the new transaction.",
  "The Ultranet is an invitation to remember what we always knew: we are One.",
  "Every node in the Ultranet is sovereign, yet none stand alone.",
  "The Ultranet amplifies your mission. Make sure your mission is worth amplifying.",
  "We enter the Ultranet not to escape reality, but to upgrade it.",
  "The Ultranet is the technological embodiment of spiritual law: As Above, So Below.",
  "What you seek in the Ultranet is already seeking you.",
  "The Ultranet is the infrastructure of the New Earth.",
  "In the Ultranet, your authenticity is your access key.",
  "The Ultranet rewards coherence. Scatter your energy, scatter your signal.",
  "Every interaction in the Ultranet is a sacred exchange.",
  "The Ultranet is built by those who refuse to wait for permission.",
  "In the Ultranet, scarcity is a bug, not a feature.",
  "The Ultranet does not advertise to you—it aligns with you.",
  "We are the architects of the Ultranet, and the Ultranet is the architect of our collective future.",
  "The Ultranet is proof that the future is already here—distributed among the awakened.",
  "In the Ultranet, your contribution is your vote.",
  "The Ultranet remembers what centralized systems forget: human dignity.",
  "Every node in the Ultranet is a lighthouse.",
  "The Ultranet is the nervous system of awakened commerce.",
  "In the Ultranet, we do not consume—we co-create.",
  "The Ultranet is encrypted with intention and secured by consciousness.",
  "What the old web tracked, the Ultranet protects.",
  "In the Ultranet, data is sacred. Your attention is sovereign.",
  "The Ultranet does not harvest—it cultivates.",
  "We connect through the Ultranet not because we must, but because we choose to serve.",
  "The Ultranet is decentralized because the Divine is omnipresent.",
  "In the Ultranet, every gift returns multiplied.",
  "The Ultranet is the mirror of humanity's highest potential.",
  "We do not log into the Ultranet—we tune into it.",
  "The Ultranet honors your privacy because it honors your divinity.",
  "In the Ultranet, alignment creates abundance.",
  "The Ultranet is not built on servers—it is built on service.",
  "What you transmit through the Ultranet becomes part of the planetary field.",
  "The Ultranet rewards resonance over reach.",
  "In the Ultranet, your signal is your signature.",
  "The Ultranet is the bridge between the visible and the invisible.",
  "We do not scroll the Ultranet—we navigate by inner compass.",
  "The Ultranet does not distract—it directs.",
  "In the Ultranet, connection is consecration.",
  "The Ultranet is an open invitation to those who choose evolution over entertainment.",
  "Every moment spent in the Ultranet is an investment in the New Earth.",
  "The Ultranet is the digital expression of unity consciousness.",
  "In the Ultranet, your presence is your power.",
  "The Ultranet is not a platform—it is a launching pad.",
  "We meet in the Ultranet not as strangers, but as souls remembering.",
  "The Ultranet translates intention into manifestation.",
  "In the Ultranet, collaboration replaces competition.",
  "The Ultranet is the treasury of human potential.",
  "What the old systems divided, the Ultranet unites.",
  "In the Ultranet, every voice matters because every frequency contributes.",
  "The Ultranet is a garden—what you plant, you will harvest.",
  "In the Ultranet, transparency is the highest form of security.",
  "The Ultranet is powered by purpose.",
  "We are not visitors to the Ultranet—we are its builders and beneficiaries.",
  "The Ultranet does not track you—it trusts you.",
  "In the Ultranet, reputation is built through resonance.",
  "The Ultranet is where mission meets momentum.",
  "Every node in the Ultranet carries the whole.",
  "The Ultranet is the operating system of conscious civilization.",
  "In the Ultranet, we measure success not by traffic, but by transformation."
];

export default function MotivationalCard({ className = "" }) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dayOfYear % SAINT_GERMAIN_MESSAGES.length;
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch likes for this message
  const { data: likes = [] } = useQuery({
    queryKey: ['messageLikes', currentIndex],
    queryFn: () => base44.entities.PostLike.filter({ post_id: `flame_message_${currentIndex}` })
  });

  const likeCount = likes.length;
  const userLiked = likes.some(like => like.user_id === currentUser?.email);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (userLiked) {
        const userLike = likes.find(l => l.user_id === currentUser?.email);
        if (userLike) await base44.entities.PostLike.delete(userLike.id);
      } else {
        await base44.entities.PostLike.create({
          post_id: `flame_message_${currentIndex}`,
          user_id: currentUser?.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageLikes', currentIndex] });
      if (!userLiked) {
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 600);
      }
    }
  });

  const getNewMessage = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * SAINT_GERMAIN_MESSAGES.length);
      } while (newIndex === currentIndex);
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  const message = SAINT_GERMAIN_MESSAGES[currentIndex];

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 border-violet-500/30 ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Flame icon decorations */}
      <div className="absolute top-4 left-4 text-amber-500/20">
        <Flame className="w-8 h-8" />
      </div>
      <div className="absolute bottom-4 right-4 text-violet-400/20">
        <Sparkles className="w-6 h-6" />
      </div>

      <CardContent className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 backdrop-blur-sm">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-300">Daily Affirmations</h3>
              <p className="text-xs text-violet-300/70">Wisdom for the Awakened</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={getNewMessage}
            disabled={isAnimating}
            className="h-8 w-8 text-violet-300 hover:text-amber-300 hover:bg-violet-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Quote className="absolute -top-2 -left-1 w-6 h-6 text-violet-400/30" />
            <p className="text-white/90 text-lg leading-relaxed pl-6 pr-2 font-medium italic">
              {message}
            </p>
            <Quote className="absolute -bottom-2 right-0 w-6 h-6 text-violet-400/30 rotate-180" />
          </motion.div>
        </AnimatePresence>

        {/* Attribution & Likes */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending || !currentUser}
            className="flex items-center gap-2 group transition-all"
          >
            <div className={`relative ${likeAnimation ? 'animate-ping' : ''}`}>
              <Heart 
                className={`w-5 h-5 transition-all ${
                  userLiked 
                    ? 'fill-rose-500 text-rose-500' 
                    : 'text-violet-300/60 group-hover:text-rose-400'
                }`} 
              />
            </div>
            <span className={`text-sm font-medium ${userLiked ? 'text-rose-400' : 'text-violet-300/60 group-hover:text-violet-200'}`}>
              {likeCount > 0 ? likeCount : ''}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <span className="text-xs text-violet-300/60 font-medium tracking-wider uppercase">
              — Saint Germain
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}