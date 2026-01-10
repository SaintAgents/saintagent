import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, ChevronRight, ChevronLeft, Gift, Check } from "lucide-react";

// MBTI Questions - simplified assessment
const MBTI_QUESTIONS = [
  // E vs I (4 questions)
  { id: 1, dimension: 'EI', text: "At a party, you tend to:", a: "Interact with many, including strangers", b: "Interact with a few people you know well" },
  { id: 2, dimension: 'EI', text: "You feel more energized after:", a: "Spending time with a group of people", b: "Spending time alone or with one close friend" },
  { id: 3, dimension: 'EI', text: "When working on a project, you prefer:", a: "Brainstorming with others", b: "Working through ideas on your own first" },
  { id: 4, dimension: 'EI', text: "In conversations, you usually:", a: "Think out loud and talk things through", b: "Think before speaking" },
  
  // S vs N (4 questions)
  { id: 5, dimension: 'SN', text: "You are more interested in:", a: "What is actual and present", b: "What is possible and future" },
  { id: 6, dimension: 'SN', text: "You prefer to learn:", a: "Through hands-on experience and facts", b: "Through concepts, theories, and patterns" },
  { id: 7, dimension: 'SN', text: "When solving problems, you focus on:", a: "Practical, proven solutions", b: "Innovative, creative approaches" },
  { id: 8, dimension: 'SN', text: "You tend to remember:", a: "Specific facts and details", b: "The big picture and impressions" },
  
  // T vs F (4 questions)
  { id: 9, dimension: 'TF', text: "When making decisions, you primarily consider:", a: "Logic and objective analysis", b: "Personal values and how others feel" },
  { id: 10, dimension: 'TF', text: "You value being:", a: "Fair and consistent", b: "Compassionate and understanding" },
  { id: 11, dimension: 'TF', text: "In disagreements, you tend to:", a: "Focus on finding the truth", b: "Focus on maintaining harmony" },
  { id: 12, dimension: 'TF', text: "You are more satisfied when:", a: "You've achieved a goal efficiently", b: "You've helped someone or connected deeply" },
  
  // J vs P (4 questions)
  { id: 13, dimension: 'JP', text: "You prefer your life to be:", a: "Planned and organized", b: "Flexible and spontaneous" },
  { id: 14, dimension: 'JP', text: "Deadlines make you feel:", a: "Motivated to finish early", b: "Energized as they approach" },
  { id: 15, dimension: 'JP', text: "You prefer to:", a: "Make decisions and move on", b: "Keep options open" },
  { id: 16, dimension: 'JP', text: "Your workspace is usually:", a: "Neat and organized", b: "More casual with things in progress" },
];

const MBTI_DESCRIPTIONS = {
  INTJ: "The Architect - Strategic and independent thinkers with a plan for everything.",
  INTP: "The Logician - Innovative inventors with an unquenchable thirst for knowledge.",
  ENTJ: "The Commander - Bold, imaginative leaders who always find a way.",
  ENTP: "The Debater - Smart and curious thinkers who cannot resist an intellectual challenge.",
  INFJ: "The Advocate - Quiet and mystical, yet inspiring idealists.",
  INFP: "The Mediator - Poetic, kind, and altruistic, always eager to help a good cause.",
  ENFJ: "The Protagonist - Charismatic and inspiring leaders who mesmerize their listeners.",
  ENFP: "The Campaigner - Enthusiastic, creative, and sociable free spirits.",
  ISTJ: "The Logistician - Practical and fact-minded individuals, whose reliability cannot be doubted.",
  ISFJ: "The Defender - Very dedicated and warm protectors, always ready to defend loved ones.",
  ESTJ: "The Executive - Excellent administrators, unsurpassed at managing things or people.",
  ESFJ: "The Consul - Extraordinarily caring, social, and popular, always eager to help.",
  ISTP: "The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.",
  ISFP: "The Adventurer - Flexible and charming artists, always ready to explore something new.",
  ESTP: "The Entrepreneur - Smart, energetic, and very perceptive people who truly enjoy living on the edge.",
  ESFP: "The Entertainer - Spontaneous, energetic, and enthusiastic entertainers—life is never boring around them.",
};

