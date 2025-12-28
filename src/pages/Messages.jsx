import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Search, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100)
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

  // Group messages into conversations
  const conversations = React.useMemo(() => {
    const convMap = {};
    allMessages.forEach(msg => {
      const convId = msg.conversation_id || 
        [msg.from_user_id, msg.to_user_id].sort().join('_');
      if (!convMap[convId]) {
        convMap[convId] = {
          id: convId,
          messages: [],
          otherUser: msg.from_user_id === user?.email 
            ? { id: msg.to_user_id, name: msg.to_name, avatar: msg.to_avatar }
            : { id: msg.from_user_id, name: msg.from_name, avatar: msg.from_avatar },
          lastMessage: msg,
          unreadCount: 0
        };
      }
      convMap[convId].messages.push(msg);
      if (!msg.is_read && msg.to_user_id === user?.email) {
        convMap[convId].unreadCount++;
      }
    });
    return Object.values(convMap).sort((a, b) => 
      new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
  }, [allMessages, user]);

  const currentMessages = selectedConversation?.messages || [];

  const handleSend = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMutation.mutate({
      conversation_id: selectedConversation.id,
      from_user_id: user.email,
      to_user_id: selectedConversation.otherUser.id,
      from_name: user.full_name,
      to_name: selectedConversation.otherUser.name,
      content: messageText
    });
  };

  React.useEffect(() => {
    if (selectedConversation) {
      currentMessages.forEach(msg => {
        if (!msg.is_read && msg.to_user_id === user?.email) {
          markReadMutation.mutate(msg.id);
        }
      });
    }
  }, [selectedConversation]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* Conversations List */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Messages</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-lg"
              onClick={() => {
                if (selectedConversation) {
                  window.dispatchEvent(new CustomEvent('openFloatingChat', {
                    detail: {
                      recipientId: selectedConversation.otherUser.id,
                      recipientName: selectedConversation.otherUser.name,
                      recipientAvatar: selectedConversation.otherUser.avatar
                    }
                  }));
                } else if (conversations.length > 0) {
                  const firstConv = conversations[0];
                  window.dispatchEvent(new CustomEvent('openFloatingChat', {
                    detail: {
                      recipientId: firstConv.otherUser.id,
                      recipientName: firstConv.otherUser.name,
                      recipientAvatar: firstConv.otherUser.avatar
                    }
                  }));
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search messages..." className="pl-9 h-9 rounded-lg" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div key={conv.id} className="relative group">
              <button
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b",
                  selectedConversation?.id === conv.id && "bg-violet-50 hover:bg-violet-50"
                )}
              >
              <Avatar className="w-10 h-10">
                <AvatarImage src={conv.otherUser.avatar} />
                <AvatarFallback>{conv.otherUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-slate-900">{conv.otherUser.name}</p>
                  <p className="text-xs text-slate-400">
                    {format(parseISO(conv.lastMessage.created_date), 'h:mm a')}
                  </p>
                </div>
                <p className="text-sm text-slate-500 truncate">{conv.lastMessage.content}</p>
                {conv.unreadCount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold text-white bg-violet-600 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
                </div>
                </button>
                <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('openFloatingChat', {
                    detail: {
                      recipientId: conv.otherUser.id,
                      recipientName: conv.otherUser.name,
                      recipientAvatar: conv.otherUser.avatar
                    }
                  }));
                }}
                >
                <Plus className="w-4 h-4" />
                </Button>
                </div>
                ))}
                </ScrollArea>
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-white flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.otherUser.avatar} />
              <AvatarFallback>{selectedConversation.otherUser.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900">{selectedConversation.otherUser.name}</p>
              <p className="text-xs text-slate-500">Active now</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg) => {
                const isOwn = msg.from_user_id === user?.email;
                return (
                  <div key={msg.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={isOwn ? msg.from_avatar : msg.from_avatar} />
                      <AvatarFallback>{msg.from_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-md", isOwn && "flex flex-col items-end")}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl",
                        isOwn 
                          ? "bg-violet-600 text-white rounded-br-sm" 
                          : "bg-white border border-slate-200 rounded-bl-sm"
                      )}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 px-2">
                        {format(parseISO(msg.created_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-xl"
              />
              <Button 
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="rounded-xl bg-violet-600 hover:bg-violet-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}