import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { matchText } from '@/components/dock/useDockDirectory';

export const mailBox = (email, sent) => ({ [sent ? 'from_user_id' : 'to_user_id']:email, deleted_for_user_ids:{$nin:[email]} });
export function useDockMail(user, visible, box, search = '', peer = '', conversation = '', group = false) {
  const email = user.email;
  const filters = box === 'thread' ? group ? {...mailBox(email,false),conversation_id:conversation} : { deleted_for_user_ids:{$nin:[email]}, ...(conversation && {conversation_id:conversation}), $or:[{from_user_id:email,to_user_id:peer},{from_user_id:peer,to_user_id:email}] } : box === 'recent' ? { deleted_for_user_ids:{$nin:[email]}, $or:[{from_user_id:email},{to_user_id:email}] } : { ...mailBox(email,box === 'sent'), ...(search && matchText(search,['content','from_name','to_name'])) };
  return useInfiniteQuery({ queryKey:['dock-mail',email,box,search,peer,conversation,group], enabled:visible, initialPageParam:undefined,
    queryFn:({pageParam}) => base44.entities.Message.filter(filters,{sort:'-created_date',limit:20,cursor:pageParam}), getNextPageParam:page => page.has_more ? page.next_cursor : undefined });
}
export function useDockMailUpdates(email, visible) {
  const client = useQueryClient();
  useEffect(() => {
    if (!visible) return;
    return base44.entities.Message.subscribe(event => {
      if (event.type === 'delete' || event.data?.from_user_id === email || event.data?.to_user_id === email) client.invalidateQueries({queryKey:['dock-mail',email]});
    });
  }, [client,email,visible]);
  return async () => {
    await Promise.all([['dock-mail',email],['messagesInbox',email],['messagesSent',email],['unreadMessages',email]].map(queryKey => client.invalidateQueries({queryKey})));
  };
}
export const mailboxRows = query => query.data?.pages.flatMap(page => page.items) ?? [];
export const messagePeer = (msg,email) => msg.from_user_id === email ? {id:msg.to_user_id,name:msg.to_name || msg.to_user_id,conversation:msg.conversation_id} : {id:msg.from_user_id,name:msg.from_name || msg.from_user_id,conversation:msg.conversation_id};
export const markDockRead = (email,filter) => base44.entities.Message.updateMany({...mailBox(email,false),is_read:{$ne:true},...filter},{$set:{is_read:true,read_at:new Date().toISOString()}});