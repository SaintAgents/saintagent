import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Video, Link2, Eye, Calendar, User, ExternalLink, Star, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

const CATEGORY_COLORS = {
  announcements: 'bg-[#051C2C] text-white',
  updates: 'bg-blue-900 text-white',
  community: 'bg-emerald-900 text-white',
  missions: 'bg-violet-900 text-white',
  events: 'bg-amber-700 text-white',
  tech: 'bg-cyan-900 text-white',
  spiritual: 'bg-purple-900 text-white',
};

const TYPE_ICONS = {
  article: Newspaper,
  video: Video,
  link: Link2,
};

// McKinsey-style Article Card
function InsightCard({ article, onClick, isFeatured }) {
  const Icon = TYPE_ICONS[article.type] || Newspaper;
  const readingTime = Math.max(1, Math.ceil((article.content?.length || 500) / 1000));
  
  return (
    <article 
      className={`group cursor-pointer transition-all duration-300 ${isFeatured ? 'col-span-2' : ''}`}
      onClick={onClick}
    >
      <div className={`bg-white border border-slate-200 hover:border-[#051C2C] hover:shadow-xl transition-all duration-300 ${isFeatured ? 'flex flex-col md:flex-row' : ''}`}>
        {article.image_url && (
          <div className={`relative overflow-hidden ${isFeatured ? 'md:w-1/2 h-64 md:h-auto' : 'h-48'}`}>
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {article.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-amber-500 text-white gap-1 font-semibold tracking-wide">
                  <Star className="w-3 h-3" /> FEATURED
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className={`p-6 ${isFeatured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcements} text-xs font-semibold tracking-widest uppercase`}>
              {article.category}
            </Badge>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Icon className="w-3 h-3" /> {article.type}
            </span>
          </div>
          
          <h2 className={`font-serif font-bold text-[#051C2C] group-hover:text-blue-900 transition-colors leading-tight mb-3 ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {article.title}
          </h2>
          
          {article.summary && (
            <p className={`text-slate-600 leading-relaxed mb-4 ${isFeatured ? 'text-base line-clamp-4' : 'text-sm line-clamp-2'}`}>
              {article.summary}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              {article.published_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(article.published_date), 'MMM d, yyyy')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime} min read
              </span>
            </div>
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3 h-3" />
              {article.view_count || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// McKinsey-style Article Detail View
function ArticleDetail({ article, onBack, articles, onNavigate }) {
  const Icon = TYPE_ICONS[article.type] || Newspaper;
  const readingTime = Math.max(1, Math.ceil((article.content?.length || 500) / 1000));
  const currentIndex = articles.findIndex(a => a.id === article.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < articles.length - 1;
  
  return (
    <div className="bg-[#F0F2F5] min-h-screen -mx-6 -mb-12 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between py-6 border-b border-slate-300">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-[#051C2C] hover:bg-white">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Insights
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasPrev}
              onClick={() => hasPrev && onNavigate(articles[currentIndex - 1])}
              className="border-slate-300"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Previous
            </Button>
            <span className="text-xs text-slate-500 px-2">{currentIndex + 1} / {articles.length}</span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasNext}
              onClick={() => hasNext && onNavigate(articles[currentIndex + 1])}
              className="border-slate-300"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <header className="py-12">
          <div className="flex items-center gap-3 mb-6">
            <Badge className={`${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcements} text-xs font-semibold tracking-widest uppercase`}>
              {article.category}
            </Badge>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#051C2C] leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 pb-6 border-b border-slate-300">
            {article.author_name && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{article.author_name}</span>
              </span>
            )}
            {article.published_date && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(parseISO(article.published_date), 'MMMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {article.view_count || 0} views
            </span>
          </div>
        </header>

        {article.image_url && (
          <div className="mb-12">
            <img src={article.image_url} alt={article.title} className="w-full h-auto" />
          </div>
        )}

        <div className="flex gap-12">
          <div className="flex-1 max-w-[700px]">
            {article.video_url && (
              <div className="mb-8 aspect-video overflow-hidden bg-black">
                <iframe
                  src={article.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            {article.external_link && (
              <a 
                href={article.external_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[#051C2C] text-white hover:bg-blue-900 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open External Link
              </a>
            )}
            
            {article.content && (
              <div className="prose prose-lg prose-slate max-w-none 
                prose-headings:font-serif prose-headings:text-[#051C2C] 
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-a:text-blue-900 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-[#051C2C] prose-blockquote:bg-slate-100 prose-blockquote:py-4 prose-blockquote:px-6
                prose-strong:text-[#051C2C]">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            )}
            
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-300">
                <span className="text-xs text-slate-500 uppercase tracking-wider mr-2">Topics:</span>
                {article.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-slate-400 text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              {article.summary && (
                <div className="bg-white p-6 border-l-4 border-[#051C2C] mb-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> At a Glance
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{article.summary}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: articles = [] } = useQuery({
    queryKey: ['newsArticles'],
    queryFn: async () => {
      const all = await base44.entities.NewsArticle.list('-published_date', 100);
      return all.filter(a => a.is_published === true);
    },
    staleTime: 5 * 60 * 1000
  });

  const featured = articles.filter(a => a.is_featured);
  const filtered = activeFilter === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeFilter);

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    await base44.entities.NewsArticle.update(article.id, { 
      view_count: (article.view_count || 0) + 1 
    });
  };

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Hero Section with Image */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/d5cfb3f3a_universal_upscale_0_67b4f4ac-1a26-41b4-953c-b950fb28d875_0.jpg"
          alt="Insights"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C2C]/70 via-[#051C2C]/50 to-[#F0F2F5]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Insights & Analysis
              </h1>
              <ForwardButton currentPage="Insights" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Deep-dive analyses, strategic frameworks, and thought leadership to elevate your understanding and impact.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {selectedArticle ? (
          <ArticleDetail 
            article={selectedArticle} 
            onBack={() => setSelectedArticle(null)}
            articles={filtered}
            onNavigate={handleArticleClick}
          />
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mb-8 border-b border-slate-300 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeFilter === 'all' 
                    ? 'border-[#051C2C] text-[#051C2C]' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                All Insights
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap capitalize ${
                    activeFilter === cat 
                      ? 'border-[#051C2C] text-[#051C2C]' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured Section */}
            {activeFilter === 'all' && featured.length > 0 && (
              <div className="mb-12">
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.slice(0, 1).map(article => (
                    <InsightCard 
                      key={article.id} 
                      article={article} 
                      onClick={() => handleArticleClick(article)}
                      isFeatured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-semibold text-[#051C2C] mb-2">No insights yet</h3>
                <p className="text-slate-500">Check back soon for strategic updates.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.filter(a => activeFilter !== 'all' || !a.is_featured).map(article => (
                  <InsightCard 
                    key={article.id} 
                    article={article} 
                    onClick={() => handleArticleClick(article)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}