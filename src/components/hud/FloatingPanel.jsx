import React from "react";
import { Button } from "@/components/ui/button";
import { X, PanelRight } from "lucide-react";

export default function FloatingPanel({ title, children, onClose, onTossToSidePanel, cardId, headerExtra, collapsedWidth }) {
  const containerRef = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef(false);
  const [size, setSize] = React.useState({ w: 600, h: 0 });
  const resizingRef = React.useRef({ active: false, edge: null });
  const startResize = (edge) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { active: true, edge };
  };

  React.useEffect(() => {
    const width = collapsedWidth || 600;
    const height = Math.min(window.innerHeight * 0.85, 720);
    const x = Math.max(8, (window.innerWidth - width) / 2);
    const y = Math.max(8, (window.innerHeight - height) / 2);
    setPos({ x, y });
    setSize({ w: width, h: height });
  }, []);

  // Auto-resize width when collapsedWidth changes
  React.useEffect(() => {
    if (collapsedWidth) {
      setSize(s => ({ ...s, w: collapsedWidth }));
    }
  }, [collapsedWidth]);

  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (resizingRef.current.active) {
        const minW = 320, minH = 240;
        const maxW = Math.max(minW, window.innerWidth - pos.x - 8);
        const maxH = Math.max(minH, window.innerHeight - pos.y - 8);
        const edge = resizingRef.current.edge;
        if (edge === 'right') {
          const nextW = Math.min(Math.max(minW, e.clientX - pos.x), maxW);
          setSize((s) => ({ ...s, w: nextW }));
        } else if (edge === 'bottom') {
          const nextH = Math.min(Math.max(minH, e.clientY - pos.y), maxH);
          setSize((s) => ({ ...s, h: nextH }));
        } else if (edge === 'bottom-right') {
          const nextW = Math.min(Math.max(minW, e.clientX - pos.x), maxW);
          const nextH = Math.min(Math.max(minH, e.clientY - pos.y), maxH);
          setSize({ w: nextW, h: nextH });
        }
        return;
      }
      if (!draggingRef.current) return;
      const width = containerRef.current?.offsetWidth || size.w || 420;
      const height = containerRef.current?.offsetHeight || size.h || 560;
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      newX = Math.min(Math.max(8, newX), window.innerWidth - width - 8);
      newY = Math.min(Math.max(8, newY), window.innerHeight - height - 8);
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { draggingRef.current = false; resizingRef.current = { active: false, edge: null }; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    draggingRef.current = true;
    dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  return (
    <div
      ref={containerRef}
      data-floating-panel="true"
      className="fixed z-[110] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <style>{`
        [data-floating-panel-content] { color: #1e293b; }
        [data-floating-panel-content] * { color: inherit; }
        [data-floating-panel-content] h1, [data-floating-panel-content] h2, [data-floating-panel-content] h3, [data-floating-panel-content] h4 { color: #0f172a !important; }
        [data-floating-panel-content] .text-slate-500, [data-floating-panel-content] .text-slate-400 { color: #64748b !important; }
        [data-floating-panel-content] .text-blue-600 { color: #2563eb !important; }
        [data-floating-panel-content] .text-blue-700 { color: #1d4ed8 !important; }
        [data-floating-panel-content] .text-blue-800 { color: #1e40af !important; }
        [data-floating-panel-content] .text-blue-900 { color: #1e3a5f !important; }
        [data-floating-panel-content] .text-blue-500 { color: #3b82f6 !important; }
        [data-floating-panel-content] .text-emerald-600 { color: #059669 !important; }
        [data-floating-panel-content] .text-emerald-700 { color: #047857 !important; }
        [data-floating-panel-content] .text-emerald-800 { color: #065f46 !important; }
        [data-floating-panel-content] .text-amber-600 { color: #d97706 !important; }
        [data-floating-panel-content] .text-amber-700 { color: #b45309 !important; }
        [data-floating-panel-content] .text-amber-800 { color: #92400e !important; }
        [data-floating-panel-content] .text-rose-600 { color: #e11d48 !important; }
        [data-floating-panel-content] .text-rose-700 { color: #be123c !important; }
        [data-floating-panel-content] .text-rose-800 { color: #9f1239 !important; }
        [data-floating-panel-content] .text-violet-600 { color: #7c3aed !important; }
        [data-floating-panel-content] .text-violet-700 { color: #6d28d9 !important; }
        [data-floating-panel-content] .text-indigo-700 { color: #4338ca !important; }
        [data-floating-panel-content] .text-orange-600 { color: #ea580c !important; }
        [data-floating-panel-content] .text-green-600 { color: #16a34a !important; }
        [data-floating-panel-content] .text-red-700 { color: #b91c1c !important; }
        [data-floating-panel-content] .text-slate-600 { color: #475569 !important; }
        [data-floating-panel-content] .text-slate-700 { color: #334155 !important; }
        [data-floating-panel-content] .text-slate-800 { color: #1e293b !important; }
        [data-floating-panel-content] .text-slate-900 { color: #0f172a !important; }
        [data-floating-panel-content] .bg-white { background-color: #ffffff !important; }
        [data-floating-panel-content] .bg-slate-50 { background-color: #f8fafc !important; }
        [data-floating-panel-content] .bg-blue-50 { background-color: #eff6ff !important; }
        [data-floating-panel-content] .bg-emerald-50 { background-color: #ecfdf5 !important; }
        [data-floating-panel-content] .bg-amber-50 { background-color: #fffbeb !important; }
        [data-floating-panel-content] .bg-rose-50 { background-color: #fff1f2 !important; }
        [data-floating-panel-content] .bg-violet-50 { background-color: #f5f3ff !important; }
        [data-floating-panel-content] .bg-indigo-50 { background-color: #eef2ff !important; }
        [data-floating-panel-content] .bg-cyan-50 { background-color: #ecfeff !important; }
        [data-floating-panel-content] .border-blue-200 { border-color: #bfdbfe !important; }
        [data-floating-panel-content] .border-blue-300 { border-color: #93c5fd !important; }
        [data-floating-panel-content] .border-emerald-200 { border-color: #a7f3d0 !important; }
        [data-floating-panel-content] .border-amber-200 { border-color: #fde68a !important; }
        [data-floating-panel-content] .border-amber-300 { border-color: #fcd34d !important; }
        [data-floating-panel-content] .border-rose-200 { border-color: #fecdd3 !important; }
        [data-floating-panel-content] .border-rose-300 { border-color: #fda4af !important; }
        [data-floating-panel-content] .border-violet-200 { border-color: #ddd6fe !important; }
        [data-floating-panel-content] .border-indigo-200 { border-color: #c7d2fe !important; }
        [data-floating-panel-content] .border-slate-200 { border-color: #e2e8f0 !important; }
        [data-floating-panel-content] .rounded-xl:not(img), [data-floating-panel-content] .rounded-lg:not(img) { border-radius: 0.75rem; }
        [data-floating-panel-content] button.bg-violet-600, [data-floating-panel-content] button.bg-violet-600 * { color: #ffffff !important; }
        [data-floating-panel-content] button.bg-violet-700, [data-floating-panel-content] button.bg-violet-700 * { color: #ffffff !important; }
        [data-floating-panel-content] button[class*="bg-violet-6"], [data-floating-panel-content] button[class*="bg-violet-6"] * { color: #ffffff !important; background-color: #7c3aed !important; }
        [data-floating-panel-content] button[class*="bg-violet-7"], [data-floating-panel-content] button[class*="bg-violet-7"] * { color: #ffffff !important; }
        [data-floating-panel-content] .bg-blue-200 { background-color: #bfdbfe !important; }
        [data-floating-panel-content] .bg-emerald-100 { background-color: #d1fae5 !important; }
        [data-floating-panel-content] .bg-amber-100 { background-color: #fef3c7 !important; }
        [data-floating-panel-content] .bg-rose-100 { background-color: #ffe4e6 !important; }
        [data-floating-panel-content] .bg-violet-100 { background-color: #ede9fe !important; }
        [data-floating-panel-content] .bg-blue-100 { background-color: #dbeafe !important; }
      `}</style>
      <div
        onMouseDown={startDrag}
        className="h-10 w-full border-b border-slate-200 dark:border-[rgba(0,255,136,0.2)] bg-slate-50 dark:bg-[#0a0a0a] backdrop-blur-sm cursor-grab active:cursor-grabbing select-none flex items-center justify-between px-3 text-sm font-medium text-violet-600 dark:text-[#00ff88]"
      >
        <span className="truncate pr-2">{title}</span>
        <div className="flex items-center gap-1">
          {headerExtra}
          {onTossToSidePanel && cardId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-600 dark:text-[#00ff88] hover:bg-violet-100 dark:hover:bg-[rgba(0,255,136,0.1)]"
              onClick={(e) => {
                e.stopPropagation();
                onTossToSidePanel(cardId, title);
                onClose();
              }}
              title="Send to side panel"
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 dark:text-[#00ff88] hover:bg-slate-100 dark:hover:bg-[rgba(0,255,136,0.1)]"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div 
        data-floating-panel-content="true"
        className="h-[calc(100%-2.5rem)] overflow-auto p-4 bg-white dark:bg-[#050505] text-slate-900 dark:text-white"
        style={{ color: '#1e293b' }}
      >
        {children}
      </div>
      {/* Resize handles */}
      <div onMouseDown={startResize('right')} className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-10" />
      <div onMouseDown={startResize('bottom')} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={startResize('bottom-right')} className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize z-20" />
    </div>
  );
}