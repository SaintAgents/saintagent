import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    category: 'Trust & Ethics',
    question: 'What should you do if a user reports a mission conflict?',
    options: [
      { id: 'a', text: 'Ignore it if it seems minor', correct: false },
      { id: 'b', text: 'Listen to both sides and mediate fairly', correct: true },
      { id: 'c', text: 'Automatically side with the highest-ranked member', correct: false },
      { id: 'd', text: 'Remove both parties immediately', correct: false }
    ]
  },
  {
    id: 'q2',
    category: 'Marketplace Fairness',
    question: 'When is it okay to offer boosted rewards?',
    options: [
      { id: 'a', text: 'Only to your friends', correct: false },
      { id: 'b', text: 'Never, all rewards should be equal', correct: false },
      { id: 'c', text: 'When aligned with mission objectives and transparent to all', correct: true },
      { id: 'd', text: 'Whenever you want as a leader', correct: false }
    ]
  },
  {
    id: 'q3',
    category: 'Agent Safety',
    question: 'If an agent begins acting erratically, what is your first step?',
    options: [
      { id: 'a', text: 'Shut it down immediately and report to security team', correct: true },
      { id: 'b', text: 'Continue using it to see what happens', correct: false },
      { id: 'c', text: 'Share it with others to test', correct: false },
      { id: 'd', text: 'Ignore it and switch to another agent', correct: false }
    ]
  },
  {
    id: 'q4',
    category: 'Leadership',
    question: 'What is the most important quality of a leader in SaintAgent?',
    options: [
      { id: 'a', text: 'Having the most GGG', correct: false },
      { id: 'b', text: 'Being the most popular', correct: false },
      { id: 'c', text: 'Serving the community with integrity and transparency', correct: true },
      { id: 'd', text: 'Having the most badges', correct: false }
    ]
  },
  {
    id: 'q5',
    category: 'Mission Management',
    question: 'How should you handle a team member who is not contributing to a mission?',
    options: [
      { id: 'a', text: 'Remove them immediately without discussion', correct: false },
      { id: 'b', text: 'Reach out privately, understand their situation, and offer support', correct: true },
      { id: 'c', text: 'Publicly shame them in the mission channel', correct: false },
      { id: 'd', text: 'Do nothing and hope they improve', correct: false }
    ]
  },
  {
    id: 'q6',
    category: 'Community Values',
    question: 'What does "servant leadership" mean in the context of SaintAgent?',
    options: [
      { id: 'a', text: 'Leaders should be served by their followers', correct: false },
      { id: 'b', text: 'Leaders prioritize the growth and well-being of their community', correct: true },
      { id: 'c', text: 'Leaders should work for free', correct: false },
      { id: 'd', text: 'Leaders should do everything themselves', correct: false }
    ]
  },
  {
    id: 'q7',
    category: 'Conflict Resolution',
    question: 'Two members are arguing in a mission thread. What do you do?',
    options: [
      { id: 'a', text: 'Delete all their messages', correct: false },
      { id: 'b', text: 'Let them work it out themselves', correct: false },
      { id: 'c', text: 'Step in calmly, acknowledge both perspectives, and guide toward resolution', correct: true },
      { id: 'd', text: 'Ban both of them from the mission', correct: false }
    ]
  },
  {
    id: 'q8',
    category: 'GGG Economy',
    question: 'What is the purpose of the GGG reward system?',
    options: [
      { id: 'a', text: 'To make leaders rich', correct: false },
      { id: 'b', text: 'To incentivize positive contributions and align community value', correct: true },
      { id: 'c', text: 'To replace traditional money completely', correct: false },
      { id: 'd', text: 'To create competition between members', correct: false }
    ]
  },
  {
    id: 'q9',
    category: 'Transparency',
    question: 'How should leaders communicate important decisions?',
    options: [
      { id: 'a', text: 'Keep decisions private to maintain authority', correct: false },
      { id: 'b', text: 'Share openly with clear reasoning and invite feedback', correct: true },
      { id: 'c', text: 'Only tell trusted inner circle', correct: false },
      { id: 'd', text: 'Make decisions without explanation', correct: false }
    ]
  },
  {
    id: 'q10',
    category: 'Alignment',
    question: 'What does "144-sequence alignment" represent?',
    options: [
      { id: 'a', text: 'A random number for badges', correct: false },
      { id: 'b', text: 'The 144,000 lightworkers aligned with higher consciousness', correct: true },
      { id: 'c', text: 'The maximum number of leaders allowed', correct: false },
      { id: 'd', text: 'A technical version number', correct: false }
    ]
  }
];

const PASSING_SCORE = 80;

export default function LeaderQuizModal({ open, onClose, profile }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async ({ score, passed }) => {
      const canRetryAfter = new Date();
      canRetryAfter.setDate(canRetryAfter.getDate() + 7);

      return base44.entities.LeaderQuizAttempt.create({
        user_id: profile.user_id,
        score,
        passed,
        answers,
        can_retry_after: passed ? null : canRetryAfter.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempts'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleAnswer = (questionId, answerId) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    QUIZ_QUESTIONS.forEach(q => {
      const userAnswer = answers[q.id];
      const correctOption = q.options.find(o => o.correct);
      if (userAnswer === correctOption.id) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    submitMutation.mutate({
      score: finalScore,
      passed: finalScore >= PASSING_SCORE
    });
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  if (showResults) {
    const passed = score >= PASSING_SCORE;
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8 space-y-4">
            {passed ? (
              <>
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold text-green-900">Congratulations!</h3>
                <p className="text-lg">You scored {score}%</p>
                <p className="text-slate-600">You've passed the leadership quiz. Your application will now be reviewed for final approval.</p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <h3 className="text-2xl font-bold text-red-900">Not Quite There</h3>
                <p className="text-lg">You scored {score}%</p>
                <p className="text-slate-600">You need {PASSING_SCORE}% to pass. You can retry after 7 days. Consider reviewing leadership principles and seeking mentorship.</p>
              </>
            )}
            
            <Button onClick={onClose} className="w-full rounded-xl">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            Leadership Quiz - Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}% Complete</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                {currentQ.category}
              </span>
              <h3 className="text-lg font-semibold mt-2">{currentQ.question}</h3>
            </div>

            <RadioGroup
              value={answers[currentQ.id]}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <div 
                    key={option.id}
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-violet-300",
                      answers[currentQ.id] === option.id 
                        ? "border-violet-500 bg-violet-50" 
                        : "border-slate-200 bg-white"
                    )}
                    onClick={() => handleAnswer(currentQ.id, option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== QUIZ_QUESTIONS.length || submitMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQ.id]}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}