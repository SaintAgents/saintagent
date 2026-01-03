import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FloatingPanel({ title, children, onClose }) {
  const containerRef = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef(false);
  const [size, setSize] = React.useState({ w: 420, h: 0 });
  const resizingRef = React.useRef({ active: false, edge: null });
  const startResize = (edge) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { active: true, edge };
  };

  React.useEffect(() => {
    const width = 420;
    const height = Math.min(window.innerHeight * 0.6, 560);
    const x = Math.max(8, window.innerWidth - width - 24);
    const y = Math.max(8, window.innerHeight - height - 24);
    setPos({ x, y });
    setSize({ w: width, h: height });
  }, []);

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
      className="fixed z-[110] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <div
        onMouseDown={startDrag}
        className="h-10 w-full border-b bg-slate-50/80 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none flex items-center justify-between px-3 text-sm font-medium text-slate-600"
      >
        <span className="truncate pr-2">{title}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:bg-slate-100"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="h-[calc(100%-2.5rem)] overflow-auto p-4">
        {children}
      </div>
      {/* Resize handles */}
      <div onMouseDown={startResize('right')} className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-10" />
      <div onMouseDown={startResize('bottom')} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={startResize('bottom-right')} className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize z-20" />
    </div>
  );
}