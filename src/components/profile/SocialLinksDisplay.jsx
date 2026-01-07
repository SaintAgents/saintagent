import React from 'react';
import { Globe, Twitter, Instagram, Linkedin, Youtube, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SOCIAL_ICONS = {
  website: Globe,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: () => <span className="font-bold text-[10px]">TT</span>,
  telegram: Send,
  discord: MessageCircle,
  substack: () => <span className="font-bold text-[10px]">S</span>,
};

const SOCIAL_COLORS = {
  website: 'hover:bg-slate-100 hover:text-slate-700',
  twitter: 'hover:bg-sky-50 hover:text-sky-600',
  instagram: 'hover:bg-pink-50 hover:text-pink-600',
  linkedin: 'hover:bg-blue-50 hover:text-blue-700',
  youtube: 'hover:bg-red-50 hover:text-red-600',
  tiktok: 'hover:bg-slate-100 hover:text-slate-900',
  telegram: 'hover:bg-sky-50 hover:text-sky-500',
  discord: 'hover:bg-indigo-50 hover:text-indigo-600',
  substack: 'hover:bg-orange-50 hover:text-orange-600',
};

function normalizeUrl(value, platform) {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  
  const prefixes = {
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    youtube: 'https://youtube.com/',
    tiktok: 'https://tiktok.com/@',
    telegram: 'https://t.me/',
    substack: 'https://',
  };
  
  const cleanValue = value.replace(/^@/, '');
  if (prefixes[platform]) {
    return prefixes[platform] + cleanValue;
  }
  return 'https://' + value;
}

export default function SocialLinksDisplay({ socialLinks, className = '' }) {
  if (!socialLinks) return null;

  const links = Object.entries(socialLinks).filter(([key, value]) => 
    value && !key.includes('label') && !key.includes('custom_link')
  );

  const customLinks = [];
  if (socialLinks.custom_link_1) {
    customLinks.push({ url: socialLinks.custom_link_1, label: socialLinks.custom_link_1_label || 'Link' });
  }
  if (socialLinks.custom_link_2) {
    customLinks.push({ url: socialLinks.custom_link_2, label: socialLinks.custom_link_2_label || 'Link' });
  }

  if (links.length === 0 && customLinks.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(([platform, value]) => {
        const Icon = SOCIAL_ICONS[platform] || Globe;
        const colorClass = SOCIAL_COLORS[platform] || 'hover:bg-slate-100';
        const url = normalizeUrl(value, platform);
        
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full border border-slate-200 transition-colors ${colorClass}`}
            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
      
      {customLinks.map((link, i) => (
        <a
          key={`custom-${i}`}
          href={link.url.startsWith('http') ? link.url : 'https://' + link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          {link.label}
        </a>
      ))}
    </div>
  );
}