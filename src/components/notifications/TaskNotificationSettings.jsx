import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Clock, GitBranch, FolderKanban } from 'lucide-react';

export default function TaskNotificationSettings({ settings = {}, onChange }) {
  const prefs = {
    task_assigned: settings.task_assigned !== false,
    task_due_reminder: settings.task_due_reminder !== false,
    task_due_days_before: settings.task_due_days_before || 1,
    dependency_met: settings.dependency_met !== false,
    project_updates: settings.project_updates !== false
  };

  const updatePref = (key, value) => {
    onChange({
      ...prefs,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Task Notifications
        </CardTitle>
        <CardDescription>
          Configure how you receive notifications about tasks and projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Assigned */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="w-5 h-5 text-violet-500 mt-0.5" />
            <div>
              <Label className="font-medium">Task Assignments</Label>
              <p className="text-sm text-slate-500">
                Get notified when a task is assigned to you
              </p>
            </div>
          </div>
          <Switch
            checked={prefs.task_assigned}
            onCheckedChange={(checked) => updatePref('task_assigned', checked)}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>

        {/* Due Date Reminders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <Label className="font-medium">Due Date Reminders</Label>
                <p className="text-sm text-slate-500">
                  Get reminded before tasks are due
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.task_due_reminder}
              onCheckedChange={(checked) => updatePref('task_due_reminder', checked)}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
          
          {prefs.task_due_reminder && (
            <div className="ml-8 flex items-center gap-3">
              <Label className="text-sm text-slate-600">Remind me</Label>
              <Select
                value={String(prefs.task_due_days_before)}
                onValueChange={(v) => updatePref('task_due_days_before', parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="2">2 days before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Dependency Met */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <GitBranch className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <Label className="font-medium">Dependency Updates</Label>
              <p className="text-sm text-slate-500">
                Get notified when task dependencies are completed
              </p>
            </div>
          </div>
          <Switch
            checked={prefs.dependency_met}
            onCheckedChange={(checked) => updatePref('dependency_met', checked)}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>

        {/* Project Updates */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <FolderKanban className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <Label className="font-medium">Project Updates</Label>
              <p className="text-sm text-slate-500">
                Get notified about milestone completions and project changes
              </p>
            </div>
          </div>
          <Switch
            checked={prefs.project_updates}
            onCheckedChange={(checked) => updatePref('project_updates', checked)}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}