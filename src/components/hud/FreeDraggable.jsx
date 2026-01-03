import React from "react";

export default function FreeDraggable({ id, position, onPositionChange, width = 380, children }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const startRef = React.useRef({ x: 0, y: 0, left: 0, top: 0 });

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
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - startRef.current.x;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - startRef.current.y;
      const nx = Math.max(0, Math.round((position?.x || 0) + x));
      const ny = Math.max(0, Math.round((position?.y || 0) + y));
      onPositionChange({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);

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
  }, [dragging, position, onPositionChange]);

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