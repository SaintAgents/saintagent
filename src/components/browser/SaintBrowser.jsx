import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe, ArrowLeft, ArrowRight, RotateCw, X, Star, StarOff,
  Search, Shield, Wallet, Sparkles, ExternalLink, Home, Lock,
  Plus, Bookmark, History, Zap, ChevronRight, Loader2, AlertTriangle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const DEFAULT_BOOKMARKS = [
  { name: 'Uniswap', url: 'https://app.uniswap.org', icon: '🦄', isDapp: true },
  { name: 'OpenSea', url: 'https://opensea.io', icon: '🌊', isDapp: true },
  { name: 'Etherscan', url: 'https://etherscan.io', icon: '📊', isDapp: true },
  { name: 'CoinGecko', url: 'https://coingecko.com', icon: '🦎', isDapp: false },
  { name: 'DeFi Llama', url: 'https://defillama.com', icon: '🦙', isDapp: true },
];

const DAPP_PATTERNS = [
  'uniswap', 'opensea', 'aave', 'compound', 'curve', 'sushi', 'pancake',
  'raydium', 'jupiter', 'phantom', 'metamask', 'rainbow', 'zerion',
  'zapper', 'debank', 'nansen', 'dune', 'etherscan', 'polygonscan',
  'arbiscan', 'optimistic', 'basescan', 'blur', 'x2y2', 'looksrare'
];

