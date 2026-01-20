import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ArrowRight, Video, Link as LinkIcon, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import NewsViewerModal from './NewsViewerModal';

export default function NewsCard() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const { data: articles = [] } = useQuery({
    queryKey: ['newsArticles', 'published'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_published: true }, '-published_date', 5),
    staleTime: 300000
  });

  const typeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'link': return <LinkIcon className="w-3 h-3" />;
      default: return <Newspaper className="w-3 h-3" />;
    }
  };

  const categoryColors = {
    announcements: 'bg-violet-100 text-violet-700',
    updates: 'bg-blue-100 text-blue-700',
    community: 'bg-emerald-100 text-emerald-700',
    missions: 'bg-amber-100 text-amber-700',
    events: 'bg-rose-100 text-rose-700',
    tech: 'bg-cyan-100 text-cyan-700',
    spiritual: 'bg-purple-100 text-purple-700'
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-6">
        <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No news yet</p>
        <p className="text-xs text-slate-400 mt-1">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.slice(0, 3).map((article) => (
        <div 
          key={article.id} 
          className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-all cursor-pointer"
          onClick={() => {
            if (article.type === 'link' && article.external_link) {
              window.open(article.external_link, '_blank');
            } else {
              setSelectedArticle(article);
            }
          }}
        >
          <div className="flex items-start gap-3">
            {article.image_url && (
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-[10px] px-1.5 py-0 ${categoryColors[article.category] || 'bg-slate-100 text-slate-700'}`}>
                  {article.category}
                </Badge>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  {typeIcon(article.type)}
                </span>
                {article.is_featured && (
                  <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0">Featured</Badge>
                )}
              </div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                {article.title}
              </h4>
              {article.summary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                {article.published_date ? format(new Date(article.published_date), 'MMM d, yyyy') : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      ))}

      {articles.length > 3 && (
        <Button 
          variant="ghost" 
          className="w-full text-violet-600 dark:text-violet-400" 
          onClick={() => window.location.href = createPageUrl('News')}
        >
          View all news
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}

      <NewsViewerModal
        open={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
        articles={articles}
        onNavigate={(article) => setSelectedArticle(article)}
      />
    </div>
  );
}