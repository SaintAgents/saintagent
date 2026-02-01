import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen, GraduationCap, Trophy, Star, Clock, Users, Play,
  CheckCircle2, Circle, Coins, Search, Filter, Sparkles, Target,
  ChevronRight, Award, TrendingUp, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '@/components/hud/BackButton';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import CourseCard from '@/components/learning/CourseCard';
import CourseDetailModal from '@/components/learning/CourseDetailModal';

const CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: BookOpen },
  { id: 'spiritual', label: 'Spiritual', icon: Sparkles },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'tech', label: 'Technology', icon: Zap },
  { id: 'wellness', label: 'Wellness', icon: Target },
  { id: 'leadership', label: 'Leadership', icon: Award },
  { id: 'creative', label: 'Creative', icon: Star },
  { id: 'community', label: 'Community', icon: Users },
];

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true }, '-created_date', 100)
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['myLearningProgress', currentUser?.email],
    queryFn: () => base44.entities.LearningProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get progress for a course
  const getProgress = (courseId) => myProgress.find(p => p.course_id === courseId);

  // Stats
  const completedCourses = myProgress.filter(p => p.status === 'completed').length;
  const inProgressCourses = myProgress.filter(p => p.status === 'in_progress').length;
  const totalGGGEarned = myProgress.reduce((sum, p) => sum + (p.ggg_earned || 0), 0);
  const totalRPEarned = myProgress.reduce((sum, p) => sum + (p.rp_earned || 0), 0);

  const featuredCourses = courses.filter(c => c.is_featured);
  const myCourses = courses.filter(c => myProgress.some(p => p.course_id === c.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50/30">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-900/50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-3xl px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <GraduationCap className="w-10 h-10 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Learning Hub
              </h1>
              <LoopStartIndicator currentPage="LearningHub" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <ForwardButton currentPage="LearningHub" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <p className="text-violet-200 text-lg mt-2">
              Expand your knowledge, earn rewards, and track your growth
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 -mt-8 relative z-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur border-violet-200">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{completedCourses}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-violet-200">
            <CardContent className="p-4 text-center">
              <Play className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{inProgressCourses}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-emerald-200">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{totalGGGEarned.toFixed(2)}</p>
              <p className="text-xs text-slate-500">GGG Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-purple-200">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{totalRPEarned}</p>
              <p className="text-xs text-slate-500">RP Earned</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="browse" className="gap-2">
              <BookOpen className="w-4 h-4" /> Browse Courses
            </TabsTrigger>
            <TabsTrigger value="my-learning" className="gap-2">
              <GraduationCap className="w-4 h-4" /> My Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="w-full md:w-auto">
                <div className="flex gap-2 pb-2">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={selectedCategory === cat.id ? 'bg-violet-600' : ''}
                    >
                      <cat.icon className="w-4 h-4 mr-1" />
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Featured Courses */}
            {featuredCourses.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Featured Courses
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredCourses.slice(0, 3).map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={getProgress(course.id)}
                      onClick={() => setSelectedCourse(course)}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Courses */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {selectedCategory === 'all' ? 'All Courses' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                <span className="text-slate-400 font-normal ml-2">({filteredCourses.length})</span>
              </h2>
              {filteredCourses.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No courses found</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={getProgress(course.id)}
                      onClick={() => setSelectedCourse(course)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-learning" className="space-y-6">
            {myCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Start Your Learning Journey</h3>
                <p className="text-slate-500 mb-6">Enroll in courses to track your progress and earn rewards!</p>
                <Button onClick={() => document.querySelector('[data-state="inactive"][value="browse"]')?.click()} className="bg-violet-600 hover:bg-violet-700">
                  Browse Courses
                </Button>
              </Card>
            ) : (
              <>
                {/* In Progress */}
                {myProgress.filter(p => p.status !== 'completed').length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-500" /> Continue Learning
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myProgress.filter(p => p.status !== 'completed').map(prog => {
                        const course = courses.find(c => c.id === prog.course_id);
                        if (!course) return null;
                        return (
                          <CourseCard
                            key={course.id}
                            course={course}
                            progress={prog}
                            onClick={() => setSelectedCourse(course)}
                            showProgress
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {myProgress.filter(p => p.status === 'completed').length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Completed
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myProgress.filter(p => p.status === 'completed').map(prog => {
                        const course = courses.find(c => c.id === prog.course_id);
                        if (!course) return null;
                        return (
                          <CourseCard
                            key={course.id}
                            course={course}
                            progress={prog}
                            onClick={() => setSelectedCourse(course)}
                            showProgress
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        currentUser={currentUser}
        profile={profile}
      />
    </div>
  );
}