import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen, GraduationCap, Trophy, Star, Clock, Users, Play, 
  CheckCircle, Lock, ArrowLeft, ChevronRight, Award, Coins,
  FileText, Video, HelpCircle, Dumbbell, Heart, Compass,
  Target, Wrench, Leaf, Palette
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_CONFIG = {
  spiritual_growth: { icon: Heart, label: 'Spiritual Growth', color: 'text-purple-600 bg-purple-100' },
  platform_mastery: { icon: Compass, label: 'Platform Mastery', color: 'text-blue-600 bg-blue-100' },
  collaboration: { icon: Users, label: 'Collaboration', color: 'text-emerald-600 bg-emerald-100' },
  leadership: { icon: Target, label: 'Leadership', color: 'text-amber-600 bg-amber-100' },
  technical: { icon: Wrench, label: 'Technical', color: 'text-slate-600 bg-slate-100' },
  wellness: { icon: Leaf, label: 'Wellness', color: 'text-green-600 bg-green-100' },
  creativity: { icon: Palette, label: 'Creativity', color: 'text-pink-600 bg-pink-100' }
};

const MODULE_ICONS = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  exercise: Dumbbell
};

export default function CourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
    select: (data) => data[0]
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: progress } = useQuery({
    queryKey: ['courseProgress', courseId, currentUser?.email],
    queryFn: async () => {
      const progresses = await base44.entities.LearningProgress.filter({ 
        user_id: currentUser.email, 
        course_id: courseId 
      });
      return progresses[0];
    },
    enabled: !!currentUser?.email && !!courseId
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      if (!progress) return;
      
      const completedModules = [...(progress.completed_modules || [])];
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
      }
      
      const totalModules = course.modules?.length || 1;
      const progressPercent = Math.round((completedModules.length / totalModules) * 100);
      const isComplete = progressPercent >= 100;
      
      const updateData = {
        completed_modules: completedModules,
        progress_percent: progressPercent,
        last_module_id: moduleId,
        status: isComplete ? 'completed' : 'in_progress'
      };
      
      if (isComplete && !progress.completed_at) {
        updateData.completed_at = new Date().toISOString();
        updateData.ggg_earned = course.ggg_reward || 0.05;
        updateData.rp_earned = course.rp_reward || 5;
        
        // Award GGG
        const currentBalance = profile?.ggg_balance || 0;
        const newBalance = currentBalance + (course.ggg_reward || 0.05);
        
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: newBalance
        });
        
        await base44.entities.GGGTransaction.create({
          user_id: currentUser.email,
          delta: course.ggg_reward || 0.05,
          reason_code: 'module_complete',
          description: `Completed course: ${course.title}`,
          balance_after: newBalance,
          source_type: 'reward'
        });
        
        // Update course completion count
        await base44.entities.Course.update(course.id, {
          completion_count: (course.completion_count || 0) + 1
        });
        
        toast.success(`🎉 Course completed! +${course.ggg_reward || 0.05} GGG earned!`);
      } else {
        // Award per-module GGG if defined
        const module = course.modules?.find(m => m.id === moduleId);
        if (module?.ggg_reward && !progress.completed_modules?.includes(moduleId)) {
          const currentBalance = profile?.ggg_balance || 0;
          const newBalance = currentBalance + module.ggg_reward;
          
          await base44.entities.UserProfile.update(profile.id, {
            ggg_balance: newBalance
          });
          
          await base44.entities.GGGTransaction.create({
            user_id: currentUser.email,
            delta: module.ggg_reward,
            reason_code: 'lesson_micro',
            description: `Completed module: ${module.title}`,
            balance_after: newBalance,
            source_type: 'reward'
          });
          
          toast.success(`Module completed! +${module.ggg_reward} GGG`);
        }
      }
      
      await base44.entities.LearningProgress.update(progress.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Course not found</p>
          <Link to={createPageUrl('LearningHub')}>
            <Button className="mt-4">Back to Learning Hub</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[course.category] || CATEGORY_CONFIG.platform_mastery;
  const CategoryIcon = category.icon;
  const modules = course.modules || [];
  const activeModule = modules[activeModuleIndex];
  const completedModules = progress?.completed_modules || [];
  const isModuleCompleted = (moduleId) => completedModules.includes(moduleId);
  const isCourseComplete = progress?.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('LearningHub')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Progress value={progress?.progress_percent || 0} className="w-24 h-2" />
                <span>{progress?.progress_percent || 0}% complete</span>
              </div>
            </div>
          </div>
          {isCourseComplete && (
            <Badge className="bg-green-500 gap-1">
              <Trophy className="w-3 h-3" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module List Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Modules ({completedModules.length}/{modules.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[400px]">
                {modules.map((module, index) => {
                  const ModuleIcon = MODULE_ICONS[module.content_type] || FileText;
                  const completed = isModuleCompleted(module.id);
                  const isActive = index === activeModuleIndex;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModuleIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive ? 'bg-violet-100 border border-violet-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        completed ? 'bg-green-100 text-green-600' : 
                        isActive ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {completed ? <CheckCircle className="w-4 h-4" /> : <ModuleIcon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-1 ${completed ? 'text-green-700' : 'text-slate-700'}`}>
                          {module.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {module.duration_minutes || 5} min
                          {module.ggg_reward && ` • +${module.ggg_reward} GGG`}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {modules.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No modules yet</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {activeModule ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Module {activeModuleIndex + 1} of {modules.length}
                      </Badge>
                      <CardTitle>{activeModule.title}</CardTitle>
                      <p className="text-slate-600 mt-1">{activeModule.description}</p>
                    </div>
                    {isModuleCompleted(activeModule.id) && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Display */}
                  {activeModule.content_type === 'video' && activeModule.content_url && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={activeModule.content_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {activeModule.content_type === 'text' && (
                    <div className="prose max-w-none bg-slate-50 rounded-lg p-6">
                      <p>{activeModule.description || 'Content coming soon...'}</p>
                    </div>
                  )}

                  {/* Mark Complete Button */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {activeModule.ggg_reward && (
                        <Badge variant="outline" className="text-emerald-600">
                          <Coins className="w-3 h-3 mr-1" />
                          +{activeModule.ggg_reward} GGG
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {activeModuleIndex > 0 && (
                        <Button variant="outline" onClick={() => setActiveModuleIndex(i => i - 1)}>
                          Previous
                        </Button>
                      )}
                      {!isModuleCompleted(activeModule.id) ? (
                        <Button 
                          onClick={() => completeModuleMutation.mutate(activeModule.id)}
                          disabled={completeModuleMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      ) : activeModuleIndex < modules.length - 1 ? (
                        <Button onClick={() => setActiveModuleIndex(i => i + 1)}>
                          Next Module
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Trophy className="w-4 h-4 mr-2" />
                          Course Complete!
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8">
                <div className="text-center">
                  <CategoryIcon className="w-16 h-16 text-violet-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-slate-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_minutes || 30} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {modules.length} modules
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Coins className="w-4 h-4" />
                      +{course.ggg_reward || 0.05} GGG
                    </span>
                  </div>
                  <p className="text-slate-500">No modules have been added to this course yet.</p>
                </div>
              </Card>
            )}

            {/* Course Completion Card */}
            {isCourseComplete && (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Congratulations! 🎉</h2>
                  <p className="text-slate-600 mb-4">You've completed this course and earned:</p>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className="bg-emerald-500 text-lg px-4 py-2">
                      <Coins className="w-5 h-5 mr-2" />
                      +{progress.ggg_earned || course.ggg_reward || 0.05} GGG
                    </Badge>
                    {progress.rp_earned > 0 && (
                      <Badge className="bg-violet-500 text-lg px-4 py-2">
                        <Star className="w-5 h-5 mr-2" />
                        +{progress.rp_earned} RP
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}