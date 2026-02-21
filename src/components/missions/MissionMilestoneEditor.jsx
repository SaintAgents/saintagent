import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, 
  CheckCircle2, Circle, Calendar, Coins, ListTodo
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function TaskItem({ task, milestoneId, onUpdate, onDelete }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
      <button
        type="button"
        onClick={() => onUpdate({ ...task, completed: !task.completed })}
        className="shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-slate-300" />
        )}
      </button>
      <Input
        value={task.title}
        onChange={(e) => onUpdate({ ...task, title: e.target.value })}
        placeholder="Task description..."
        className={`flex-1 h-8 text-sm ${task.completed ? 'line-through text-slate-400' : ''}`}
      />
      <button
        type="button"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function MilestoneCard({ milestone, index, onUpdate, onDelete, expanded, onToggleExpand }) {
  const addTask = () => {
    const newTask = { id: generateId(), title: '', completed: false };
    onUpdate({
      ...milestone,
      tasks: [...(milestone.tasks || []), newTask]
    });
  };

  const updateTask = (taskIndex, updatedTask) => {
    const tasks = [...(milestone.tasks || [])];
    tasks[taskIndex] = updatedTask;
    onUpdate({ ...milestone, tasks });
  };

  const deleteTask = (taskIndex) => {
    onUpdate({
      ...milestone,
      tasks: milestone.tasks.filter((_, i) => i !== taskIndex)
    });
  };

  const completedTasks = milestone.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = milestone.tasks?.length || 0;

  return (
    <Card className="border-slate-200">
      <Collapsible open={expanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400">
                <GripVertical className="w-4 h-4" />
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  {milestone.title || 'Untitled Milestone'}
                </CardTitle>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {totalTasks > 0 && (
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3 h-3" />
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  )}
                  {milestone.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {milestone.due_date}
                    </span>
                  )}
                  {milestone.reward_ggg > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Coins className="w-3 h-3" />
                      {milestone.reward_ggg} GGG
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Milestone Title</Label>
                <Input
                  value={milestone.title}
                  onChange={(e) => onUpdate({ ...milestone, title: e.target.value })}
                  placeholder="e.g., Phase 1: Research"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={milestone.due_date || ''}
                    onChange={(e) => onUpdate({ ...milestone, due_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">GGG Reward</Label>
                  <Input
                    type="number"
                    value={milestone.reward_ggg || ''}
                    onChange={(e) => onUpdate({ ...milestone, reward_ggg: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={milestone.description || ''}
                onChange={(e) => onUpdate({ ...milestone, description: e.target.value })}
                placeholder="What should be accomplished in this milestone?"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Tasks</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTask}
                  className="h-6 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {(milestone.tasks || []).map((task, taskIndex) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    milestoneId={milestone.id}
                    onUpdate={(updated) => updateTask(taskIndex, updated)}
                    onDelete={() => deleteTask(taskIndex)}
                  />
                ))}
                {(!milestone.tasks || milestone.tasks.length === 0) && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No tasks yet. Add tasks to track progress.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function MissionMilestoneEditor({ milestones = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const addMilestone = () => {
    const newMilestone = {
      id: generateId(),
      title: '',
      description: '',
      order: milestones.length,
      completed: false,
      tasks: []
    };
    onChange([...milestones, newMilestone]);
    setExpandedIndex(milestones.length);
  };

  const updateMilestone = (index, updated) => {
    const newMilestones = [...milestones];
    newMilestones[index] = updated;
    onChange(newMilestones);
  };

  const deleteMilestone = (index) => {
    onChange(milestones.filter((_, i) => i !== index));
    if (expandedIndex >= index && expandedIndex > 0) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(milestones);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    // Update order numbers
    const reorderedWithOrder = items.map((item, idx) => ({ ...item, order: idx }));
    onChange(reorderedWithOrder);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-violet-500" />
          Milestones ({milestones.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMilestone}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
          <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-2">No milestones yet</p>
          <p className="text-xs text-slate-400 mb-3">
            Break down your mission into milestones with sub-tasks
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="w-4 h-4 mr-1" />
            Add First Milestone
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="milestones">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {milestones.map((milestone, index) => (
                  <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <MilestoneCard
                          milestone={milestone}
                          index={index}
                          onUpdate={(updated) => updateMilestone(index, updated)}
                          onDelete={() => deleteMilestone(index)}
                          expanded={expandedIndex === index}
                          onToggleExpand={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}