import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Video, Link2, Eye, Calendar, User, ExternalLink, Star, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import NewsAdminPanel from '@/components/news/NewsAdminPanel';

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

function NewsCard({ article, onClick }) {
  const Icon = TYPE_ICONS[article.type] || Newspaper;
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all dark:bg-[rgba(0,0,0,0.75)] dark:border-[rgba(0,255,136,0.2)] dark:hover:border-[rgba(0,255,136,0.4)]"
      onClick={onClick}
    >
      {article.image_url && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {article.is_featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-amber-500 text-white gap-1">
                <Star className="w-3 h-3" /> Featured
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcements}>
              {article.category}
            </Badge>
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Icon className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {article.summary && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
            {article.summary}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {article.published_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(parseISO(article.published_date), 'MMM d, yyyy')}
              </span>
            )}
            {article.author_name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {article.author_name}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.view_count || 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleDetail({ article, onBack }) {
  const Icon = TYPE_ICONS[article.type] || Newspaper;
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to News
      </Button>
      
      <Card className="dark:bg-[rgba(0,0,0,0.75)] dark:border-[rgba(0,255,136,0.2)]">
        {article.image_url && (
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcements}>
              {article.category}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Icon className="w-3 h-3" /> {article.type}
            </Badge>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b dark:border-slate-700">
            {article.published_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(parseISO(article.published_date), 'MMMM d, yyyy')}
              </span>
            )}
            {article.author_name && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.view_count || 0} views
            </span>
          </div>
          
          {article.video_url && (
            <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
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
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400"
            >
              <ExternalLink className="w-4 h-4" />
              Open External Link
            </a>
          )}
          
          {article.content && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          )}
          
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t dark:border-slate-700">
              {article.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function News() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showAdmin, setShowAdmin] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const articleIdFromUrl = urlParams.get('articleId');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = currentUser?.role === 'admin';

  const { data: articles = [], refetch } = useQuery({
    queryKey: ['newsArticles'],
    queryFn: async () => {
      const all = await base44.entities.NewsArticle.list('-published_date', 100);
      return all.filter(a => a.is_published === true);
    }
  });

  const featured = articles.filter(a => a.is_featured);
  const nonFeatured = articles.filter(a => !a.is_featured);
  const filtered = activeTab === 'all' 
    ? nonFeatured 
    : nonFeatured.filter(a => a.type === activeTab);

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    // Increment view count
    await base44.entities.NewsArticle.update(article.id, { 
      view_count: (article.view_count || 0) + 1 
    });
  };

  // Auto-select article from URL parameter
  React.useEffect(() => {
    if (articleIdFromUrl && articles.length > 0 && !selectedArticle) {
      const foundArticle = articles.find(a => a.id === articleIdFromUrl);
      if (foundArticle) {
        handleArticleClick(foundArticle);
      }
    }
  }, [articleIdFromUrl, articles]);

  if (showAdmin && isAdmin) {
    return <NewsAdminPanel onBack={() => { setShowAdmin(false); refetch(); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/b85f8b778_c187ff4c-c910-4f5d-aed1-62a6e76b4751.png"
          alt="News"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <HeroGalleryTrigger startIndex={0} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <Newspaper className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] tracking-wide"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(239,68,68,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                News & Updates
              </h1>
              <ForwardButton currentPage="News" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-red-200/90 text-base tracking-wider drop-shadow-lg">
                Breaking News · Community Updates · Platform Announcements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {selectedArticle ? (
          <ArticleDetail 
            article={selectedArticle} 
            onBack={() => setSelectedArticle(null)} 
          />
        ) : (
          <>
            {/* Admin Button */}
            {isAdmin && (
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowAdmin(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Newspaper className="w-4 h-4" /> Manage News
                </Button>
              </div>
            )}

            {/* Featured Section */}
            {featured.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Featured
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.slice(0, 2).map(article => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      onClick={() => handleArticleClick(article)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabs & Articles */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="article" className="gap-1">
                  <Newspaper className="w-4 h-4" /> Articles
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-1">
                  <Video className="w-4 h-4" /> Videos
                </TabsTrigger>
                <TabsTrigger value="link" className="gap-1">
                  <Link2 className="w-4 h-4" /> Links
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <Newspaper className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No news yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">Check back soon for updates!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(article => (
                      <NewsCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => handleArticleClick(article)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}