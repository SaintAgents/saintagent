import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ZoomIn, ZoomOut, Maximize2, AlertTriangle, Route, Undo2,
  Save, Loader2, Info, Calendar
} from 'lucide-react';
import CanvasNode from './CanvasNode';
import ConnectionLine, { ArrowDefs } from './ConnectionLine';
import { computeCriticalPath, propagateDateChange, getDependencyIds } from './criticalPath';
import CriticalPathPanel from './CriticalPathPanel';
import DatePropagationModal from './DatePropagationModal';

const NODE_W = 220;
const NODE_H = 100;
const GRID_SIZE = 20;

function snapToGrid(val) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

function autoLayout(tasks) {
  // Simple layered layout based on dependency depth
  const depIds = (t) => getDependencyIds(t);
  const depths = new Map();

  function getDepth(task, visited = new Set()) {
    if (depths.has(task.id)) return depths.get(task.id);
    if (visited.has(task.id)) return 0;
    visited.add(task.id);
    const deps = depIds(task);
    if (deps.length === 0) { depths.set(task.id, 0); return 0; }
    const maxDep = Math.max(...deps.map(did => {
      const dt = tasks.find(t => t.id === did);
      return dt ? getDepth(dt, visited) : -1;
    }));
    const d = maxDep + 1;
    depths.set(task.id, d);
    return d;
  }

  tasks.forEach(t => getDepth(t));

  const layers = {};
  tasks.forEach(t => {
    const d = depths.get(t.id) || 0;
    if (!layers[d]) layers[d] = [];
    layers[d].push(t.id);
  });

  const positions = {};
  Object.entries(layers).forEach(([layerStr, ids]) => {
    const layer = parseInt(layerStr);
    ids.forEach((id, i) => {
      positions[id] = {
        x: 80 + layer * (NODE_W + 100),
        y: 80 + i * (NODE_H + 40),
      };
    });
  });

  return positions;
}

