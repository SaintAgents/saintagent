import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Newspaper, Video, Link2, Eye, Calendar, User, ExternalLink, 
  ChevronLeft, ChevronRight, X, Image as ImageIcon, Share2 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import ArticleEngagement from './ArticleEngagement';
import SocialShareButtons from '@/components/affiliate/SocialShareButtons';

const CATEGORY_COLORS = {
  announcements: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  updates: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  community: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  missions: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  events: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  tech: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  spiritual: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TYPE_ICONS = {
  article: Newspaper,
  video: Video,
  link: Link2,
};

export default function NewsViewerModal({ 
  open, 
  onClose, 
  article, 
  articles = [], 
  onNavigate 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (article && articles.length > 0) {
      const idx = articles.findIndex(a => a.id === article.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [article, articles]);

  const currentArticle = articles[currentIndex] || article;
  if (!currentArticle) return null;

  const Icon = TYPE_ICONS[currentArticle.type] || Newspaper;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < articles.length - 1;

  const goToPrev = () => {
    if (hasPrev) {
      setCurrentIndex(currentIndex - 1);
      onNavigate?.(articles[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
      onNavigate?.(articles[currentIndex + 1]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPrev} 
              disabled={!hasPrev}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentIndex + 1} / {articles.length}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNext} 
              disabled={!hasNext}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          {currentArticle.image_url && (
            <div className="relative h-48 md:h-64 overflow-hidden group">
              <img 
                src={currentArticle.image_url} 
                alt={currentArticle.title}
                className="w-full h-full object-cover"
              />
              {/* Image viewer trigger - always visible */}
              <button
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('openGlobalPhotoViewer', { 
                    detail: { imageUrl: currentArticle.image_url, title: currentArticle.title } 
                  }));
                }}
                className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors flex items-center gap-1.5"
                title="View full image"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-medium">View</span>
              </button>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={CATEGORY_COLORS[currentArticle.category] || CATEGORY_COLORS.announcements}>
                {currentArticle.category}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Icon className="w-3 h-3" /> {currentArticle.type}
              </Badge>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {currentArticle.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b dark:border-slate-700">
              {currentArticle.published_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(parseISO(currentArticle.published_date), 'MMMM d, yyyy')}
                </span>
              )}
              {currentArticle.author_name && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {currentArticle.author_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {currentArticle.view_count || 0} views
              </span>
            </div>
            
            {currentArticle.video_url && (
              <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={currentArticle.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            {currentArticle.external_link && (
              <a 
                href={currentArticle.external_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400"
              >
                <ExternalLink className="w-4 h-4" />
                Open External Link
              </a>
            )}
            
            {currentArticle.summary && !currentArticle.content && (
              <p className="text-slate-600 dark:text-slate-300">
                {currentArticle.summary}
              </p>
            )}
            
            {currentArticle.content && (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                  [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_br]:block [&_br]:content-[''] [&_br]:mt-2
                  [&_strong]:font-semibold [&_strong]:text-slate-900 dark:[&_strong]:text-white
                  [&_em]:italic [&_em]:text-slate-600 dark:[&_em]:text-slate-300
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
                  [&_li]:text-slate-700 dark:[&_li]:text-slate-300
                  [&_blockquote]:border-l-4 [&_blockquote]:border-violet-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400
                  [&_hr]:my-6 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-700
                  [&_a]:text-violet-600 [&_a]:underline hover:[&_a]:text-violet-800 dark:[&_a]:text-violet-400
                  [&_div]:mb-4
                  whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: currentArticle.content }}
              />
            )}
            
            {currentArticle.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t dark:border-slate-700">
                {currentArticle.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement Section - Likes, Comments, Share */}
            <div className="mt-8 pt-6 border-t dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Engage & Share</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Share:</span>
                  <SocialShareButtons 
                    url={window.location.origin + '/News?article=' + currentArticle.id}
                    text={`Check out "${currentArticle.title}" on SaintAgent!`}
                    size="sm"
                  />
                </div>
              </div>
              <ArticleEngagement article={currentArticle} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}