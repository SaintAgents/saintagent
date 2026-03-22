import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Mail, Sparkles, RefreshCcw, AlertTriangle,
  CheckCircle2, Clock, ArrowUp, ArrowRight, ArrowDown, Zap
} from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import PlanTaskCard from '@/components/planner/PlanTaskCard';

export default function DailyPlanner() {
  const [generating, setGenerating] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dailyPlan'],
    queryFn: async () => {
      setGenerating(true);
      try {
        const res = await base44.functions.invoke('getDailyPlan', {});
        return res.data;
      } finally {
        setGenerating(false);
      }
    },
    staleTime: 600000,
    refetchOnWindowFocus: false,
    retry: false
  });

  const plan = data?.plan;
  const raw = data?.raw;
  const loading = isLoading || generating || isFetching;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden bg-gradient-to-br from-[#051C2C] via-blue-900 to-violet-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F0F2F5]" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center max-w-3xl px-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <Zap className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'serif' }}>
                AI Daily Planner
              </h1>
            </div>
            <p className="text-blue-200/90 text-base">
              Your calendar events and emails, summarized into a prioritized action plan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        {raw && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{raw.calendarEvents?.length || 0}</p>
                <p className="text-xs text-slate-500">Upcoming Events</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-amber-50 p-2.5 rounded-lg">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{raw.emailCount || 0}</p>
                <p className="text-xs text-slate-500">Unread Emails</p>
              </div>
            </div>
          </div>
        )}

        {/* Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {data?.generatedAt && (
              <p className="text-xs text-slate-500">
                Generated {new Date(data.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Regenerate Plan'}
          </Button>
        </div>

        {/* Loading State */}
        {loading && !plan && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Analyzing your calendar & emails...</p>
            <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Plan Content */}
        {plan && (
          <div className="space-y-6">
            {/* Summary */}
            {plan.summary && (
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <h2 className="font-semibold text-slate-900">Today's Overview</h2>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{plan.summary}</p>
              </div>
            )}

            {/* High Priority */}
            {plan.high_priority?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUp className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-slate-900">High Priority</h3>
                  <Badge className="bg-red-100 text-red-700 text-xs">{plan.high_priority.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plan.high_priority.map((task, i) => (
                    <PlanTaskCard key={i} task={task} priority="high" />
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority */}
            {plan.medium_priority?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900">Medium Priority</h3>
                  <Badge className="bg-amber-100 text-amber-700 text-xs">{plan.medium_priority.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plan.medium_priority.map((task, i) => (
                    <PlanTaskCard key={i} task={task} priority="medium" />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {plan.low_priority?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDown className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-slate-900">Low Priority</h3>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{plan.low_priority.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plan.low_priority.map((task, i) => (
                    <PlanTaskCard key={i} task={task} priority="low" />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Tasks */}
            {plan.suggested_tasks?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-slate-900">AI Suggested Tasks</h3>
                </div>
                <div className="space-y-3">
                  {plan.suggested_tasks.map((task, i) => (
                    <div key={i} className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                      <p className="font-medium text-sm text-slate-900">{task.task}</p>
                      <p className="text-xs text-slate-500 mt-1">{task.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}