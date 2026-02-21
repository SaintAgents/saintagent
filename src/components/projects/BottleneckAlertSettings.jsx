import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Bell, AlertTriangle, Clock, Users, GitBranch, TrendingDown,
  Settings, Save, Shield, Zap, Timer, CheckCircle2, Loader2
} from 'lucide-react';

export default function BottleneckAlertSettings({ project, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: existingConfig } = useQuery({
    queryKey: ['projectAlertConfig', project.id],
    queryFn: async () => {
      const configs = await base44.entities.ProjectAlertConfig.filter({ project_id: project.id });
      return configs?.[0] || null;
    }
  });

  const [config, setConfig] = useState({
    is_enabled: true,
    overdue_threshold_days: 1,
    overdue_critical_days: 3,
    member_overload_threshold: 5,
    member_overload_critical: 8,
    blocked_task_threshold_hours: 24,
    blocked_task_critical_hours: 72,
    dependency_chain_threshold: 3,
    stale_task_days: 7,
    low_velocity_threshold: 2,
    notify_project_owner: true,
    notify_team_members: false,
    notify_on_warning: true,
    notify_on_critical: true
  });

  useEffect(() => {
    if (existingConfig) {
      setConfig({
        is_enabled: existingConfig.is_enabled ?? true,
        overdue_threshold_days: existingConfig.overdue_threshold_days ?? 1,
        overdue_critical_days: existingConfig.overdue_critical_days ?? 3,
        member_overload_threshold: existingConfig.member_overload_threshold ?? 5,
        member_overload_critical: existingConfig.member_overload_critical ?? 8,
        blocked_task_threshold_hours: existingConfig.blocked_task_threshold_hours ?? 24,
        blocked_task_critical_hours: existingConfig.blocked_task_critical_hours ?? 72,
        dependency_chain_threshold: existingConfig.dependency_chain_threshold ?? 3,
        stale_task_days: existingConfig.stale_task_days ?? 7,
        low_velocity_threshold: existingConfig.low_velocity_threshold ?? 2,
        notify_project_owner: existingConfig.notify_project_owner ?? true,
        notify_team_members: existingConfig.notify_team_members ?? false,
        notify_on_warning: existingConfig.notify_on_warning ?? true,
        notify_on_critical: existingConfig.notify_on_critical ?? true
      });
    }
  }, [existingConfig]);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      if (existingConfig) {
        await base44.entities.ProjectAlertConfig.update(existingConfig.id, config);
      } else {
        await base44.entities.ProjectAlertConfig.create({
          ...config,
          project_id: project.id,
          user_id: currentUser?.email
        });
      }
      queryClient.invalidateQueries({ queryKey: ['projectAlertConfig', project.id] });
      onClose();
    } catch (err) {
      console.error('Failed to save config:', err);
    }
    setIsSaving(false);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-500" />
            Bottleneck Alert Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Master Toggle */}
            <Card className={config.is_enabled ? 'border-violet-200 bg-violet-50/50 dark:bg-violet-900/10' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${config.is_enabled ? 'text-violet-500' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-medium">Proactive Alerts</h4>
                      <p className="text-sm text-slate-500">Get notified before bottlenecks become critical</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.is_enabled}
                    onCheckedChange={(v) => updateConfig('is_enabled', v)}
                  />
                </div>
              </CardContent>
            </Card>

            {config.is_enabled && (
              <Tabs defaultValue="thresholds">
                <TabsList className="w-full">
                  <TabsTrigger value="thresholds" className="flex-1">Thresholds</TabsTrigger>
                  <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="thresholds" className="space-y-4 mt-4">
                  {/* Overdue Tasks */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" /> Overdue Tasks
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Alert when tasks exceed their due date
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-amber-100 text-amber-700 text-[10px]">Warning</Badge>
                            Days overdue
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.overdue_threshold_days]}
                              onValueChange={([v]) => updateConfig('overdue_threshold_days', v)}
                              min={1}
                              max={7}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.overdue_threshold_days}d</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-red-100 text-red-700 text-[10px]">Critical</Badge>
                            Days overdue
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.overdue_critical_days]}
                              onValueChange={([v]) => updateConfig('overdue_critical_days', v)}
                              min={1}
                              max={14}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.overdue_critical_days}d</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Overload */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> Team Member Overload
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Alert when a team member has too many active tasks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-amber-100 text-amber-700 text-[10px]">Warning</Badge>
                            Tasks in progress
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.member_overload_threshold]}
                              onValueChange={([v]) => updateConfig('member_overload_threshold', v)}
                              min={3}
                              max={10}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.member_overload_threshold}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-red-100 text-red-700 text-[10px]">Critical</Badge>
                            Tasks in progress
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.member_overload_critical]}
                              onValueChange={([v]) => updateConfig('member_overload_critical', v)}
                              min={5}
                              max={15}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.member_overload_critical}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Blocked Tasks */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> Blocked Tasks
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Alert when tasks remain blocked for too long
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-amber-100 text-amber-700 text-[10px]">Warning</Badge>
                            Hours blocked
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.blocked_task_threshold_hours]}
                              onValueChange={([v]) => updateConfig('blocked_task_threshold_hours', v)}
                              min={12}
                              max={72}
                              step={12}
                              className="flex-1"
                            />
                            <span className="w-10 text-center font-mono text-sm">{config.blocked_task_threshold_hours}h</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Badge className="bg-red-100 text-red-700 text-[10px]">Critical</Badge>
                            Hours blocked
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.blocked_task_critical_hours]}
                              onValueChange={([v]) => updateConfig('blocked_task_critical_hours', v)}
                              min={24}
                              max={168}
                              step={24}
                              className="flex-1"
                            />
                            <span className="w-10 text-center font-mono text-sm">{config.blocked_task_critical_hours}h</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dependency Chains */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-purple-500" /> Dependency Chains
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Alert when dependency chains become too long
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label className="text-xs">Max chain length before alert</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            value={[config.dependency_chain_threshold]}
                            onValueChange={([v]) => updateConfig('dependency_chain_threshold', v)}
                            min={2}
                            max={6}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-8 text-center font-mono text-sm">{config.dependency_chain_threshold}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Thresholds */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" /> Additional Thresholds
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Timer className="w-3 h-3" /> Stale task (days)
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.stale_task_days]}
                              onValueChange={([v]) => updateConfig('stale_task_days', v)}
                              min={3}
                              max={14}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.stale_task_days}d</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Min velocity (tasks/week)
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[config.low_velocity_threshold]}
                              onValueChange={([v]) => updateConfig('low_velocity_threshold', v)}
                              min={1}
                              max={10}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-mono text-sm">{config.low_velocity_threshold}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Who to Notify</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Project Owner</Label>
                          <p className="text-xs text-slate-500">Always notify the project owner</p>
                        </div>
                        <Switch
                          checked={config.notify_project_owner}
                          onCheckedChange={(v) => updateConfig('notify_project_owner', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Team Members</Label>
                          <p className="text-xs text-slate-500">Notify affected team members</p>
                        </div>
                        <Switch
                          checked={config.notify_team_members}
                          onCheckedChange={(v) => updateConfig('notify_team_members', v)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Alert Levels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-700">Warning</Badge>
                          <span className="text-sm">Early warning alerts</span>
                        </div>
                        <Switch
                          checked={config.notify_on_warning}
                          onCheckedChange={(v) => updateConfig('notify_on_warning', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-700">Critical</Badge>
                          <span className="text-sm">Critical issue alerts</span>
                        </div>
                        <Switch
                          checked={config.notify_on_critical}
                          onCheckedChange={(v) => updateConfig('notify_on_critical', v)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={saveConfig} 
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}