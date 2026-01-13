import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Radio, Send, Sparkles, Eye, Clock, Check, CheckCheck, 
  Zap, Heart, Star, Flame, Lock, Unlock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Telepathic message types with different frequencies
const MESSAGE_FREQUENCIES = {
  standard: { 
    label: 'Standard', 
    icon: Radio, 
    color: 'slate',
    description: 'Normal consciousness transmission'
  },
  heart: { 
    label: 'Heart Resonance', 
    icon: Heart, 
    color: 'rose',
    description: 'Transmitted from the heart center'
  },
  vision: { 
    label: 'Vision Download', 
    icon: Eye, 
    color: 'violet',
    description: 'Visual/intuitive transmission'
  },
  flame: { 
    label: 'Flame Transmission', 
    icon: Flame, 
    color: 'amber',
    description: 'High frequency sacred message'
  },
  star: { 
    label: 'Star Seed', 
    icon: Star, 
    color: 'cyan',
    description: 'Cosmic origin transmission'
  }
};

// Single telepathic message component
function TelepathicMessage({ message, isOwn, senderProfile }) {
  const frequency = MESSAGE_FREQUENCIES[message.frequency || 'standard'];
  const FreqIcon = frequency.icon;
  
  const colorStyles = {
    slate: 'border-slate-500/30 bg-slate-500/10',
    rose: 'border-rose-500/30 bg-rose-500/10',
    violet: 'border-violet-500/30 bg-violet-500/10',
    amber: 'border-amber-500/30 bg-amber-500/10',
    cyan: 'border-cyan-500/30 bg-cyan-500/10'
  };
  
  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn && "flex-row-reverse"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={senderProfile?.avatar_url} />
        <AvatarFallback className="bg-violet-500/20 text-violet-400 text-xs">
          {senderProfile?.display_name?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "max-w-[75%] rounded-2xl p-3 border",
        colorStyles[frequency.color],
        isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <FreqIcon className={cn(
            "w-3 h-3",
            frequency.color === 'slate' && "text-slate-400",
            frequency.color === 'rose' && "text-rose-400",
            frequency.color === 'violet' && "text-violet-400",
            frequency.color === 'amber' && "text-amber-400",
            frequency.color === 'cyan' && "text-cyan-400"
          )} />
          <span className="text-[10px] text-slate-500">{frequency.label}</span>
        </div>
        
        <p className="text-sm text-slate-200 whitespace-pre-wrap">{message.content}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-500">
            {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
          </span>
          {isOwn && (
            <div className="flex items-center gap-1">
              {message.is_read ? (
                <CheckCheck className="w-3 h-3 text-violet-400" />
              ) : (
                <Check className="w-3 h-3 text-slate-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Telepathic Channel component
export default function TelepathicChannel({ recipientId, recipientProfile, currentUser, currentProfile }) {
  const [content, setContent] = useState('');
  const [frequency, setFrequency] = useState('standard');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const queryClient = useQueryClient();
  
  // Generate channel ID (sorted to be consistent)
  const channelId = [currentUser?.email, recipientId].sort().join('_telepathic_');
  
  // Fetch telepathic messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['telepathicMessages', channelId],
    queryFn: async () => {
      const all = await base44.entities.Message.filter({ 
        conversation_id: channelId 
      }, '-created_date', 100);
      return all.reverse();
    },
    enabled: !!currentUser && !!recipientId,
    refetchInterval: 10000 // Poll every 10 seconds
  });
  
  // Send telepathic message
  const sendMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Message.create({
        conversation_id: channelId,
        from_user_id: currentUser.email,
        to_user_id: recipientId,
        from_name: currentProfile?.display_name || currentUser.full_name,
        from_avatar: currentProfile?.avatar_url,
        to_name: recipientProfile?.display_name,
        content: content,
        message_type: 'telepathic',
        icebreaker_prompt: frequency // Store frequency in icebreaker_prompt field
      });
    },
    onSuccess: () => {
      setContent('');
      setFrequency('standard');
      queryClient.invalidateQueries({ queryKey: ['telepathicMessages', channelId] });
    }
  });
  
  const handleSend = () => {
    if (!content.trim()) return;
    sendMutation.mutate();
  };
  
  const currentFreq = MESSAGE_FREQUENCIES[frequency];
  const FreqIcon = currentFreq.icon;
  
  return (
    <Card className="bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-violet-400 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-white text-base flex items-center gap-2">
                Telepathic Channel
                <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                  ULTRANET
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Asynchronous consciousness transmission with {recipientProfile?.display_name}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-3 mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-violet-400/50 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No transmissions yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Send your first telepathic message
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <TelepathicMessage
                key={msg.id}
                message={{
                  ...msg,
                  frequency: msg.icebreaker_prompt || 'standard'
                }}
                isOwn={msg.from_user_id === currentUser?.email}
                senderProfile={msg.from_user_id === currentUser?.email ? currentProfile : recipientProfile}
              />
            ))
          )}
        </ScrollArea>
        
        {/* Frequency Picker */}
        {showFrequencyPicker && (
          <div className="mb-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Select Transmission Frequency</p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(MESSAGE_FREQUENCIES).map(([key, freq]) => {
                const Icon = freq.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setFrequency(key);
                      setShowFrequencyPicker(false);
                    }}
                    className={cn(
                      "p-2 rounded-lg flex flex-col items-center gap-1 transition-all",
                      "hover:bg-slate-700/50 border",
                      frequency === key 
                        ? "border-violet-500 bg-violet-500/10" 
                        : "border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4",
                      freq.color === 'slate' && "text-slate-400",
                      freq.color === 'rose' && "text-rose-400",
                      freq.color === 'violet' && "text-violet-400",
                      freq.color === 'amber' && "text-amber-400",
                      freq.color === 'cyan' && "text-cyan-400"
                    )} />
                    <span className="text-[9px] text-slate-400">{freq.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Transmit your consciousness..."
            className="bg-slate-800/50 border-slate-700 text-white resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFrequencyPicker(!showFrequencyPicker)}
              className="gap-2 text-slate-400 hover:text-white"
            >
              <FreqIcon className={cn(
                "w-4 h-4",
                currentFreq.color === 'slate' && "text-slate-400",
                currentFreq.color === 'rose' && "text-rose-400",
                currentFreq.color === 'violet' && "text-violet-400",
                currentFreq.color === 'amber' && "text-amber-400",
                currentFreq.color === 'cyan' && "text-cyan-400"
              )} />
              <span className="text-xs">{currentFreq.label}</span>
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!content.trim() || sendMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {sendMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Transmit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact trigger button for opening telepathic channel
export function TelepathicChannelTrigger({ recipientProfile, onClick, className }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10",
        className
      )}
    >
      <Radio className="w-4 h-4 animate-pulse" />
      <span className="text-xs">Telepathic</span>
    </Button>
  );
}