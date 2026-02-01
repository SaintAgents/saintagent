import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Coins, Star, CheckCircle2, Play } from 'lucide-react';

const CATEGORY_COLORS = {
  spiritual: 'bg-purple-100 text-purple-700',
  business: 'bg-blue-100 text-blue-700',
  tech: 'bg-cyan-100 text-cyan-700',
  wellness: 'bg-green-100 text-green-700',
  leadership: 'bg-amber-100 text-amber-700',
  creative: 'bg-pink-100 text-pink-700',
  community: 'bg-indigo-100 text-indigo-700',
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CourseCard({ course, progress, onClick, featured, showProgress }) {
  const isCompleted = progress?.status === 'completed';
  const isEnrolled = !!progress;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all overflow-hidden group ${featured ? 'ring-2 ring-amber-400' : ''}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-amber-500 text-white gap-1">
              <Star className="w-3 h-3" /> Featured
            </Badge>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <div className="bg-emerald-500 text-white p-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        )}
        {isEnrolled && !isCompleted && (
          <div className="absolute top-2 right-2">
            <div className="bg-blue-500 text-white p-1.5 rounded-full">
              <Play className="w-4 h-4" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
          <Badge className={CATEGORY_COLORS[course.category] || 'bg-slate-100 text-slate-700'}>
            {course.category}
          </Badge>
          <Badge className={DIFFICULTY_COLORS[course.difficulty] || 'bg-slate-100'}>
            {course.difficulty}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {course.description}
        </p>

        {/* Progress bar */}
        {showProgress && progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{progress.progress_percent || 0}% complete</span>
              <span>{progress.completed_modules?.length || 0}/{course.modules?.length || 0} modules</span>
            </div>
            <Progress value={progress.progress_percent || 0} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration_minutes || 60}m
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.enrollment_count || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-medium">
            <Coins className="w-3 h-3" />
            +{course.total_ggg_reward || 0.1} GGG
          </div>
        </div>
      </CardContent>
    </Card>
  );
}