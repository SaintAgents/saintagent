import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function DockAssistantChat({ history = [], onSave }) {
  const [question, setQuestion] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const inFlight = useRef(false);
  async function send(event) {
    event.preventDefault();
    if (!question.trim() || inFlight.current) return;
    const messages = [...history.slice(-18), { role: 'user', text: question.trim() }];
    inFlight.current = true; setBusy(true); setError(false);
    try {
      const answer = await base44.integrations.Core.InvokeLLM({ prompt: `You are a lightweight chat helper with no access to private app records or tools. Reply concisely to the last user message. Conversation: ${JSON.stringify(messages)}` });
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('No reply returned');
      onSave([...messages, { role: 'assistant', text: answer.trim().slice(0, 2500) }]);
      setQuestion('');
    } catch { setError(true); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <form className="grid gap-2" onSubmit={send}>
    <div role="log" className="max-h-64 space-y-2 overflow-auto">{history.map(({ role, text }, index) => <p key={index} className="whitespace-pre-wrap break-words"><strong>{role === 'assistant' ? 'Assistant: ' : 'You: '}</strong>{text}</p>)}</div>
    {error && <p role="alert">Could not get a reply. Try again.</p>}
    <textarea aria-label="Ask the assistant" placeholder="Ask the assistant…" rows={2} maxLength={2000} value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} />
    <button disabled={busy || !question.trim()}>{busy ? 'Thinking…' : 'Send'}</button>
  </form>;
}