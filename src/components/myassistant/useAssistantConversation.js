import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useAssistantConversation(userId, enabled) {
  const key = `sa-my-assistant:${userId}:conversation`;
  const [id, setId] = useState(() => { try { return localStorage.getItem(key); } catch { return null; } });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const conversation = useRef(null);
  const busy = useRef(false);
  useEffect(() => {
    if (!id || !enabled) return;
    let active = true, streamed = false;
    const unsubscribe = base44.agents.subscribeToConversation(id, data => {
      if (!active || !Array.isArray(data.messages)) return;
      streamed = true;
      setMessages(data.messages);
    });
    base44.agents.getConversation(id).then(data => {
      if (!active) return;
      conversation.current = data;
      if (!streamed) setMessages(data.messages || []);
    }).catch(() => { if (active) setError('Could not reopen this conversation. Retry or start a new chat.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; unsubscribe(); };
  }, [id, enabled, attempt]);
  async function send(text, page) {
    if (busy.current || loading || (id && !conversation.current)) return false;
    busy.current = true; setSending(true); setError('');
    try {
      if (!conversation.current) {
        const data = await base44.agents.createConversation({ agent_name: 'my_assistant', metadata: { name: 'My Assistant' } });
        conversation.current = data; setId(data.id);
        try { localStorage.setItem(key, data.id); } catch {}
      }
      const sent = await base44.agents.addMessage(conversation.current, { role: 'user', content: `[SaintAgent page: ${page}]\n${text}` });
      if (sent?.id) setMessages(previous => previous.some(message => message.id === sent.id) ? previous : [...previous, sent]);
      return true;
    } catch { setError('Could not send your message.'); return false; }
    finally { busy.current = false; setSending(false); }
  }
  function reset() {
    if (busy.current) return;
    try { localStorage.removeItem(key); } catch {}
    conversation.current = null; setId(null); setMessages([]); setError(''); setLoading(false);
  }
  return { id, messages, loading, sending, error, send, reset, retry: id && !conversation.current && error ? () => { setError(''); setLoading(true); setAttempt(n => n + 1); } : null };
}