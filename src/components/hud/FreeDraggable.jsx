import React from "react";

export default function FreeDraggable({ id, position, onPositionChange, width = 380, children }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const startRef = React.useRef({ x: 0, y: 0, left: 0, top: 0 });
  const posStartRef = React.useRef({ x: 0, y: 0 });
  const rafRef = React.useRef(null);
  const speedRef = React.useRef(0.6); // drag damping (lower = slower)

  const onMouseDown = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragging(true);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
    posStartRef.current = { x: position?.x || 0, y: position?.y || 0 };
    e.preventDefault();
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    if (!t) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragging(true);
    startRef.current = {
      x: t.clientX,
      y: t.clientY,
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
    posStartRef.current = { x: position?.x || 0, y: position?.y || 0 };
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startRef.current.x;
      const dy = clientY - startRef.current.y;

      const targetX = posStartRef.current.x + dx * speedRef.current;
      const targetY = posStartRef.current.y + dy * speedRef.current;

      const maxX = Math.max(0, (window.innerWidth || 0) - (width || 380) - 24);
      const maxY = Math.max(0, (document.documentElement?.scrollHeight || window.innerHeight || 0) - 120);
      const clampedX = Math.min(Math.max(0, Math.round(targetX)), maxX);
      const clampedY = Math.min(Math.max(0, Math.round(targetY)), maxY);

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        onPositionChange({ x: clampedX, y: clampedY });
        rafRef.current = null;
      });
    };
    const onUp = () => {
      setDragging(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [dragging, onPositionChange, width]);

  const style = {
    position: "absolute",
    left: (position?.x || 0) + "px",
    top: (position?.y || 0) + "px",
    width,
    zIndex: dragging ? 50 : 1,
    cursor: dragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div ref={ref} style={style} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
      {children}
    </div>
  );
}