import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntelligenceHighlights from '@/components/intelligence/IntelligenceHighlights';
import '@/components/globalimpact/globalImpact.css';

export default function IntelligenceDashboard() {
  return <section id="global-impact" className="min-h-dvh px-3 pb-24 pt-5 sm:px-6" aria-labelledby="intelligence-dashboard-title">
    <div className="mx-auto max-w-[100rem] space-y-4">
      <header className="impact-intro flex flex-col items-start justify-end gap-4">
        <Link to="/GlobalImpactDashboard" className="impact-control inline-flex items-center gap-2"><ArrowLeft size={15} aria-hidden="true" /> Global Impact</Link>
        <div>
          <p className="impact-kicker">SAINTAGENT / INTELLIGENT ACTION NETWORK</p>
          <h1 id="intelligence-dashboard-title" className="mt-1 text-3xl font-extrabold tracking-tight sm:text-5xl">Intelligence Dashboard</h1>
          <p className="impact-muted mt-2 max-w-xl text-sm sm:text-base">See how your goals, relationships, and work fit together, then open the right tool for your next step.</p>
        </div>
      </header>
      <IntelligenceHighlights />
    </div>
  </section>;
}