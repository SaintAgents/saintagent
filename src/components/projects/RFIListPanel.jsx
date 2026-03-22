import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Copy, CheckCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RFIListPanel({ rfiItems, projectTitle }) {
  const [expanded, setExpanded] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!rfiItems || rfiItems.length === 0) return null;

  // Group RFI items by category
  const grouped = {};
  rfiItems.forEach(item => {
    const match = item.match(/^\[([^\]]+)\]\s*(.*)/);
    if (match) {
      const cat = match[1];
      const question = match[2];
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(question);
    } else {
      if (!grouped['General']) grouped['General'] = [];
      grouped['General'].push(item);
    }
  });

  const copyAll = () => {
    const text = `REQUEST FOR INFORMATION (RFI)\nProject: ${projectTitle}\nDate: ${new Date().toLocaleDateString()}\n\n` +
      Object.entries(grouped).map(([cat, questions]) => 
        `--- ${cat} ---\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      ).join('\n\n') +
      `\n\nPlease respond within 14 business days. If you have questions about this RFI, please contact your evaluation coordinator.`;

    navigator.clipboard.writeText(text);
    toast.success('RFI copied to clipboard');
  };

  const copyItem = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="rounded-xl border-2 border-blue-300 bg-blue-50 overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-800">
            Request for Information (RFI)
          </span>
          <Badge className="bg-blue-200 text-blue-800">{rfiItems.length} items</Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Button size="sm" variant="outline" onClick={copyAll} className="gap-1 text-xs">
              <Copy className="w-3 h-3" /> Copy Full RFI
            </Button>
            <span className="text-xs text-blue-600">
              Auto-generated based on scoring gaps and ethical floor violations
            </span>
          </div>

          <ScrollArea className="max-h-80">
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, questions]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {questions.map((q, i) => {
                      const globalIdx = rfiItems.indexOf(`[${category}] ${q}`);
                      return (
                        <div key={i} className="flex items-start gap-2 group">
                          <span className="text-xs font-mono text-blue-500 mt-0.5 w-5 shrink-0">
                            {i + 1}.
                          </span>
                          <p className="text-sm text-blue-900 flex-1">{q}</p>
                          <button
                            onClick={() => copyItem(q, globalIdx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            {copiedIdx === globalIdx ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-blue-400 hover:text-blue-600" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}