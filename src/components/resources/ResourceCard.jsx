import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

function getTypeIcon(t) {
  if (t === 'video') return Video;
  if (t === 'external_link') return ExternalLink;
  return BookOpen;
}

function toYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {}
  return null;
}

export default function ResourceCard({ resource, isAdmin, onModerate }) {
  const Icon = getTypeIcon(resource.type);
  const embed = resource.type === 'video' ? toYouTubeEmbed(resource.content_url) : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-700">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{resource.title}</h3>
                {resource.is_featured && (
                  <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                )}
                <Badge variant="outline" className="capitalize">{resource.type.replace('_', ' ')}</Badge>
                <Badge variant="secondary" className="capitalize">{resource.status}</Badge>
              </div>
              {resource.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">{resource.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {(resource.categories || []).map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                ))}
                {(resource.tags || []).slice(0, 4).map((t, i) => (
                  <Badge key={i} className="bg-slate-100 text-slate-700 text-[11px]">#{t}</Badge>
                ))}
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Added by {resource.author_name || resource.user_id}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {resource.content_url && (
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <a href={resource.content_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> Open
                </a>
              </Button>
            )}
            {isAdmin && resource.status === 'pending' && (
              <>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-lg" onClick={() => onModerate(resource, 'approved')}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => onModerate(resource, 'rejected')}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
        {embed && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe src={embed} title={resource.title} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )}
      </CardContent>
    </Card>
  );
}