import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowRight, Eye, Calendar, Clock, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';
import NewsViewerModal from '@/components/news/NewsViewerModal';

const CATEGORY_COLORS = {
  announcements: 'bg-[#051C2C] text-white',
  updates: 'bg-blue-900 text-white',
  community: 'bg-emerald-900 text-white',
  missions: 'bg-violet-900 text-white',
  events: 'bg-amber-700 text-white',
  tech: 'bg-cyan-900 text-white',
  spiritual: 'bg-purple-900 text-white',
};

export default function InsightsCard() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const { data: articles = [] } = useQuery({
    queryKey: ['newsArticles', 'published'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_published: true }, '-published_date', 5),
    staleTime: 5 * 60 * 1000
  });

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#051C2C]" />
          <h3 className="font-serif text-lg font-bold text-[#051C2C]">Insights & Analysis</h3>
        </div>
        <p className="text-sm text-slate-500">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#051C2C]" />
          <h3 className="font-serif text-lg font-bold text-[#051C2C]">Insights & Analysis</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-[#051C2C] hover:bg-slate-100 gap-1"
          onClick={() => window.location.href = createPageUrl('Insights')}
        >
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Articles List */}
      <div className="divide-y divide-slate-100">
        {articles.slice(0, 3).map((article) => {
          const readingTime = Math.max(1, Math.ceil((article.content?.length || 500) / 1000));
          return (
            <article 
              key={article.id}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex gap-4">
                {article.image_url && (
                  <div className="w-20 h-20 shrink-0 overflow-hidden">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Badge className={`${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcements} text-[10px] font-semibold tracking-widest uppercase mb-2`}>
                    {article.category}
                  </Badge>
                  <h4 className="font-serif font-semibold text-[#051C2C] group-hover:text-blue-900 line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {article.published_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(article.published_date), 'MMM d')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readingTime} min
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

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