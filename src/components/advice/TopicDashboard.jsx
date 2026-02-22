import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Briefcase, 
  Sparkles, 
  Activity, 
  Users, 
  TrendingUp,
  DollarSign,
  Scale,
  Cpu,
  HelpCircle
} from 'lucide-react';

const TOPIC_CONFIG = {
  relationships: { icon: Heart, color: 'bg-pink-500', lightBg: 'bg-pink-50', textColor: 'text-pink-700', label: 'Relationships' },
  business: { icon: Briefcase, color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', label: 'Business' },
  spiritual: { icon: Sparkles, color: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', label: 'Spiritual' },
  health: { icon: Activity, color: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-700', label: 'Health' },
  family: { icon: Users, color: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-700', label: 'Family' },
  personal_growth: { icon: TrendingUp, color: 'bg-teal-500', lightBg: 'bg-teal-50', textColor: 'text-teal-700', label: 'Growth' },
  finance: { icon: DollarSign, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', label: 'Finance' },
  legal: { icon: Scale, color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700', label: 'Legal' },
  technology: { icon: Cpu, color: 'bg-cyan-500', lightBg: 'bg-cyan-50', textColor: 'text-cyan-700', label: 'Tech' },
  other: { icon: HelpCircle, color: 'bg-slate-500', lightBg: 'bg-slate-50', textColor: 'text-slate-700', label: 'Other' }
};

export default function TopicDashboard({ questions = [], selectedCategory, onCategorySelect }) {
  // Count questions per category
  const categoryCounts = questions.reduce((acc, q) => {
    const cat = q.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const totalQuestions = questions.length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
      {/* All Topics card */}
      <Card
        onClick={() => onCategorySelect('all')}
        className={cn(
          "p-3 cursor-pointer transition-all hover:shadow-md border-2",
          selectedCategory === 'all' 
            ? "border-indigo-500 bg-indigo-50 shadow-md" 
            : "border-transparent hover:border-slate-200"
        )}
      >
        <div className="text-center">
          <div className={cn(
            "w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1",
            selectedCategory === 'all' ? "bg-indigo-500" : "bg-slate-200"
          )}>
            <HelpCircle className={cn("w-4 h-4", selectedCategory === 'all' ? "text-white" : "text-slate-600")} />
          </div>
          <div className={cn(
            "text-lg font-bold",
            selectedCategory === 'all' ? "text-indigo-700" : "text-slate-700"
          )}>
            {totalQuestions}
          </div>
          <div className="text-xs text-slate-500 truncate">All</div>
        </div>
      </Card>

      {/* Individual topic cards */}
      {Object.entries(TOPIC_CONFIG).map(([key, config]) => {
        const Icon = config.icon;
        const count = categoryCounts[key] || 0;
        const isSelected = selectedCategory === key;

        return (
          <Card
            key={key}
            onClick={() => onCategorySelect(key)}
            className={cn(
              "p-3 cursor-pointer transition-all hover:shadow-md border-2",
              isSelected 
                ? `border-current ${config.lightBg} shadow-md ${config.textColor}` 
                : "border-transparent hover:border-slate-200"
            )}
          >
            <div className="text-center">
              <div className={cn(
                "w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1",
                isSelected ? config.color : "bg-slate-100"
              )}>
                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-500")} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                isSelected ? config.textColor : "text-slate-700"
              )}>
                {count}
              </div>
              <div className="text-xs text-slate-500 truncate">{config.label}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}