export default function MBTIAssessment({ profile, onComplete, onSkip }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const question = MBTI_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const calculateMBTI = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    MBTI_QUESTIONS.forEach((q) => {
      const answer = answers[q.id];
      if (answer === 'a') {
        scores[q.dimension[0]]++;
      } else if (answer === 'b') {
        scores[q.dimension[1]]++;
      }
    });

    const type = 
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');

    return type;
  };

  const handleNext = () => {
    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const mbtiType = calculateMBTI();
      setResult(mbtiType);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSave = async () => {
    if (!result || !profile?.id) return;
    
    setSaving(true);
    try {
      // Update user profile with MBTI type
      await base44.entities.UserProfile.update(profile.id, {
        mbti_type: result
      });

      // Award GGG for completing MBTI assessment
      const existingTransactions = await base44.entities.GGGTransaction.filter({
        user_id: profile.user_id,
        reason_code: 'mbti_completion'
      });

      // Only award if not already awarded
      if (existingTransactions.length === 0) {
        const currentBalance = profile.ggg_balance || 0;
        const gggReward = 0.0500000; // $7.25 USD worth of GGG
        
        await base44.entities.GGGTransaction.create({
          user_id: profile.user_id,
          source_type: 'reward',
          delta: gggReward,
          reason_code: 'mbti_completion',
          description: 'Completed MBTI personality assessment',
          balance_after: currentBalance + gggReward
        });

        // Update profile balance
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: currentBalance + gggReward
        });
      }

      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error saving MBTI:', error);
    } finally {
      setSaving(false);
    }
  };

  // Show result screen
  if (result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Your MBTI Type</CardTitle>
          <CardDescription>Based on your responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-violet-600 mb-2">{result}</div>
            <p className="text-slate-600">{MBTI_DESCRIPTIONS[result]}</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-amber-800">0.0500000 GGG (USD $7.25) Reward!</div>
                <div className="text-sm text-amber-700">You'll receive 0.0500000 GGG (USD $7.25) for completing this assessment</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <div className="font-semibold text-violet-800">Better Matches Unlocked</div>
                <div className="text-sm text-violet-700">
                  Your MBTI type will now be used to improve compatibility scoring with other members, 
                  helping you find more meaningful connections.
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setResult(null);
                setCurrentQuestion(0);
                setAnswers({});
              }}
            >
              Retake Assessment
            </Button>
            <Button 
              className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save & Claim Reward
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show question screen
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            MBTI Assessment
          </Badge>
          <Badge className="bg-amber-100 text-amber-700 gap-1">
            <Gift className="w-3 h-3" />
            Earn 0.0500000 GGG (USD $7.25)
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Question {currentQuestion + 1} of {MBTI_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">{question.text}</h3>
          
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              answers[question.id] === 'a' 
                ? 'border-violet-500 bg-violet-50' 
                : 'border-slate-200 hover:border-violet-300'
            }`}>
              <RadioGroupItem value="a" id={`q${question.id}-a`} />
              <Label htmlFor={`q${question.id}-a`} className="flex-1 cursor-pointer text-left">
                {question.a}
              </Label>
            </div>
            <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              answers[question.id] === 'b' 
                ? 'border-violet-500 bg-violet-50' 
                : 'border-slate-200 hover:border-violet-300'
            }`}>
              <RadioGroupItem value="b" id={`q${question.id}-b`} />
              <Label htmlFor={`q${question.id}-b`} className="flex-1 cursor-pointer text-left">
                {question.b}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {onSkip && currentQuestion === 0 && (
            <Button variant="ghost" onClick={onSkip} className="text-slate-500">
              Skip for now
            </Button>
          )}
          
          <Button 
            onClick={handleNext}
            disabled={!answers[question.id]}
            className="bg-violet-600 hover:bg-violet-700 gap-1"
          >
            {currentQuestion === MBTI_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}