export default function TaskCanvas({ tasks, projectId }) {
  const queryClient = useQueryClient();
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Node positions (taskId -> {x, y})
  const [positions, setPositions] = useState(() => autoLayout(tasks));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Interaction states
  const [dragging, setDragging] = useState(null); // {taskId, offsetX, offsetY}
  const [connecting, setConnecting] = useState(null); // {fromTaskId, mouseX, mouseY}
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateEditTask, setDateEditTask] = useState(null);
  const [propagationResult, setPropagationResult] = useState(null);

  // When tasks change, add new ones to positions
  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev };
      let needsLayout = false;
      tasks.forEach(t => {
        if (!next[t.id]) needsLayout = true;
      });
      if (needsLayout) {
        const fresh = autoLayout(tasks);
        tasks.forEach(t => {
          if (!next[t.id]) next[t.id] = fresh[t.id] || { x: 100, y: 100 };
        });
      }
      // Remove positions for deleted tasks
      Object.keys(next).forEach(id => {
        if (!tasks.find(t => t.id === id)) delete next[id];
      });
      return next;
    });
  }, [tasks]);

  // Critical path computation
  const { criticalTaskIds, taskSchedule, projectEnd } = useMemo(
    () => computeCriticalPath(tasks),
    [tasks]
  );

  // Build edges from dependencies
  const edges = useMemo(() => {
    const result = [];
    tasks.forEach(task => {
      const deps = getDependencyIds(task);
      deps.forEach(predId => {
        if (tasks.find(t => t.id === predId)) {
          result.push({
            from: predId,
            to: task.id,
            isCritical: criticalTaskIds.has(predId) && criticalTaskIds.has(task.id),
          });
        }
      });
    });
    return result;
  }, [tasks, criticalTaskIds]);

  // Mutations
  const saveDependencyMutation = useMutation({
    mutationFn: async ({ taskId, dependencies, depends_on }) => {
      await base44.entities.ProjectTask.update(taskId, { dependencies, depends_on });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] }),
  });

  const saveDatesMutation = useMutation({
    mutationFn: async (updates) => {
      for (const u of updates) {
        await base44.entities.ProjectTask.update(u.taskId, {
          start_date: u.newStartDate,
          due_date: u.newDueDate,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      setPropagationResult(null);
    },
  });

  // SVG coordinate helpers
  const getSVGPoint = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // --- Event Handlers ---

  const handleNodeMouseDown = useCallback((taskId, e) => {
    e.stopPropagation();
    const pt = getSVGPoint(e);
    const pos = positions[taskId] || { x: 0, y: 0 };
    setDragging({ taskId, offsetX: pt.x - pos.x, offsetY: pt.y - pos.y });
    setSelectedTaskId(taskId);
  }, [positions, getSVGPoint]);

  const handleConnectorMouseDown = useCallback((taskId, e) => {
    e.stopPropagation();
    const pt = getSVGPoint(e);
    setConnecting({ fromTaskId: taskId, mouseX: pt.x, mouseY: pt.y });
  }, [getSVGPoint]);

  const handleConnectorMouseUp = useCallback((taskId) => {
    if (!connecting || connecting.fromTaskId === taskId) {
      setConnecting(null);
      return;
    }
    // Create dependency: connecting.fromTaskId -> taskId
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) { setConnecting(null); return; }

    const existingDeps = getDependencyIds(targetTask);
    if (existingDeps.includes(connecting.fromTaskId)) {
      setConnecting(null);
      return; // Already exists
    }

    const newDependencies = [...(targetTask.dependencies || []), {
      task_id: connecting.fromTaskId,
      type: 'FS',
      lag_days: 0,
    }];
    const newDependsOn = [...new Set([...(targetTask.depends_on || []), connecting.fromTaskId])];

    saveDependencyMutation.mutate({
      taskId: taskId,
      dependencies: newDependencies,
      depends_on: newDependsOn,
    });
    setConnecting(null);
  }, [connecting, tasks, saveDependencyMutation]);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const pt = getSVGPoint(e);
      setPositions(prev => ({
        ...prev,
        [dragging.taskId]: {
          x: snapToGrid(pt.x - dragging.offsetX),
          y: snapToGrid(pt.y - dragging.offsetY),
        },
      }));
    } else if (connecting) {
      const pt = getSVGPoint(e);
      setConnecting(prev => prev ? { ...prev, mouseX: pt.x, mouseY: pt.y } : null);
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: dx, y: dy });
    }
  }, [dragging, connecting, isPanning, panStart, getSVGPoint]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    if (connecting) setConnecting(null);
    if (isPanning) setIsPanning(false);
  }, [connecting, isPanning]);

  const handleBgMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.getAttribute('data-bg') === 'true') {
      setSelectedTaskId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
  }, []);

  // Date change with propagation
  const handleDateChange = useCallback((taskId, newDate) => {
    const updates = propagateDateChange(tasks, taskId, newDate);
    if (updates.length > 1) {
      setPropagationResult({ trigger: taskId, updates });
    } else if (updates.length === 1) {
      saveDatesMutation.mutate(updates);
    }
  }, [tasks, saveDatesMutation]);

  const handleResetLayout = useCallback(() => {
    setPositions(autoLayout(tasks));
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [tasks]);

  // Canvas dimensions
  const canvasW = 4000;
  const canvasH = 3000;

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: 500 }}>
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 px-3 py-1.5 shadow-sm">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(2, z + 0.15))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-xs font-mono text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-slate-200" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetLayout} title="Auto-layout">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-slate-200" />
        <Button
          variant={showCriticalPath ? 'default' : 'ghost'}
          size="sm"
          className={`h-7 text-xs gap-1 ${showCriticalPath ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          onClick={() => setShowCriticalPath(p => !p)}
        >
          <Route className="w-3.5 h-3.5" />
          Critical Path
        </Button>
      </div>

      {/* Info bar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
          {tasks.length} tasks · {edges.length} deps
        </Badge>
        {showCriticalPath && criticalTaskIds.size > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {criticalTaskIds.size} on critical path
          </Badge>
        )}
      </div>

      {/* Instructions */}
      {tasks.length > 0 && (
        <div className="absolute bottom-3 left-3 z-20 text-[10px] text-slate-400 bg-white/80 backdrop-blur-sm rounded px-2 py-1 border border-slate-100">
          Drag nodes to move • Drag from right ● to left ● to connect • Double-click node to edit date • Scroll to zoom
        </div>
      )}

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab"
        onWheel={handleWheel}
        style={{ cursor: dragging ? 'grabbing' : connecting ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleBgMouseDown}
        >
          <ArrowDefs />

          {/* Grid dots */}
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={0.5} fill="#e2e8f0" />
          </pattern>
          <rect data-bg="true" width={canvasW} height={canvasH} fill="url(#grid)" />

          {/* Connection lines */}
          {edges.map(edge => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            return (
              <ConnectionLine
                key={`${edge.from}-${edge.to}`}
                fromX={fromPos.x} fromY={fromPos.y}
                toX={toPos.x} toY={toPos.y}
                isCritical={showCriticalPath && edge.isCritical}
                isHighlighted={selectedTaskId === edge.from || selectedTaskId === edge.to}
              />
            );
          })}

          {/* Live connection line while dragging */}
          {connecting && (
            <line
              x1={(positions[connecting.fromTaskId]?.x || 0) + NODE_W}
              y1={(positions[connecting.fromTaskId]?.y || 0) + NODE_H / 2}
              x2={connecting.mouseX}
              y2={connecting.mouseY}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="6,4"
              opacity={0.8}
            />
          )}

          {/* Task nodes */}
          {tasks.map(task => {
            const pos = positions[task.id];
            if (!pos) return null;
            return (
              <g key={task.id}
                onDoubleClick={(e) => { e.stopPropagation(); setDateEditTask(task); }}
              >
                <CanvasNode
                  task={task}
                  x={pos.x}
                  y={pos.y}
                  isOnCriticalPath={showCriticalPath && criticalTaskIds.has(task.id)}
                  isSelected={selectedTaskId === task.id}
                  isConnecting={connecting?.fromTaskId === task.id}
                  isConnectionTarget={!!connecting && connecting.fromTaskId !== task.id}
                  onMouseDown={(e) => handleNodeMouseDown(task.id, e)}
                  onConnectorMouseDown={(e) => handleConnectorMouseDown(task.id, e)}
                  onConnectorMouseUp={() => handleConnectorMouseUp(task.id)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Critical Path Panel */}
      {showCriticalPath && criticalTaskIds.size > 0 && (
        <CriticalPathPanel
          tasks={tasks}
          criticalTaskIds={criticalTaskIds}
          taskSchedule={taskSchedule}
          projectEnd={projectEnd}
        />
      )}

      {/* Date Edit Inline */}
      {dateEditTask && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-xl border border-slate-200 shadow-xl p-5 w-80">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Change Start Date
          </h3>
          <p className="text-xs text-slate-500 mb-2 truncate">{dateEditTask.title}</p>
          <p className="text-xs text-slate-400 mb-3">
            Current: {dateEditTask.start_date || 'Not set'} → {dateEditTask.due_date || 'Not set'}
          </p>
          <Input
            type="date"
            defaultValue={dateEditTask.start_date || ''}
            onChange={(e) => {
              if (e.target.value) handleDateChange(dateEditTask.id, e.target.value);
            }}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setDateEditTask(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Date Propagation Modal */}
      {propagationResult && (
        <DatePropagationModal
          tasks={tasks}
          result={propagationResult}
          onApply={() => saveDatesMutation.mutate(propagationResult.updates)}
          onCancel={() => setPropagationResult(null)}
          isApplying={saveDatesMutation.isPending}
        />
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Route className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks yet. Add tasks to see them on the canvas.</p>
          </div>
        </div>
      )}
    </div>
  );
}