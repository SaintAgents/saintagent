import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function VersionHistoryPanel({ projectId, onRestore }) {
  const { data: versions = [] } = useQuery({
    queryKey: ['contentVersions', projectId],
    queryFn: () => base44.entities.ContentVersion.filter({ project_id: projectId }, '-version_number', 50),
    enabled: !!projectId
  });

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Version History</h3>
        <div className="space-y-3">
          {versions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No version history yet</p>
          ) : (
            versions.map(version => (
              <div key={version.id} className="p-3 rounded-lg border border-slate-200 hover:border-violet-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      v{version.version_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(version.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRestore(version)}
                    className="h-7 text-violet-600"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">{version.author_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-600">{version.author_name}</span>
                </div>
                {version.change_summary && (
                  <p className="text-xs text-slate-500">{version.change_summary}</p>
                )}
                {version.word_count > 0 && (
                  <p className="text-xs text-slate-400 mt-1">{version.word_count} words</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
}