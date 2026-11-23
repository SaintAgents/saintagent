export default function HelpPanelThemeOverrides() {
  return (
    <style>{`
      /* Hacker theme - Help panel MUST be fully opaque, not transparent */
      html[data-theme='hacker'] [data-support-content],
      [data-theme='hacker'] [data-support-content] {
        background: #000000 !important;
        background-color: #000000 !important;
        border-color: #00ff00 !important;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.3) !important;
      }
      html[data-theme='hacker'] [data-support-content] *,
      [data-theme='hacker'] [data-support-content] * {
        background-color: #000000 !important;
      }
      /* Preserve gradient header inside help panel */
      html[data-theme='hacker'] [data-support-content] .from-violet-500,
      html[data-theme='hacker'] [data-support-content] [class*='bg-gradient-to-r'],
      [data-theme='hacker'] [data-support-content] .from-violet-500,
      [data-theme='hacker'] [data-support-content] [class*='bg-gradient-to-r'] {
        background: linear-gradient(to right, rgba(0, 255, 0, 0.2), rgba(0, 200, 0, 0.1)) !important;
        background-color: transparent !important;
      }
      /* User message bubbles */
      html[data-theme='hacker'] [data-support-content] .bg-violet-600,
      [data-theme='hacker'] [data-support-content] .bg-violet-600 {
        background-color: rgba(0, 255, 0, 0.2) !important;
      }
      /* Assistant message bubbles */
      html[data-theme='hacker'] [data-support-content] .bg-slate-100,
      [data-theme='hacker'] [data-support-content] .bg-slate-100 {
        background-color: #0a0a0a !important;
        border: 1px solid rgba(0, 255, 0, 0.2) !important;
      }
      /* Quick question buttons */
      html[data-theme='hacker'] [data-support-content] .bg-violet-50,
      [data-theme='hacker'] [data-support-content] .bg-violet-50 {
        background-color: rgba(0, 255, 0, 0.1) !important;
        border: 1px solid rgba(0, 255, 0, 0.3) !important;
      }
      /* Input area & feedback button */
      html[data-theme='hacker'] [data-support-content] .bg-slate-50,
      [data-theme='hacker'] [data-support-content] .bg-slate-50 {
        background-color: #0a0a0a !important;
      }
      /* Action buttons */
      html[data-theme='hacker'] [data-support-content] [class*='from-emerald-50'],
      html[data-theme='hacker'] [data-support-content] [class*='from-amber-50'],
      [data-theme='hacker'] [data-support-content] [class*='from-emerald-50'],
      [data-theme='hacker'] [data-support-content] [class*='from-amber-50'] {
        background: rgba(0, 255, 0, 0.08) !important;
        border-color: #00ff00 !important;
      }

      /* Dark theme - Help panel MUST be fully opaque */
      html[data-theme='dark'] [data-support-content],
      [data-theme='dark'] [data-support-content] {
        background: #050505 !important;
        background-color: #050505 !important;
        border-color: rgba(0, 255, 136, 0.3) !important;
      }
      html[data-theme='dark'] [data-support-content] *,
      [data-theme='dark'] [data-support-content] * {
        background-color: #050505 !important;
      }
      html[data-theme='dark'] [data-support-content] .from-violet-500,
      html[data-theme='dark'] [data-support-content] [class*='bg-gradient-to-r'],
      [data-theme='dark'] [data-support-content] .from-violet-500,
      [data-theme='dark'] [data-support-content] [class*='bg-gradient-to-r'] {
        background: linear-gradient(to right, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.1)) !important;
        background-color: transparent !important;
      }
      html[data-theme='dark'] [data-support-content] .bg-violet-600,
      [data-theme='dark'] [data-support-content] .bg-violet-600 {
        background-color: rgba(0, 255, 136, 0.2) !important;
      }
      html[data-theme='dark'] [data-support-content] .bg-slate-100,
      [data-theme='dark'] [data-support-content] .bg-slate-100 {
        background-color: #0a0a0a !important;
        border: 1px solid rgba(0, 255, 136, 0.15) !important;
      }
      html[data-theme='dark'] [data-support-content] .bg-slate-50,
      [data-theme='dark'] [data-support-content] .bg-slate-50 {
        background-color: #0a0a0a !important;
      }
      html[data-theme='dark'] [data-support-content] [class*='from-emerald-50'],
      html[data-theme='dark'] [data-support-content] [class*='from-amber-50'],
      [data-theme='dark'] [data-support-content] [class*='from-emerald-50'],
      [data-theme='dark'] [data-support-content] [class*='from-amber-50'] {
        background: rgba(0, 255, 136, 0.08) !important;
        border-color: rgba(0, 255, 136, 0.3) !important;
      }
    `}</style>
  );
}