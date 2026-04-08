import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLOSSARY_TERMS } from '@/components/glossary/glossaryData';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'platform', label: 'Platform' },
  { id: 'economy', label: 'Economy & GGG' },
  { id: 'ultranet', label: 'Ultranet' },
  { id: 'community', label: 'Community' },
  { id: 'spiritual', label: 'Spiritual & Mystical' },
  { id: 'governance', label: 'Governance' },
  { id: 'technology', label: 'Technology' },
];

const CATEGORY_COLORS = {
  platform: 'bg-violet-100 text-violet-700 border-violet-200',
  economy: 'bg-amber-100 text-amber-700 border-amber-200',
  ultranet: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  community: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  spiritual: 'bg-purple-100 text-purple-700 border-purple-200',
  governance: 'bg-blue-100 text-blue-700 border-blue-200',
  technology: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedTerm, setExpandedTerm] = useState(null);

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter(term => {
      const matchesSearch = !search ||
        term.term.toLowerCase().includes(search.toLowerCase()) ||
        term.short.toLowerCase().includes(search.toLowerCase()) ||
        term.long?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(t => {
      const letter = t.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-24 -mt-28 md:-mt-28">
      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden page-hero">
        <img
          src="https://media.base44.com/images/public/694f3e0401b05e6e8a042002/4f5d71898_image.png"
          alt="SaintAgent Glossary"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 hero-content">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Glossary</h1>
            </div>
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              A reference guide to the terms, concepts, and technologies used across the SaintAgent ecosystem.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search terms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-12 text-base rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                activeCategory === cat.id
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400 mb-4">{filtered.length} term{filtered.length !== 1 ? 's' : ''}</p>

        {/* Terms */}
        <div className="space-y-6">
          {grouped.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No terms match your search.</p>
            </div>
          )}
          {grouped.map(([letter, terms]) => (
            <div key={letter}>
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-1 mb-2">
                <span className="text-2xl font-bold text-violet-600">{letter}</span>
              </div>
              <div className="space-y-2">
                {terms.map(term => {
                  const isExpanded = expandedTerm === term.term;
                  return (
                    <div
                      key={term.term}
                      className={cn(
                        "rounded-xl border transition-all",
                        isExpanded ? "bg-white shadow-md border-violet-200" : "bg-white/70 border-slate-200 hover:border-violet-200 hover:shadow-sm"
                      )}
                    >
                      <button
                        onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900">{term.term}</h3>
                            <Badge className={cn("text-[10px] px-1.5 py-0 border", CATEGORY_COLORS[term.category] || 'bg-slate-100 text-slate-600')}>
                              {term.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{term.short}</p>
                        </div>
                        {term.long && (
                          isExpanded
                            ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                        )}
                      </button>
                      {isExpanded && term.long && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-slate-100 pt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {term.long}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}