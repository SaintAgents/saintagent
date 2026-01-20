import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Social platform configurations
const PLATFORMS = {
  twitter: {
    name: 'X (Twitter)',
    icon: (props) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: 'bg-black hover:bg-gray-800',
    getShareUrl: (url, text) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  },
  telegram: {
    name: 'Telegram',
    icon: (props) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    color: 'bg-[#0088cc] hover:bg-[#007ab8]',
    getShareUrl: (url, text) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  warpcast: {
    name: 'Warpcast',
    icon: (props) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M3.5 2.5h17a1 1 0 011 1v17a1 1 0 01-1 1h-17a1 1 0 01-1-1v-17a1 1 0 011-1zm2.75 4v11h2.5v-4.5h2.5v4.5h2.5v-4.5h2.5v4.5h2.5v-11h-2.5v4.5h-2.5v-4.5h-2.5v4.5h-2.5v-4.5h-2.5z"/>
      </svg>
    ),
    color: 'bg-[#8a63d2] hover:bg-[#7952c4]',
    getShareUrl: (url, text) => 
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text + ' ' + url)}`
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: (props) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    color: 'bg-[#25D366] hover:bg-[#20bd5a]',
    getShareUrl: (url, text) => 
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  }
};

export default function SocialShareButtons({ 
  url, 
  text = "Join me on SaintAgent - a platform for conscious creators and collaborators!",
  platforms = ['twitter', 'telegram', 'warpcast', 'whatsapp'],
  size = 'default', // 'sm', 'default', 'lg'
  variant = 'icon', // 'icon', 'full'
  className 
}) {
  const handleShare = (platform) => {
    const config = PLATFORMS[platform];
    if (!config) return;
    
    const shareUrl = config.getShareUrl(url, text);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const sizeClasses = {
    sm: 'h-7 w-7',
    default: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1.5", className)}>
        {platforms.map((platform) => {
          const config = PLATFORMS[platform];
          if (!config) return null;
          const Icon = config.icon;
          
          return (
            <Tooltip key={platform}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    sizeClasses[size],
                    config.color,
                    "text-white rounded-lg transition-all hover:scale-105"
                  )}
                  onClick={() => handleShare(platform)}
                >
                  <Icon className={iconSizes[size]} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share to {config.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// Compact inline share button for offer rows
export function ShareButton({ url, text, platform = 'twitter', className }) {
  const config = PLATFORMS[platform];
  if (!config) return null;
  
  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = config.getShareUrl(url, text);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  const Icon = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleShare}
            className={cn(
              "p-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
              className
            )}
          >
            <Icon className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share to {config.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Multi-platform share row for offer listings
export function OfferShareRow({ url, offerTitle, className }) {
  const text = `Check out "${offerTitle}" on SaintAgent!`;
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {['twitter', 'telegram', 'warpcast'].map((platform) => (
        <ShareButton 
          key={platform}
          url={url}
          text={text}
          platform={platform}
        />
      ))}
    </div>
  );
}