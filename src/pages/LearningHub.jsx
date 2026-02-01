import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen, GraduationCap, Trophy, Star, Clock, Users, Search,
  Play, CheckCircle, Lock, Sparkles, Target, Brain, Heart,
  Compass, Palette, Wrench, Leaf, ChevronRight, Award, Coins
} from 'lucide-react';

const CATEGORY_CONFIG = {
  spiritual_growth: { icon: Heart, label: 'Spiritual Growth', color: 'text-purple-600 bg-purple-100' },
  platform_mastery: { icon: Compass, label: 'Platform Mastery', color: 'text-blue-600 bg-blue-100' },
  collaboration: { icon: Users, label: 'Collaboration', color: 'text-emerald-600 bg-emerald-100' },
  leadership: { icon: Target, label: 'Leadership', color: 'text-amber-600 bg-amber-100' },
  technical: { icon: Wrench, label: 'Technical', color: 'text-slate-600 bg-slate-100' },
  wellness: { icon: Leaf, label: 'Wellness', color: 'text-green-600 bg-green-100' },
  creativity: { icon: Palette, label: 'Creativity', color: 'text-pink-600 bg-pink-100' }
};

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' }
};

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('discover');
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

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }, '-created_date', 100)
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['learningProgress', currentUser?.email],
    queryFn: () => base44.entities.LearningProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId) => {
      await base44.entities.LearningProgress.create({
        user_id: currentUser.email,
        course_id: courseId,
        status: 'enrolled',
        started_at: new Date().toISOString(),
        progress_percent: 0
      });
      // Update enrollment count
      const course = courses.find(c => c.id === courseId);
      if (course) {
        await base44.entities.Course.update(courseId, {
          enrollment_count: (course.enrollment_count || 0) + 1
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learningProgress'] })
  });

  // Create progress map
  const progressMap = {};
  myProgress.forEach(p => { progressMap[p.course_id] = p; });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // My courses (enrolled or completed)
  const myCourses = courses.filter(c => progressMap[c.id]);
  const completedCourses = myCourses.filter(c => progressMap[c.id]?.status === 'completed');
  const inProgressCourses = myCourses.filter(c => progressMap[c.id]?.status !== 'completed');

  // Calculate stats
  const totalGGGEarned = myProgress.reduce((sum, p) => sum + (p.ggg_earned || 0), 0);
  const totalRPEarned = myProgress.reduce((sum, p) => sum + (p.rp_earned || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-violet-600" />
              Learning Hub
            </h1>
            <p className="text-slate-600 mt-1">Expand your knowledge and earn rewards</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-3">
            <Card className="px-4 py-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600">GGG Earned</p>
                  <p className="font-bold text-emerald-700">{totalGGGEarned.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-xs text-violet-600">Completed</p>
                  <p className="font-bold text-violet-700">{completedCourses.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 p-1">
            <TabsTrigger value="discover" className="gap-2">
              <Compass className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="my-learning" className="gap-2">
              <BookOpen className="w-4 h-4" />
              My Learning
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4 mt-4">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="gap-1"
                  >
                    <config.icon className="w-3 h-3" />
                    <span className="hidden md:inline">{config.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Featured Courses */}
            {filteredCourses.filter(c => c.is_featured).length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.filter(c => c.is_featured).map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={progressMap[course.id]}
                      onEnroll={() => enrollMutation.mutate(course.id)}
                      enrolling={enrollMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Courses */}
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-800">All Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.filter(c => !c.is_featured).map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progressMap[course.id]}
                    onEnroll={() => enrollMutation.mutate(course.id)}
                    enrolling={enrollMutation.isPending}
                  />
                ))}
              </div>
              {filteredCourses.length === 0 && (
                <Card className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No courses found</p>
                  <p className="text-sm text-slate-400 mt-1">Check back soon for new content!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Learning Tab */}
          <TabsContent value="my-learning" className="space-y-4 mt-4">
            {inProgressCourses.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-500" />
                  In Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={progressMap[course.id]}
                      showProgress
                    />
                  ))}
                </div>
              </div>
            )}

            {completedCourses.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Completed
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={progressMap[course.id]}
                      showProgress
                    />
                  ))}
                </div>
              </div>
            )}

            {myCourses.length === 0 && (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">You haven't enrolled in any courses yet</p>
                <Button className="mt-4" onClick={() => setActiveTab('discover')}>
                  Browse Courses
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AchievementCard
                title="First Steps"
                description="Complete your first course"
                icon={<BookOpen className="w-6 h-6" />}
                unlocked={completedCourses.length >= 1}
                progress={Math.min(completedCourses.length, 1)}
                target={1}
              />
              <AchievementCard
                title="Knowledge Seeker"
                description="Complete 5 courses"
                icon={<Brain className="w-6 h-6" />}
                unlocked={completedCourses.length >= 5}
                progress={Math.min(completedCourses.length, 5)}
                target={5}
              />
              <AchievementCard
                title="Master Scholar"
                description="Complete 10 courses"
                icon={<GraduationCap className="w-6 h-6" />}
                unlocked={completedCourses.length >= 10}
                progress={Math.min(completedCourses.length, 10)}
                target={10}
              />
              <AchievementCard
                title="GGG Earner"
                description="Earn 1 GGG from learning"
                icon={<Coins className="w-6 h-6" />}
                unlocked={totalGGGEarned >= 1}
                progress={Math.min(totalGGGEarned, 1)}
                target={1}
              />
              <AchievementCard
                title="Dedicated Learner"
                description="Complete courses in 3 categories"
                icon={<Star className="w-6 h-6" />}
                unlocked={new Set(completedCourses.map(c => c.category)).size >= 3}
                progress={new Set(completedCourses.map(c => c.category)).size}
                target={3}
              />
              <AchievementCard
                title="Challenge Accepted"
                description="Complete an advanced course"
                icon={<Target className="w-6 h-6" />}
                unlocked={completedCourses.some(c => c.difficulty === 'advanced')}
                progress={completedCourses.filter(c => c.difficulty === 'advanced').length}
                target={1}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CourseCard({ course, progress, onEnroll, enrolling, showProgress }) {
  const category = CATEGORY_CONFIG[course.category] || CATEGORY_CONFIG.platform_mastery;
  const difficulty = DIFFICULTY_CONFIG[course.difficulty] || DIFFICULTY_CONFIG.beginner;
  const CategoryIcon = category.icon;
  const isEnrolled = !!progress;
  const isCompleted = progress?.status === 'completed';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-32 bg-gradient-to-br from-violet-100 to-indigo-100">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon className="w-12 h-12 text-violet-300" />
          </div>
        )}
        {course.is_featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={category.color}>
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category.label}
          </Badge>
          <Badge variant="outline" className={difficulty.color}>
            {difficulty.label}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration_minutes || 30} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.enrollment_count || 0}
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Coins className="w-4 h-4" />
            +{course.ggg_reward || 0.05} GGG
          </span>
        </div>

        {showProgress && progress && !isCompleted && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{progress.progress_percent || 0}%</span>
            </div>
            <Progress value={progress.progress_percent || 0} className="h-2" />
          </div>
        )}

        <div className="pt-2">
          {isCompleted ? (
            <Link to={createPageUrl('CourseDetail') + `?id=${course.id}`}>
              <Button variant="outline" className="w-full gap-2">
                <Award className="w-4 h-4" />
                View Certificate
              </Button>
            </Link>
          ) : isEnrolled ? (
            <Link to={createPageUrl('CourseDetail') + `?id=${course.id}`}>
              <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                <Play className="w-4 h-4" />
                Continue Learning
              </Button>
            </Link>
          ) : (
            <Button 
              className="w-full gap-2" 
              onClick={onEnroll}
              disabled={enrolling}
            >
              <BookOpen className="w-4 h-4" />
              Enroll Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ title, description, icon, unlocked, progress, target }) {
  return (
    <Card className={`p-4 ${unlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{progress}/{target}</span>
            </div>
            <Progress value={(progress / target) * 100} className="h-1.5" />
          </div>
        </div>
        {unlocked && (
          <Trophy className="w-5 h-5 text-amber-500" />
        )}
      </div>
    </Card>
  );
}