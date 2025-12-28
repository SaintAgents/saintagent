import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FloatingPanel({ title, children, onClose }) {
  const containerRef = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef(false);

  React.useEffect(() => {
    const width = 420;
    const height = Math.min(window.innerHeight * 0.6, 560);
    const x = Math.max(8, window.innerWidth - width - 24);
    const y = Math.max(8, window.innerHeight - height - 24);
    setPos({ x, y });
  }, []);

  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current) return;
      const width = containerRef.current?.offsetWidth || 420;
      const height = containerRef.current?.offsetHeight || 560;
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      newX = Math.min(Math.max(8, newX), window.innerWidth - width - 8);
      newY = Math.min(Math.max(8, newY), window.innerHeight - height - 8);
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { draggingRef.current = false; };
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
      className="fixed z-[110] w-[420px] h-[60vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y }}
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
      <div className="h-[calc(60vh-2.5rem)] overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}