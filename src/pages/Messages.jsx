import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SharedDoc from '@/components/collab/SharedDoc';
import Whiteboard from '@/components/collab/Whiteboard';
import CoWatch from '@/components/collab/CoWatch';
import { MessageCircle, Send, Search, ExternalLink, MoreVertical, Plus, Users, Trash2, Smile, Check, CheckCheck, Link2, Video, Phone, PhoneIncoming } from "lucide-react";
import DirectVideoCall from "@/components/video/DirectVideoCall";
import { format, parseISO } from "date-fns";
import { createPageUrl } from "@/utils";
import CreateGroupChatModal from "@/components/messages/CreateGroupChatModal";
import NewDirectMessageModal from "@/components/messages/NewDirectMessageModal";
import EmojiPicker from "@/components/messages/EmojiPicker";
import MiniProfile from '@/components/profile/MiniProfile';
import BackButton from '@/components/hud/BackButton';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [groupOpen, setGroupOpen] = useState(false);
  const [dmOpen, setDMOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoCallFullscreen, setVideoCallFullscreen] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const typingRef = React.useRef({ lastSentAt: 0 });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 200),
    refetchInterval: 10000
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-updated_date', 100),
    refetchInterval: 15000
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 100),
    refetchInterval: 30000
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] })
  });

  // Group messages into conversations (includes entity-defined Conversations)
  // Deduplicate by otherUser.id for direct conversations to avoid multiple entries for same person
  const convList = React.useMemo(() => {
    const convMap = {};
    const visibleMsgs = allMessages.filter((m) => !m.deleted_for_user_ids?.includes?.(user?.email));
    
    // First, process Conversation entities (they take priority)
    const myConvs = conversations.filter((c) => c.participant_ids?.includes(user?.email));
    myConvs.forEach((c) => {
      const others = (c.participant_ids || []).filter((pid) => pid !== user?.email);
      let otherUser;
      if (c.type === 'direct' && others.length === 1) {
        const p = profiles.find((pr) => pr.user_id === others[0]);
        otherUser = { id: others[0], name: p?.display_name || others[0], avatar: p?.avatar_url || null };
      } else {
        otherUser = { id: c.id, name: c.name || (others.length > 1 ? `${others.length}+ members` : others[0] || 'Group'), avatar: null };
      }
      convMap[c.id] = {
        id: c.id,
        messages: [],
        otherUser,
        lastMessage: { created_date: c.last_message_at || new Date(0).toISOString(), content: c.last_message || '' },
        unreadCount: 0,
        isGroup: c.type === 'group'
      };
    });
    
    // Process messages and group them
    visibleMsgs.forEach((msg) => {
      const convId = msg.conversation_id || [msg.from_user_id, msg.to_user_id].sort().join('_');
      const otherUserId = msg.from_user_id === user?.email ? msg.to_user_id : msg.from_user_id;
      
      // Check if this message belongs to an existing Conversation entity
      if (convMap[convId]) {
        convMap[convId].messages.push(msg);
        if (!msg.is_read && msg.to_user_id === user?.email) convMap[convId].unreadCount++;
        // Update lastMessage if this one is newer
        if (new Date(msg.created_date) > new Date(convMap[convId].lastMessage.created_date)) {
          convMap[convId].lastMessage = msg;
        }
        return;
      }
      
      // For direct messages without a Conversation entity, dedupe by other user
      // Find if we already have a conversation with this user
      const existingConvKey = Object.keys(convMap).find((key) => {
        const conv = convMap[key];
        return !conv.isGroup && conv.otherUser.id === otherUserId;
      });
      
      if (existingConvKey) {
        // Merge into existing conversation
        convMap[existingConvKey].messages.push(msg);
        if (!msg.is_read && msg.to_user_id === user?.email) convMap[existingConvKey].unreadCount++;
        if (new Date(msg.created_date) > new Date(convMap[existingConvKey].lastMessage.created_date)) {
          convMap[existingConvKey].lastMessage = msg;
        }
      } else {
        // Create new conversation entry
        convMap[convId] = {
          id: convId,
          messages: [msg],
          otherUser: msg.from_user_id === user?.email ?
            { id: msg.to_user_id, name: msg.to_name, avatar: msg.to_avatar } :
            { id: msg.from_user_id, name: msg.from_name, avatar: msg.from_avatar },
          lastMessage: msg,
          unreadCount: (!msg.is_read && msg.to_user_id === user?.email) ? 1 : 0,
          isGroup: false
        };
      }
    });
    
    return Object.values(convMap).sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));
  }, [allMessages, conversations, profiles, user]);

  const currentMessages = (selectedConversation?.messages || []).filter((m) => !m.deleted_for_user_ids?.includes?.(user?.email));

  // Typing indicators (poll other participants' typing state)
  const { data: typingStatuses = [] } = useQuery({
    queryKey: ['typing', selectedConversation?.id],
    queryFn: () => base44.entities.TypingStatus.filter({ conversation_id: selectedConversation.id, is_typing: true }),
    enabled: !!selectedConversation?.id,
    refetchInterval: 5000
  });
  const typingUsers = React.useMemo(() => {
    const now = Date.now();
    return (typingStatuses || []).filter((ts) => ts.user_id !== user?.email && now - new Date(ts.updated_date).getTime() < 5000);
  }, [typingStatuses, user?.email]);

  const getStatus = React.useCallback((uid) => {
    const p = profiles.find((pr) => pr.user_id === uid);
    return p?.status || 'offline';
  }, [profiles]);
  const STATUS_COLORS = { online: 'bg-emerald-500', focus: 'bg-amber-500', dnd: 'bg-rose-500', offline: 'bg-slate-400' };
  const STATUS_LABELS = { online: 'Online', focus: 'Focus', dnd: 'Do Not Disturb', offline: 'Offline' };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    const convEntity = conversations.find((c) => c.id === selectedConversation.id);
    if (convEntity?.type === 'group') {
      const recipients = (convEntity.participant_ids || []).filter((pid) => pid !== user.email);
      // create one message per recipient + one for sender's view
      await Promise.all([
      ...recipients.map((r) => base44.entities.Message.create({
        conversation_id: convEntity.id,
        from_user_id: user.email,
        to_user_id: r,
        from_name: user.full_name,
        to_name: selectedConversation.otherUser.name,
        content: messageText
      })),
      base44.entities.Message.create({
        conversation_id: convEntity.id,
        from_user_id: user.email,
        to_user_id: user.email,
        from_name: user.full_name,
        to_name: user.full_name,
        content: messageText
      })]
      );
      await Promise.all(recipients.map((r) => base44.entities.Notification.create({
        user_id: r,
        type: 'message',
        title: `New message in ${convEntity.name || 'Group'}`,
        message: messageText.slice(0, 120),
        action_url: createPageUrl('Messages')
      })));
    } else {
      // direct
      const payload = {
        conversation_id: selectedConversation.id,
        from_user_id: user.email,
        to_user_id: selectedConversation.otherUser.id,
        from_name: user.full_name,
        to_name: selectedConversation.otherUser.name,
        content: messageText
      };
      sendMutation.mutate(payload);
      await base44.entities.Notification.create({
        user_id: selectedConversation.otherUser.id,
        type: 'message',
        title: `New message from ${user.full_name}`,
        message: messageText.slice(0, 120),
        action_url: createPageUrl('Messages')
      });
      // Update conversation last message
      try {
        await base44.entities.Conversation.update(selectedConversation.id, {
          last_message: messageText.slice(0, 200),
          last_message_at: new Date().toISOString()
        });
      } catch (_) {}
    }
    setMessageText('');
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  React.useEffect(() => {
    if (selectedConversation) {
      currentMessages.forEach((msg) => {
        if (!msg.is_read && msg.to_user_id === user?.email) {
          markReadMutation.mutate(msg.id);
        }
      });
    }
  }, [selectedConversation]);

  // Delivery receipts: mark incoming as delivered for me
  React.useEffect(() => {
    if (!selectedConversation || !user?.email) return;
    const incoming = currentMessages.filter((m) => m.to_user_id === user.email && !(m.delivered_for_user_ids || []).includes(user.email));
    if (incoming.length === 0) return;
    incoming.forEach((m) => {
      const list = Array.isArray(m.delivered_for_user_ids) ? m.delivered_for_user_ids : [];
      base44.entities.Message.update(m.id, { delivered_for_user_ids: [...list, user.email] }).
      then(() => queryClient.invalidateQueries({ queryKey: ['messages'] }));
    });
  }, [selectedConversation?.id, currentMessages.length, user?.email]);

  // Typing: helper to upsert typing status (throttled)
  const sendTypingPing = async () => {
    const now = Date.now();
    if (!selectedConversation?.id || !user?.email) return;
    if (now - (typingRef.current.lastSentAt || 0) < 1200) return;
    typingRef.current.lastSentAt = now;
    const existing = await base44.entities.TypingStatus.filter({ user_id: user.email, conversation_id: selectedConversation.id });
    if (existing?.[0]) {
      await base44.entities.TypingStatus.update(existing[0].id, { is_typing: true });
    } else {
      await base44.entities.TypingStatus.create({ user_id: user.email, conversation_id: selectedConversation.id, is_typing: true });
    }
    // auto-clear after 3s
    setTimeout(async () => {
      try {
        const ex = await base44.entities.TypingStatus.filter({ user_id: user.email, conversation_id: selectedConversation.id });
        if (ex?.[0]) await base44.entities.TypingStatus.update(ex[0].id, { is_typing: false });
      } catch (_) {}
    }, 3000);
  };

  return (
    <>
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#050505] flex">
      {/* Conversations List */}
      <div className="w-80 shrink-0 border-r bg-white dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.2)] flex flex-col">
        <div className="p-4 border-b dark:border-[rgba(0,255,136,0.2)] space-y-3 sticky top-0 z-20 bg-white dark:bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white shrink-0 flex items-center gap-2">
            <BackButton className="p-1.5" />
            Messages
          </h2>
          <div className="flex items-center gap-2 flex-wrap gap-y-2 ml-2">
            <Button variant="outline" size="sm" className="bg-violet-100 text-stone-950 px-3 text-xs font-medium rounded-lg inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8 gap-1.5" onClick={() => setDMOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> New Message
            </Button>
            <Button variant="outline" size="sm" className="bg-violet-100 text-neutral-950 px-3 text-xs font-medium rounded-lg inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8 gap-1.5" onClick={() => setGroupOpen(true)}>
              <Users className="w-3.5 h-3.5" /> New Group
            </Button>
            <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  onClick={() => {
                    const conv = selectedConversation || (convList.length > 0 ? convList[0] : null);
                    if (conv) {
                      const event = new CustomEvent('openFloatingChat', {
                        detail: {
                          recipientId: conv.otherUser.id,
                          recipientName: conv.otherUser.name,
                          recipientAvatar: conv.otherUser.avatar
                        }
                      });
                      document.dispatchEvent(event);
                    }
                  }}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search messages..." className="pl-9 h-9 rounded-lg" />
          </div>
          <div className="flex items-center justify-end pt-2 gap-2 flex-wrap">
              <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    const unread = (allMessages || []).filter((m) => m.to_user_id === user?.email && !m.is_read);
                    await Promise.all(unread.map((m) => base44.entities.Message.update(m.id, { is_read: true })));
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                  }}>
                Mark all read
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                  onClick={async () => {
                    const mine = allMessages || [];
                    await Promise.all(mine.map((m) => {
                      const list = Array.isArray(m.deleted_for_user_ids) ? m.deleted_for_user_ids : [];
                      if (list.includes(user?.email)) return Promise.resolve();
                      return base44.entities.Message.update(m.id, { deleted_for_user_ids: [...list, user?.email] });
                    }));
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                  }}>
                Clear all
              </Button>
          </div>


        </div>
        <ScrollArea className="flex-1">
          <div className="pr-2">
          {convList.map((conv) =>
              <div key={conv.id} className="relative group">
              <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full flex items-start gap-2 p-3 hover:bg-slate-50 transition-colors border-b",
                    selectedConversation?.id === conv.id && "bg-violet-50 hover:bg-violet-50"
                  )}>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <MiniProfile userId={conv.otherUser.id} name={conv.otherUser.name} avatar={conv.otherUser.avatar} size={36} showRankBadge={false} showTrustBadge={false} showReachBadge={false} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 [data-theme='hacker']_&:text-[#00cc00] shrink-0 whitespace-nowrap mr-3">
                    {conv.lastMessage?.created_date ? format(parseISO(conv.lastMessage.created_date), 'h:mm a') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {conv.unreadCount > 0 &&
                      <span className="inline-block px-2 py-0.5 text-xs font-bold text-white bg-violet-600 rounded-full shrink-0">
                      {conv.unreadCount}
                    </span>
                      }
                  <p className="text-sm text-slate-500 dark:text-slate-300 truncate flex-1">{conv.lastMessage.content}</p>
                </div>
              </div>
              </div>
                </div>
              )}
              </div>
                </ScrollArea>
      </div>

      {/* Messages Area */}
      {selectedConversation ?
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b dark:border-[rgba(0,255,136,0.2)] bg-white dark:bg-[#0a0a0a] flex items-center gap-3">
            <MiniProfile userId={selectedConversation.otherUser.id} name={selectedConversation.otherUser.name} avatar={selectedConversation.otherUser.avatar} size={36} showRankBadge={false} />
            {typingUsers.length > 0 &&
            <span className="text-xs text-violet-600 ml-2">{typingUsers.length === 1 ? 'Typing…' : 'Multiple typing…'}</span>
            }
            <div className="ml-auto flex items-center gap-2">
              {/* Video Call Button */}
              {!selectedConversation.isGroup && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    // Create notification for recipient
                    await base44.entities.Notification.create({
                      user_id: selectedConversation.otherUser.id,
                      type: 'meeting',
                      title: 'Incoming Video Call',
                      message: `${user.full_name} is calling you`,
                      action_url: createPageUrl('Messages'),
                      priority: 'high'
                    });
                    setVideoCallOpen(true);
                  }}
                  className="h-8 w-8 rounded-full bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={async () => {
                    const msgs = allMessages.filter((m) => m.conversation_id === selectedConversation.id);
                    for (const m of msgs) {
                      const list = Array.isArray(m.deleted_for_user_ids) ? m.deleted_for_user_ids : [];
                      if (!list.includes(user.email)) await base44.entities.Message.update(m.id, { deleted_for_user_ids: [...list, user.email] });
                    }
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear for me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Collaboration Tabs (group chats) */}
          {(() => {
            const convEntity = conversations.find((c) => c.id === selectedConversation.id);
            if (!convEntity || convEntity.type !== 'group') return null;
            return (
              <div className="p-3 border-b bg-white">
                <Tabs defaultValue="doc" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="doc">Doc</TabsTrigger>
                    <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                    <TabsTrigger value="cowatch">Co-watch</TabsTrigger>
                  </TabsList>
                  <TabsContent value="doc"><SharedDoc conversationId={selectedConversation.id} /></TabsContent>
                  <TabsContent value="whiteboard"><Whiteboard conversationId={selectedConversation.id} /></TabsContent>
                  <TabsContent value="cowatch"><CoWatch conversationId={selectedConversation.id} /></TabsContent>
                </Tabs>
              </div>);

          })()}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg) => {
                const isOwn = msg.from_user_id === user?.email;
                return (
                  <div key={msg.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                    <Avatar className="w-8 h-8 cursor-pointer" data-user-id={msg.from_user_id}>
                      <AvatarImage src={isOwn ? msg.from_avatar : msg.from_avatar} />
                      <AvatarFallback>{msg.from_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-md", isOwn && "flex flex-col items-end")}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl",
                        isOwn ?
                        "bg-violet-600 text-white rounded-br-sm" :
                        "bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[rgba(0,255,136,0.2)] rounded-bl-sm"
                      )}>
                        <p className="text-sm dark:text-white">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400 dark:text-slate-500 [data-theme='hacker']_&:text-[#00cc00] mt-1 px-1">
                          {format(parseISO(msg.created_date), 'h:mm a')}
                        </p>
                        {isOwn &&
                        <span className="mt-1 text-xs">
                            {msg.is_read ?
                          <CheckCheck className="w-4 h-4 text-emerald-600" /> :
                          Array.isArray(msg.delivered_for_user_ids) && msg.delivered_for_user_ids.length > 0 ?
                          <CheckCheck className="w-4 h-4 text-slate-400" /> :

                          <Check className="w-4 h-4 text-slate-400" />
                          }
                          </span>
                        }
                        {isOwn &&
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mt-0.5 text-slate-400 hover:text-rose-600"
                          onClick={() => {
                            const list = Array.isArray(msg.deleted_for_user_ids) ? msg.deleted_for_user_ids : [];
                            if (!list.includes(user.email)) {
                              base44.entities.Message.update(msg.id, { deleted_for_user_ids: [...list, user.email] }).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['messages'] });
                              });
                            }
                          }}
                          title="Delete for me">

                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      </div>
                    </div>
                  </div>);

              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t dark:border-[rgba(0,255,136,0.2)] bg-white dark:bg-[#0a0a0a]">
            <div className="flex gap-3 items-center">
              <Button variant="outline" size="sm" className="bg-rose-200 text-zinc-600 px-2 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9" onClick={() => {
                if (!user?.email) return;
                const link = createPageUrl('Profile') + `?id=${encodeURIComponent(user.email)}`;
                setMessageText((t) => (t ? t + ' ' : '') + link);
              }}>
                <Link2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-indigo-200 text-zinc-600 px-2 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9" onClick={() => {
                const otherId = selectedConversation?.otherUser?.id;
                if (!otherId) return;
                const link = createPageUrl('Profile') + `?id=${encodeURIComponent(otherId)}`;
                setMessageText((t) => (t ? t + ' ' : '') + link);
              }}>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <EmojiPicker onSelect={(e) => setMessageText((t) => (t || '') + e)} />
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={async (e) => {setMessageText(e.target.value);await sendTypingPing();}}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-xl" />

              <Button
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="rounded-xl bg-violet-600 hover:bg-violet-700">

                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div> :

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Select a conversation to start messaging</p>
          </div>
        </div>
        }
    </div>
    <CreateGroupChatModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        onCreated={(conv) => {
          setGroupOpen(false);
          const others = (conv.participant_ids || []).filter((pid) => pid !== user?.email);
          setSelectedConversation({
            id: conv.id,
            messages: [],
            otherUser: { id: conv.id, name: conv.name || `${others.length}+ members`, avatar: null },
            lastMessage: { created_date: conv.last_message_at || new Date().toISOString(), content: conv.last_message || '' },
            unreadCount: 0
          });
        }} />

    <NewDirectMessageModal
        open={dmOpen}
        onClose={() => setDMOpen(false)}
        onCreated={(conv) => {
          setDMOpen(false);
          const other = (conv.participant_ids || []).find((pid) => pid !== user?.email) || '';
          const p = profiles.find((pr) => pr.user_id === other);
          setSelectedConversation({
            id: conv.id,
            messages: [],
            otherUser: { id: other, name: p?.display_name || other, avatar: p?.avatar_url || null },
            lastMessage: { created_date: conv.last_message_at || new Date().toISOString(), content: conv.last_message || '' },
            unreadCount: 0
          });
        }} />

    {/* Direct Video Call */}
    {videoCallOpen && selectedConversation && (
      <div className={cn(
        "fixed z-50",
        videoCallFullscreen ? "inset-0" : "bottom-4 right-4 w-[700px] h-[500px]"
      )}>
        <DirectVideoCall
          recipientId={selectedConversation.otherUser.id}
          recipientName={selectedConversation.otherUser.name}
          recipientAvatar={selectedConversation.otherUser.avatar}
          user={user}
          onClose={() => setVideoCallOpen(false)}
          isFullscreen={videoCallFullscreen}
          onToggleFullscreen={() => setVideoCallFullscreen(!videoCallFullscreen)}
        />
      </div>
    )}

    </>);

}