export default function SaintBrowser({ open, onClose }) {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [favorites, setFavorites] = useState(DEFAULT_BOOKMARKS);
  const [showFavorites, setShowFavorites] = useState(true);
  const [isDapp, setIsDapp] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const iframeRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch user profile for saved favorites
  const { data: profile } = useQuery({
    queryKey: ['browserFavorites'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    }
  });

  // Load saved favorites from profile
  useEffect(() => {
    if (profile?.browser_favorites) {
      try {
        const saved = JSON.parse(profile.browser_favorites);
        if (Array.isArray(saved) && saved.length > 0) {
          setFavorites([...DEFAULT_BOOKMARKS, ...saved]);
        }
      } catch {}
    }
  }, [profile]);

  // Detect DApp sites
  useEffect(() => {
    if (url) {
      const isDappSite = DAPP_PATTERNS.some(pattern => 
        url.toLowerCase().includes(pattern)
      );
      setIsDapp(isDappSite);
    } else {
      setIsDapp(false);
    }
  }, [url]);

  const navigate = (targetUrl) => {
    if (!targetUrl) return;
    
    let finalUrl = targetUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      // Check if it's a search query or URL
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        finalUrl = 'https://' + targetUrl;
      } else {
        // Treat as search query
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    
    setIsLoading(true);
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setSummary('');
    
    // Update history
    const newHistory = [...history.slice(0, historyIndex + 1), finalUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setShowFavorites(false);
    
    // Simulate load complete
    setTimeout(() => setIsLoading(false), 1500);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevUrl = history[historyIndex - 1];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextUrl = history[historyIndex + 1];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
    }
  };

  const refresh = () => {
    if (url) {
      setIsLoading(true);
      // Force iframe reload by clearing and re-setting
      const currentUrl = url;
      setUrl('');
      setTimeout(() => {
        setUrl(currentUrl);
        setIsLoading(false);
      }, 100);
    }
  };

  const goHome = () => {
    setUrl('');
    setInputUrl('');
    setShowFavorites(true);
    setSummary('');
  };

  const toggleFavorite = async () => {
    if (!url) return;
    
    const exists = favorites.find(f => f.url === url);
    let newFavorites;
    
    if (exists) {
      newFavorites = favorites.filter(f => f.url !== url);
      toast.success('Removed from favorites');
    } else {
      const name = new URL(url).hostname.replace('www.', '');
      newFavorites = [...favorites, { name, url, icon: '🔗', isDapp }];
      toast.success('Added to favorites');
    }
    
    setFavorites(newFavorites);
    
    // Save to profile (excluding defaults)
    if (profile?.id) {
      const customFavorites = newFavorites.filter(
        f => !DEFAULT_BOOKMARKS.find(d => d.url === f.url)
      );
      await base44.entities.UserProfile.update(profile.id, {
        browser_favorites: JSON.stringify(customFavorites)
      });
    }
  };

  const summarizePage = async () => {
    if (!url) return;
    
    setSummaryLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this webpage in 2-3 concise sentences. URL: ${url}. Focus on the main purpose and key information.`,
        add_context_from_internet: true
      });
      setSummary(result);
    } catch (error) {
      toast.error('Could not summarize page');
    } finally {
      setSummaryLoading(false);
    }
  };

  const connectWallet = () => {
    toast.info('Wallet connection would link to G3Dex wallet');
  };

  const isFavorited = favorites.some(f => f.url === url);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[85vh] p-0 bg-[#0a0a0f] border border-lime-500/20 overflow-hidden">
        {/* Browser Header */}
        <div className="flex flex-col border-b border-lime-500/20 bg-black/60 backdrop-blur-xl">
          {/* Top Bar */}
          <div className="flex items-center gap-2 p-2 border-b border-lime-500/10">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                disabled={historyIndex <= 0}
                className="h-8 w-8 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goForward}
                disabled={historyIndex >= history.length - 1}
                className="h-8 w-8 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 disabled:opacity-30"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                disabled={!url}
                className="h-8 w-8 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 disabled:opacity-30"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goHome}
                className="h-8 w-8 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10"
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>

            {/* URL Bar */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {url ? (
                  <Lock className="w-3.5 h-3.5 text-lime-400" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(inputUrl)}
                placeholder="Search or enter URL..."
                className="pl-9 pr-20 h-9 bg-black/40 border-lime-500/30 text-white placeholder:text-gray-500 focus:border-lime-500/50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                    className="h-6 w-6 text-gray-400 hover:text-yellow-400"
                  >
                    {isFavorited ? (
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(inputUrl)}
                  className="h-6 px-2 text-xs text-lime-400 hover:bg-lime-500/10"
                >
                  Go
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isDapp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={connectWallet}
                  className="h-8 text-xs text-purple-400 hover:bg-purple-500/10 gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Connect
                </Button>
              )}
              {url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={summarizePage}
                  disabled={summaryLoading}
                  className="h-8 text-xs text-cyan-400 hover:bg-cyan-500/10 gap-1.5"
                >
                  {summaryLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  AI Summary
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* DApp Detection Banner */}
          {isDapp && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-lime-500/10 border-b border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">DApp Detected</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                Web3
              </Badge>
              <span className="text-xs text-gray-400 ml-auto">
                Connect your G3Dex wallet for seamless integration
              </span>
            </div>
          )}

          {/* AI Summary Banner */}
          {summary && (
            <div className="flex items-start gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-transparent border-b border-cyan-500/20">
              <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-xs text-cyan-200 leading-relaxed">{summary}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSummary('')}
                className="h-5 w-5 text-gray-500 hover:text-gray-300 shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Browser Content */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(85vh - 120px)' }}>
          {/* Favorites Sidebar */}
          {showFavorites && (
            <div className="w-64 border-r border-lime-500/20 bg-black/40 p-4 overflow-auto">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-lime-400" />
                Favorites
              </h3>
              <div className="space-y-1">
                {favorites.map((fav, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(fav.url)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-lime-500/10 transition-colors group"
                  >
                    <span className="text-lg">{fav.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{fav.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{fav.url}</div>
                    </div>
                    {fav.isDapp && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[8px] px-1">
                        DApp
                      </Badge>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  Quick Search
                </h4>
                <div className="space-y-1">
                  {['DuckDuckGo', 'Google', 'Brave Search'].map((engine) => (
                    <button
                      key={engine}
                      onClick={() => {
                        const urls = {
                          'DuckDuckGo': 'https://duckduckgo.com',
                          'Google': 'https://google.com',
                          'Brave Search': 'https://search.brave.com'
                        };
                        navigate(urls[engine]);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-lime-500/10"
                    >
                      {engine}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 bg-white relative">
            {!url ? (
              // Home Screen
              <div className="absolute inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-lime-500/20">
                  <Globe className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">SaintBrowser</h2>
                <p className="text-gray-400 text-center max-w-md mb-8">
                  Secure, containerized browsing within the SaintAgent platform. 
                  Browse the web, explore DApps, and connect your wallet seamlessly.
                </p>
                
                <div className="grid grid-cols-3 gap-3 max-w-lg">
                  {DEFAULT_BOOKMARKS.slice(0, 6).map((site, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(site.url)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-black/40 border border-lime-500/20 hover:border-lime-500/40 hover:bg-lime-500/5 transition-all"
                    >
                      <span className="text-2xl">{site.icon}</span>
                      <span className="text-xs text-gray-300">{site.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-lime-400" />
                    Secure Browsing
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-purple-400" />
                    DApp Detection
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    AI Summaries
                  </div>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  </div>
                )}
                
                {/* Iframe with proxy fallback info */}
                <div className="w-full h-full flex flex-col">
                  <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full flex-1 border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    title="SaintBrowser"
                    onError={() => {
                      toast.error('Some sites block embedding. Try opening in new tab.');
                    }}
                  />
                  
                  {/* Fallback notice */}
                  <div className="bg-black/80 border-t border-lime-500/20 px-3 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      Some sites may not display due to security restrictions
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="h-6 text-xs text-lime-400 hover:bg-lime-500/10 gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}