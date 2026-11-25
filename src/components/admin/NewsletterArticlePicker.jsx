import React, { useRef, useState } from 'react';
import { BookOpen, CheckCircle, Copy, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import NewsletterReader from '@/components/admin/NewsletterReader';
import newsletterReadingText from '@/components/admin/newsletterReadingText';

function articleBody(article) {
  return [newsletterReadingText(article.summary), newsletterReadingText(article.content)].filter(Boolean).join('\n\n');
}

export default function NewsletterArticlePicker({ articles, loading, selected, onToggle }) {
  const [opened, setOpened] = useState(null);
  const triggerRef = useRef(null);
  const open = (article, trigger) => {
    triggerRef.current = trigger;
    setOpened({ subject: article.title || 'Untitled article', body_content: articleBody(article) });
  };
  async function copy(article, trigger) {
    try {
      const text = [article.title || 'Untitled article', articleBody(article)].filter(Boolean).join('\n\n');
      await navigator.clipboard.writeText(text);
      toast.success('Article copied');
    } catch {
      open(article, trigger);
      toast.error('Could not copy automatically. Select and copy the text in the reader.');
    }
  }

  return <div>
    <h3 id="newsletter-article-picker" className="mb-2 flex items-center gap-2 text-sm font-medium"><Newspaper className="size-4" aria-hidden="true" /> Select Articles to Include in Newsletter</h3>
    <div role="group" aria-labelledby="newsletter-article-picker" className="max-h-[200px] space-y-2 overflow-y-auto rounded-lg border p-3">
      {loading ? <p role="status" className="text-sm text-muted-foreground">Loading articles…</p> : articles.length === 0 ? <p className="text-sm text-muted-foreground">No articles available</p> : articles.slice(0, 20).map(article => {
        const active = selected.includes(article.id);
        return <div key={article.id} className={`flex items-center gap-1 rounded border p-1 ${active ? 'border-primary bg-accent' : 'border-transparent'}`}>
          <button type="button" aria-pressed={active} onClick={() => onToggle(article.id)} className="flex min-w-0 flex-1 items-start gap-3 rounded p-1 text-left focus-visible:ring-2 focus-visible:ring-ring">
            <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-input">{active && <CheckCircle className="size-4 text-primary" />}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-medium">{article.title}</span><span className="block truncate text-xs text-muted-foreground">{article.summary || 'No summary'}</span></span>
          </button>
          <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={`Open ${article.title || 'article'}`} title="Open article" onClick={event => open(article, event.currentTarget)}><BookOpen aria-hidden="true" /></Button>
          <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={`Copy ${article.title || 'article'}`} title="Copy article" onClick={event => void copy(article, event.currentTarget)}><Copy aria-hidden="true" /></Button>
        </div>;
      })}
    </div>
    {opened && <NewsletterReader campaign={opened} contentLabel="article" triggerRef={triggerRef} onClose={() => setOpened(null)} />}
  </div>;
}