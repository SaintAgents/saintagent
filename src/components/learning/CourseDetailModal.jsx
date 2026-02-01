import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen, Clock, Users, Coins, Award, CheckCircle2, Circle, Play,
  FileText, Video, HelpCircle, Dumbbell, ChevronRight, Trophy, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const MODULE_ICONS = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  exercise: Dumbbell,
};

export default function CourseDetailModal({ course, open, onClose, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState(null);

  const { data: myProgress } = useQuery({
    queryKey: ['courseProgress', course?.id, currentUser?.email],
    queryFn: async () => {
      const progress = await base44.entities.LearningProgress.filter({ 
        user_id: currentUser.email, 
        course_id: course.id 
      });
      return progress?.[0];
    },
    enabled: !!course?.id && !!currentUser?.email
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      // Create progress record
      await base44.entities.LearningProgress.create({
        user_id: currentUser.email,
        course_id: course.id,
        course_title: course.title,
        status: 'enrolled',
        started_at: new Date().toISOString(),
        completed_modules: [],
        progress_percent: 0,
        ggg_earned: 0,
        rp_earned: 0
      });
      // Update enrollment count
      await base44.entities.Course.update(course.id, {
        enrollment_count: (course.enrollment_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
      queryClient.invalidateQueries({ queryKey: ['myLearningProgress'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Enrolled successfully! Start learning now.');
    }
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      const module = course.modules?.find(m => m.id === moduleId);
      if (!module) return;

      const completedModules = [...(myProgress?.completed_modules || [])];
      if (completedModules.includes(moduleId)) return; // Already completed
      
      completedModules.push(moduleId);
      const totalModules = course.modules?.length || 1;
      const progressPercent = Math.round((completedModules.length / totalModules) * 100);
      const isCompleted = completedModules.length === totalModules;

      // Calculate rewards
      const moduleReward = module.ggg_reward || 0.01;
      let totalGGGEarned = (myProgress?.ggg_earned || 0) + moduleReward;
      let totalRPEarned = myProgress?.rp_earned || 0;

      // If course completed, add completion bonus
      if (isCompleted) {
        totalGGGEarned += course.total_ggg_reward || 0.1;
        totalRPEarned += course.rp_reward || 5;
      }

      // Update progress
      await base44.entities.LearningProgress.update(myProgress.id, {
        completed_modules: completedModules,
        progress_percent: progressPercent,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null,
        ggg_earned: totalGGGEarned,
        rp_earned: totalRPEarned,
        last_module_id: moduleId
      });

      // Update user profile with rewards
      if (profile) {
        const newGGGBalance = (profile.ggg_balance || 0) + moduleReward + (isCompleted ? (course.total_ggg_reward || 0.1) : 0);
        const newRPPoints = (profile.rp_points || 0) + (isCompleted ? (course.rp_reward || 5) : 0);
        
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: newGGGBalance,
          rp_points: newRPPoints
        });

        // Create GGG transaction
        await base44.entities.GGGTransaction.create({
          user_id: currentUser.email,
          delta: moduleReward + (isCompleted ? (course.total_ggg_reward || 0.1) : 0),
          reason_code: isCompleted ? 'class_final' : 'module_complete',
          description: isCompleted ? `Completed course: ${course.title}` : `Completed module: ${module.title}`,
          balance_after: newGGGBalance,
          source_type: 'reward'
        });
      }

      // Update course completion count if completed
      if (isCompleted) {
        await base44.entities.Course.update(course.id, {
          completion_count: (course.completion_count || 0) + 1
        });
      }

      return { isCompleted, moduleReward };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
      queryClient.invalidateQueries({ queryKey: ['myLearningProgress'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (result?.isCompleted) {
        toast.success(`🎉 Course completed! +${(course.total_ggg_reward || 0.1).toFixed(2)} GGG bonus!`);
      } else {
        toast.success(`Module completed! +${(result?.moduleReward || 0.01).toFixed(2)} GGG`);
      }
    }
  });

  if (!course) return null;

  const isEnrolled = !!myProgress;
  const isCompleted = myProgress?.status === 'completed';
  const completedModules = myProgress?.completed_modules || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header Image */}
        <div className="relative h-48 overflow-hidden shrink-0">
          <img
            src={course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop`}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-white/20 text-white backdrop-blur">{course.category}</Badge>
              <Badge className="bg-white/20 text-white backdrop-blur">{course.difficulty}</Badge>
            </div>
            <h2 className="text-xl font-bold text-white">{course.title}</h2>
          </div>
          {isCompleted && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Completed
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          {/* Description */}
          <p className="text-slate-600 mb-4">{course.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-medium">{course.duration_minutes || 60}m</p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-medium">{course.modules?.length || 0}</p>
              <p className="text-xs text-slate-500">Modules</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <Coins className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-emerald-600">+{course.total_ggg_reward || 0.1}</p>
              <p className="text-xs text-slate-500">GGG Reward</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-purple-600">+{course.rp_reward || 5}</p>
              <p className="text-xs text-slate-500">RP Reward</p>
            </div>
          </div>

          {/* Progress */}
          {isEnrolled && (
            <div className="mb-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-violet-700">Your Progress</span>
                <span className="text-sm text-violet-600">{myProgress?.progress_percent || 0}%</span>
              </div>
              <Progress value={myProgress?.progress_percent || 0} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-violet-600">
                <span>{completedModules.length}/{course.modules?.length || 0} modules completed</span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" /> {(myProgress?.ggg_earned || 0).toFixed(2)} GGG earned
                </span>
              </div>
            </div>
          )}

          {/* Modules */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Course Modules
            </h3>
            <div className="space-y-2">
              {(course.modules || []).map((module, idx) => {
                const ModuleIcon = MODULE_ICONS[module.content_type] || FileText;
                const isModuleCompleted = completedModules.includes(module.id);
                
                return (
                  <div
                    key={module.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isModuleCompleted 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : isEnrolled 
                          ? 'bg-white border-slate-200 hover:border-violet-300 cursor-pointer' 
                          : 'bg-slate-50 border-slate-200'
                    }`}
                    onClick={() => isEnrolled && !isModuleCompleted && setActiveModule(module)}
                  >
                    <div className={`p-2 rounded-lg ${isModuleCompleted ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      {isModuleCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ModuleIcon className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isModuleCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {idx + 1}. {module.title}
                      </p>
                      <p className="text-xs text-slate-500">{module.duration_minutes || 10}min • {module.content_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-medium">+{module.ggg_reward || 0.01} GGG</span>
                      {isEnrolled && !isModuleCompleted && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-slate-50 shrink-0">
          {!isEnrolled ? (
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
            >
              <Sparkles className="w-4 h-4" />
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now - Free'}
            </Button>
          ) : isCompleted ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                <Trophy className="w-5 h-5" />
                Course Completed! You earned {myProgress?.ggg_earned?.toFixed(2)} GGG
              </div>
            </div>
          ) : (
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={() => {
                // Find next incomplete module
                const nextModule = course.modules?.find(m => !completedModules.includes(m.id));
                if (nextModule) setActiveModule(nextModule);
              }}
            >
              <Play className="w-4 h-4" />
              Continue Learning
            </Button>
          )}
        </div>

        {/* Module Content Modal */}
        {activeModule && (
          <Dialog open={!!activeModule} onOpenChange={() => setActiveModule(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{activeModule.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-600 mb-4">{activeModule.description || 'Complete this module to earn rewards.'}</p>
                {activeModule.content_url && (
                  <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    {activeModule.content_type === 'video' ? (
                      <video src={activeModule.content_url} controls className="w-full h-full rounded-lg" />
                    ) : (
                      <a href={activeModule.content_url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                        View Content
                      </a>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-emerald-700">Complete to earn:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> +{activeModule.ggg_reward || 0.01} GGG
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setActiveModule(null)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    completeModuleMutation.mutate(activeModule.id);
                    setActiveModule(null);
                  }}
                  disabled={completeModuleMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}