import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function Whiteboard({ conversationId }) {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: boards = [] } = useQuery({
    queryKey: ['collabWB', conversationId],
    queryFn: () => base44.entities.CollabWhiteboard.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 1000
  });
  const board = boards?.[0];

  const upsert = useMutation({
    mutationFn: async (strokes) => {
      if (board) return base44.entities.CollabWhiteboard.update(board.id, { strokes, updated_by: me?.email });
      return base44.entities.CollabWhiteboard.create({ conversation_id: conversationId, strokes, updated_by: me?.email });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collabWB', conversationId] })
  });

  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#7c3aed');
  const [w, setW] = React.useState(3);

  const strokes = board?.strokes || [];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((s) => {
      ctx.strokeStyle = s.color || '#111827';
      ctx.lineWidth = s.w || 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });
  }, [strokes]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
  };

  const onDown = (e) => { setDrawing(true); };
  const onMove = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    const last = strokes[strokes.length - 1];
    const x1 = last?.x2 ?? x, y1 = last?.y2 ?? y;
    const stroke = { x1, y1, x2: x, y2: y, color, w };
    upsert.mutate([...strokes, stroke]);
  };
  const onUp = () => setDrawing(false);

  return (
    <div className="border rounded-xl bg-white p-2">
      <div className="flex items-center gap-2 mb-2">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="range" min={1} max={10} value={w} onChange={(e) => setW(Number(e.target.value))} />
        <Button size="sm" variant="outline" onClick={() => upsert.mutate([])}>Clear</Button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          className="w-full h-72 bg-slate-50 rounded-lg border"
        />
      </div>
    </div>
  );
}