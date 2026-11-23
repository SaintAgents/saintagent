import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

export default function AssistantMessages({ chat, greeting, onPrompt, voice, onSupport }) {
  const scroll = useRef(null);
  const follow = useRef(true);
  useEffect(() => { if (follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [chat.messages]);
  const messages = chat.messages.filter(message => !message.hidden && ['assistant', 'user'].includes(message.role) && typeof message.content === 'string' && message.content.trim());
  return <div ref={scroll} onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48; }} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm">
    {chat.loading && <p role="status">Opening your conversation…</p>}
    {!chat.loading && !messages.length && <div className="space-y-3">
      <p>{greeting || 'What would you like to accomplish?'}</p>
      <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => onPrompt('Help me plan my priorities today.')}>Plan my priorities</Button><Button size="sm" onClick={onSupport}>Get page help</Button><Button size="sm" onClick={() => onPrompt('Help me draft a message.')}>Draft a message</Button></div>
    </div>}
    {!chat.loading && !messages.length && <details><summary className="cursor-pointer">More ways to get help</summary><div className="mt-2 flex flex-wrap gap-2">{[['Planning', 'Help me break an objective into actionable steps.'], ['Research', 'Help me plan research for a project.'], ['Navigation', 'Which SaintAgent pages should I use to find projects and collaborators?']].map(([label, prompt]) => <Button size="sm" key={label} onClick={() => onPrompt(prompt)}>{label}</Button>)}</div></details>}
    {messages.map((message, index) => <article key={message.id || index} className={`max-w-full space-y-1 break-words border-l-2 pl-3 ${message.role === 'user' ? 'border-primary' : 'border-border'}`}>
      <strong>{message.role === 'user' ? 'You' : 'Assistant'}</strong>
      {message.role === 'user' ? <p className="whitespace-pre-wrap">{message.content.replace(/^\[SaintAgent page: [^\]]*\]\n/, '')}</p>
        : <><ReactMarkdown skipHtml components={{ img: () => null, pre: props => <pre className="overflow-x-auto" {...props} />, a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline" /> }}>{message.content}</ReactMarkdown>
        {voice.canSpeak && <Button size="sm" variant="ghost" onClick={() => voice.speak(message.content)}>Read aloud</Button>}</>}
    </article>)}
    {chat.sending && <p role="status">Sending…</p>}
    {chat.error && <p role="alert">{chat.error}</p>}
    {chat.retry && <Button size="sm" onClick={chat.retry}>Retry</Button>}
  </div>;
}