import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const lessons = [
  ['SAINT Mission Intelligence','Give The Weaver a goal, a timeframe, and one constraint. Review the evidence and pick one direction: pursue existing work, learn more, or prepare a Mission.','Write a milestone with a measurable result and a target date. Save only after reading the whole plan.','mission'],
  ['Living Knowledge Graph','Search your own contact network, then follow an organization, role, or tag from a result.','A recorded connection is a lead, not an endorsement or permission to contact someone.','graph'],
  ['SAINT Deep Research Studio','Investigate a specific question. Open a citation and compare what the record actually says with the report’s interpretation.','When two sources disagree, note what fact would help settle the question.','research'],
  ['Intelligent Action Orchestrator','Use fictional meeting notes to identify commitments, possible owners, and one follow-up date. Separate confirmed decisions from suggestions.','Review each draft separately. Do not send a message or assign work until the people involved agree.','actions'],
  ['Possibility Simulator','Compare a small team that starts now with a larger team that starts after a funding delay. Change one number at a time to see what drives the result.','Write down which assumption changes your decision most, then check the stress test. The estimate is not a forecast.','simulator'],
  ['Living Purpose & Capability Profile','Open the Living Blueprint and identify one skill you can offer and one you want to develop. You choose whether to include your Blueprint in a Weaver run.','Keep private contact details and other people’s sensitive information out of your notes.','blueprint'],
  ['Global Collaboration Radar','Open the Radar and try the same topic in Emerging Needs and Available Capabilities. Check the source record before acting.','Pins mark known regions, not exact addresses. Browse the list for records without a mapped region.','radar'],
];

export default function GuideLessons() {
  const [day,setDay] = useState(0);
  const [finished,setFinished] = useState(false);
  const [name,practice,tip,tool] = lessons[day];
  return <section data-readable-surface className="space-y-3 rounded-xl border p-4" aria-labelledby="guide-lessons-title">
    <h2 id="guide-lessons-title" className="font-heading text-xl font-bold">Learn the seven My Guide functions</h2>
    {finished ? <div className="space-y-2"><p role="status">You reached the end of the seven lessons.</p><Button type="button" variant="outline" onClick={() => {setFinished(false);setDay(0);}}>Replay lessons</Button></div> : <>
      <label className="block space-y-1 text-sm">Choose a lesson<select className="block max-w-full rounded-md border border-input bg-background px-2 py-1" value={day} onChange={e => setDay(Number(e.target.value))}>{lessons.map(([title],i) => <option key={title} value={i}>{i+1}. {title}</option>)}</select></label>
      <div className="space-y-2" aria-live="polite"><h3 className="font-semibold">Lesson {day+1}: {name}</h3><p className="text-sm">{practice}</p>
        <Link className="text-sm underline" to={`?guideTool=${tool}#guide-workspace`}>Open the practice area</Link>
        <p className="text-sm"><strong>Tip:</strong> {tip}</p></div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={day === 0} onClick={() => setDay(day-1)}>Previous lesson</Button><Button type="button" variant="outline" onClick={() => day === lessons.length-1 ? setFinished(true) : setDay(day+1)}>{day === lessons.length-1 ? 'Finish lessons' : 'Next lesson'}</Button></div>
    </>}
  </section>;
}