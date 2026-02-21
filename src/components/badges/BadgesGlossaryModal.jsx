import React, { useState } from 'react';
import { BADGE_SECTIONS, BADGE_RULES, QUEST_BADGE_IMAGES } from './badgesData';
import BadgeIcon from './BadgeIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BadgesGlossaryModal({ open, onOpenChange }) {
  const [filterTab, setFilterTab] = useState('all');
  
  // Separate sections into badges and sigils
  // Badges = all sections EXCEPT 'sigils' (these have generic icons)
  // Sigils = ONLY the 'sigils' section (these have big custom images)
  const badgeSections = BADGE_SECTIONS.filter(s => s.id !== 'sigils');
  const sigilSections = BADGE_SECTIONS.filter(s => s.id === 'sigils');
  
  const sectionsToShow = filterTab === 'all' ? BADGE_SECTIONS :
    filterTab === 'badges' ? badgeSections : sigilSections;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Badge & Sigil Glossary</DialogTitle>
        </DialogHeader>
        
        {/* Filter Tabs */}
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="sigils">Sigils</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {sectionsToShow.map(section => (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-slate-500 tracking-wider mb-3">{section.title}</h3>
              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.code} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                    {/* Badges with custom images show BIG, Sigils show small generic icons */}
                    {section.id !== 'sigils' && QUEST_BADGE_IMAGES[item.code] ? (
                      <img 
                        src={QUEST_BADGE_IMAGES[item.code]} 
                        alt={item.label}
                        className="w-20 h-20 object-contain flex-shrink-0"
                      />
                    ) : (
                      <BadgeIcon iconKey={item.iconKey} section={section.id} size={section.id === 'sigils' ? 40 : 22} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                        {item.subtitle && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{item.subtitle}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1"><span className="font-medium">Icon:</span> {item.icon_desc}</p>
                      <p className="text-sm text-slate-700 mt-1"><span className="font-medium">Definition:</span> {item.definition}</p>
                      {BADGE_RULES[item.code] && (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-slate-600"><span className="font-medium">When:</span> {BADGE_RULES[item.code].when}</p>
                          {BADGE_RULES[item.code].how && (
                            <p className="text-xs text-slate-600"><span className="font-medium">How:</span> {BADGE_RULES[item.code].how}</p>
                          )}
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">Trigger Rules:</span>
                            <pre className="bg-slate-50 border border-slate-200 rounded p-2 mt-1 overflow-auto"><code>{JSON.stringify(BADGE_RULES[item.code].conditions, null, 2)}</code></pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}