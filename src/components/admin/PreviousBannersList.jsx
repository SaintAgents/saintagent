import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, History, Image } from 'lucide-react';
import { format } from 'date-fns';

const EXAMPLE_BANNERS = [
  {
    id: 'ex1',
    title: '🌍 Join the Global Grid Mission',
    subtitle: 'Unite with agents worldwide for planetary coherence',
    description: 'Participate in our flagship mission and earn GGG rewards while making a real impact.',
    cta_text: 'Join Mission',
    cta_url: '/Missions',
    bg_color: '#0f172a',
    text_color: '#ffffff',
    accent_color: '#10b981',
    overlay_opacity: 50,
    layout: 'left',
    enabled: true,
    saved_at: '2026-03-15T10:00:00Z',
    is_example: true,
  },
  {
    id: 'ex2',
    title: '✨ New Marketplace Listings',
    subtitle: 'Discover healing sessions, mentorship & more',
    description: 'Browse the latest offerings from verified practitioners in our community.',
    cta_text: 'Explore',
    cta_url: '/Marketplace',
    bg_color: '#1e1b4b',
    text_color: '#ffffff',
    accent_color: '#a78bfa',
    overlay_opacity: 40,
    layout: 'center',
    enabled: true,
    saved_at: '2026-02-20T14:30:00Z',
    is_example: true,
  },
  {
    id: 'ex3',
    title: '🔥 Sacred Flame Ceremony — This Saturday',
    subtitle: 'Live broadcast with guided meditation & activation',
    description: 'A community-wide gathering for alignment and transformation.',
    cta_text: 'RSVP Now',
    cta_url: '/Events',
    bg_color: '#451a03',
    text_color: '#fef3c7',
    accent_color: '#f59e0b',
    overlay_opacity: 60,
    layout: 'left',
    enabled: true,
    saved_at: '2026-01-10T09:00:00Z',
    is_example: true,
  },
  {
    id: 'ex4',
    title: '🎓 New Learning Hub Courses Available',
    subtitle: 'Level up your skills and earn rank points',
    description: 'Explore courses on leadership, healing arts, and sacred technology.',
    cta_text: 'Start Learning',
    cta_url: '/LearningHub',
    bg_color: '#042f2e',
    text_color: '#ccfbf1',
    accent_color: '#2dd4bf',
    overlay_opacity: 45,
    layout: 'right',
    enabled: true,
    saved_at: '2025-12-05T16:00:00Z',
    is_example: true,
  },
];

function BannerPreviewMini({ banner }) {
  const align = banner.layout === 'center' ? 'items-center text-center' : banner.layout === 'right' ? 'items-end text-right' : 'items-start text-left';
  return (
    <div className="relative w-full h-full overflow-hidden rounded-md" style={{ backgroundColor: banner.bg_color }}>
      {banner.image_url && (
        <>
          <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: banner.bg_color, opacity: (banner.overlay_opacity || 50) / 100 }} />
        </>
      )}
      <div className={`relative z-10 flex flex-col justify-center h-full px-3 ${align}`}>
        {banner.title && <p className="text-xs font-bold truncate" style={{ color: banner.text_color }}>{banner.title}</p>}
        {banner.subtitle && <p className="text-[10px] opacity-70 truncate" style={{ color: banner.text_color }}>{banner.subtitle}</p>}
      </div>
    </div>
  );
}

export default function PreviousBannersList({ history = [], onLoad }) {
  const allItems = [...history, ...EXAMPLE_BANNERS.filter(ex => !history.some(h => h.title === ex.title))];

  if (allItems.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          Previous Banners
        </CardTitle>
        <p className="text-xs text-slate-500">Click "Use" to load a previous banner into the editor above</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 transition-colors group"
            >
              {/* Mini preview */}
              <div className="w-28 h-14 flex-shrink-0">
                <BannerPreviewMini banner={item} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.title || 'Untitled Banner'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.is_example && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Example</span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {item.saved_at ? format(new Date(item.saved_at), 'MMM d, yyyy') : ''}
                  </span>
                  {item.image_url && <Image className="w-3 h-3 text-slate-400" />}
                </div>
              </div>

              {/* Action */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-600 border-violet-300 hover:bg-violet-100"
                onClick={() => onLoad(item)}
              >
                <RotateCcw className="w-3 h-3" />
                Use
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}