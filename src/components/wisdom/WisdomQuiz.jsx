import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { callWisdom, errorText } from '@/components/wisdom/wisdomCards';

export default function WisdomQuiz({ card, close, refresh }) {
  const [quiz,setQuiz] = useState(() => card.quiz_ready && card.quiz?.length ? { questions:card.quiz,version:card.quiz_generated_at } : null);
  const [answers,setAnswers] = useState([]);
  const [step,setStep] = useState(0);
  const [busy,setBusy] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [done,setDone] = useState(false);
  const generate = async () => {
    setBusy(true); setError('');
    try { const result = await callWisdom('generate',{ id:card.id }); setQuiz({ questions:result.quiz,version:result.version }); refresh(); }
    catch (err) { setError(errorText(err,'Could not generate a quiz. Please try again.')); }
    finally { setBusy(false); }
  };
  const finish = async () => {
    setDone(true); setSaving(true);
    try { await callWisdom('score',{ id:card.id,answers,version:quiz.version }); refresh(); }
    catch { setError('Your result is shown below, but this attempt could not be saved.'); }
    finally { setSaving(false); }
  };
  const question = quiz?.questions[step];
  const answered = answers[step] !== undefined;
  const correct = done ? quiz.questions.filter((q,i) => q.correct_index === answers[i]).length : 0;
  return <Dialog open onOpenChange={open => { if (!open && !busy) close(); }}><DialogContent hideCloseButton={busy} data-readable-surface className="max-h-[85dvh] max-w-xl overflow-y-auto">
    <DialogHeader><DialogTitle>{quiz ? 'Wisdom quiz' : 'Make a quiz'}</DialogTitle><DialogDescription>{card.title}</DialogDescription></DialogHeader>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!quiz ? <><p className="text-sm">Generate five questions based on this card’s insight.</p><Button disabled={busy} onClick={generate}>{busy ? 'Generating…' : error ? 'Retry generation' : 'Generate quiz'}</Button></> : done ? <>
      <p className="text-lg font-semibold" role="status">Score: {correct} of {quiz.questions.length} ({Math.round(100 * correct / quiz.questions.length)}%)</p>
      {saving && <p className="text-sm">Saving attempt…</p>}
      <div className="flex gap-2"><Button variant="outline" disabled={saving} onClick={() => { setDone(false); setStep(0); setAnswers([]); setError(''); }}>Retry</Button><Button onClick={close}>Finish</Button></div>
    </> : <><p className="text-sm">Question {step + 1} of {quiz.questions.length}</p><h3 className="font-semibold">{question.question}</h3>
      <div className="grid gap-2">{question.options.map((option,index) => <Button key={index} variant="outline" className="h-auto justify-start whitespace-normal text-left" disabled={answered} onClick={() => setAnswers(prev => prev.length === step ? [...prev,index] : prev)}>{option}{answered && (index === question.correct_index ? ' ✓ Correct answer' : index === answers[step] ? ' · Your answer' : '')}</Button>)}</div>
      {answered && <p role="status" className="rounded-lg border p-3 text-sm">{question.explanation}</p>}
      <Button disabled={!answered} onClick={step + 1 === quiz.questions.length ? finish : () => setStep(step + 1)}>{step + 1 === quiz.questions.length ? 'See score' : 'Next question'}</Button>
    </>}
  </DialogContent></Dialog>;
}