import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, Building2, ClipboardList, ChevronLeft, ArrowRight, Sparkles
} from 'lucide-react';
import BusinessEntityTutorial from './BusinessEntityTutorial';
import ProjectSubmissionTutorial from './ProjectSubmissionTutorial';

const TUTORIALS = [
  {
    id: 'business_entity',
    title: 'Set Up a 5D Business Entity',
    description: 'Step-by-step guide to registering and configuring your conscious business on the platform.',
    icon: Building2,
    color: 'violet',
    duration: '5 min read',
    steps: 10,
    tag: 'Popular'
  },
  {
    id: 'project_submission',
    title: 'Submit a Project for Funding',
    description: 'Complete walkthrough of the 8-step project intake process — from basics to final alignment.',
    icon: ClipboardList,
    color: 'emerald',
    duration: '6 min read',
    steps: 11,
    tag: 'New'
  },
];

export default function LearnPanel({ onClose }) {
  const [activeTutorial, setActiveTutorial] = useState(null);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <GraduationCap className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-semibold text-white text-sm">Learn</h3>
              <p className="text-xs text-white/70">Tutorials & Guides</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Available Tutorials</p>

            {TUTORIALS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTutorial(t.id)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      t.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{t.title}</h4>
                        {t.tag && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">{t.tag}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>{t.steps} steps</span>
                        <span>•</span>
                        <span>{t.duration}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}

            {/* Coming soon placeholder */}
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
              <Sparkles className="w-5 h-5 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">More tutorials coming soon!</p>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Tutorial Modals */}
      <BusinessEntityTutorial 
        open={activeTutorial === 'business_entity'} 
        onClose={() => setActiveTutorial(null)} 
      />
      <ProjectSubmissionTutorial
        open={activeTutorial === 'project_submission'}
        onClose={() => setActiveTutorial(null)}
      />
    </>
  );
}