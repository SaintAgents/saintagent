import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Send, Sparkles, Lock, Unlock, Eye, 
  Clock, CheckCircle2, Circle, Wifi, Heart
} from 'lucide-react';
import { format } from 'date-fns';

// Telepathic messages are special async messages for verified connections
// They appear with a mystical UI and emphasize soul-level communication

export default function TelepathicChannel({ currentUserId, recipientId, recipientProfile }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  // Check if both users have high resonance (verified connection)
  const { data: currentProfile } = useQuery({
    queryKey: ['currentProfile', currentUserId],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUserId });
      return profiles?.[0];
    },
    enabled: !!currentUserId
  });

  // Get telepathic messages (messages with telepathic flag)
  const conversationId = [currentUserId, recipientId].sort().join('_telepathic_');
  
  const { data: messages = [] } = useQuery({
    queryKey: ['telepathicMessages', conversationId],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.filter({ 
        conversation_id: conversationId 
      }, '-created_date', 50);
      return allMessages;
    },
    enabled: !!currentUserId && !!recipientId
  });

  // Determine if channel is unlocked (both users have coherence 5+)
  const getCoherenceLevel = (profile) => {
    const rankScores = {
      seeker: 3, initiate: 5, adept: 6, practitioner: 7,
      master: 8, sage: 9, oracle: 9, ascended: 10, guardian: 10
    };
    return rankScores[profile?.rp_rank_code] || 3;
  };

  const myCoherence = getCoherenceLevel(currentProfile);
  const theirCoherence = getCoherenceLevel(recipientProfile);
  const isUnlocked = myCoherence >= 5 && theirCoherence >= 5;

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.Message.create({
        conversation_id: conversationId,
        from_user_id: currentUserId,
        to_user_id: recipientId,
        from_name: currentProfile?.display_name,
        from_avatar: currentProfile?.avatar_url,
        to_name: recipientProfile?.display_name,
        content: content,
        message_type: 'icebreaker', // Using icebreaker type for telepathic
        icebreaker_prompt: 'Telepathic Transmission'
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['telepathicMessages', conversationId]);
    }
  });

  const handleSend = async () => {
    if (!message.trim() || !isUnlocked) return;
    setSending(true);
    await sendMutation.mutateAsync(message);
    setSending(false);
  };

  if (!isUnlocked) {
    return (
      <Card className="bg-gradient-to-br from-violet-950/50 to-purple-950/30 border-violet-500/20">
        <CardContent className="py-8 text-center">
          <Lock className="w-12 h-12 text-violet-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-violet-200 mb-2">
            Telepathic Channel Locked
          </h3>
          <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
            This sacred channel opens when both souls reach Coherence Level 5 (Initiate rank or higher).
          </p>
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="text-center">
              <div className="text-slate-500">Your Coherence</div>
              <div className={cn(
                "font-bold text-lg",
                myCoherence >= 5 ? "text-emerald-400" : "text-amber-400"
              )}>
                {myCoherence}/10
              </div>
            </div>
            <Wifi className="w-5 h-5 text-violet-400/30" />
            <div className="text-center">
              <div className="text-slate-500">Their Coherence</div>
              <div className={cn(
                "font-bold text-lg",
                theirCoherence >= 5 ? "text-emerald-400" : "text-amber-400"
              )}>
                {theirCoherence}/10
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-950/50 to-purple-950/30 border-violet-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-violet-200 text-lg flex items-center gap-2">
                Telepathic Channel
                <Unlock className="w-4 h-4 text-emerald-400" />
              </CardTitle>
              <p className="text-xs text-violet-400/70">
                Soul-to-soul communication beyond words
              </p>
            </div>
          </div>
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40">
            <Sparkles className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-64 rounded-lg bg-black/30 p-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Eye className="w-8 h-8 text-violet-400/30 mx-auto mb-2" />
                <p className="text-sm text-violet-300/50">
                  The channel awaits your first transmission...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Speak from the heart. Words here carry frequency.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.from_user_id === currentUserId;
                return (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      isMe 
                        ? "bg-violet-600/30 border border-violet-500/30" 
                        : "bg-purple-900/30 border border-purple-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        <span className="text-xs text-violet-400/70">
                          {isMe ? 'You transmitted' : `${msg.from_name} transmitted`}
                        </span>
                      </div>
                      <p className="text-violet-100 text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <span className="text-[10px] text-slate-500">
                          {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                        </span>
                        {msg.is_read ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Transmit your thoughts through the Ultranet..."
            className="bg-black/30 border-violet-500/30 text-violet-100 placeholder:text-violet-400/40 min-h-[80px] resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-violet-400/50 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Messages here transcend ordinary communication
            </p>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <Send className="w-4 h-4" />
              Transmit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}