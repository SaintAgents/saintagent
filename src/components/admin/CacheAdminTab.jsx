import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Database, RefreshCcw, Zap, Save,
  Trash2, BarChart3, Clock, Settings2,
  AlertTriangle
} from 'lucide-react';
import CacheStatsBar from '@/components/admin/CacheStatsBar';
import CacheGroupEditor from '@/components/admin/CacheGroupEditor';
import LoadBalanceAnalyzer from '@/components/admin/LoadBalanceAnalyzer';

const DEFAULT_CONFIG = {
  groups: {
    currentUser: { label: 'Current User / Auth', staleMinutes: 30, refetchOnFocus: false, refetchOnMount: false },
    profile: { label: 'User Profiles', staleMinutes: 30, refetchOnFocus: false, refetchOnMount: false },
    notifications: { label: 'Notifications', staleMinutes: 10, refetchOnFocus: false, refetchOnMount: false },
    onboarding: { label: 'Onboarding Progress', staleMinutes: 120, refetchOnFocus: false, refetchOnMount: false },
    deals: { label: 'Deals & Pipeline', staleMinutes: 5, refetchOnFocus: false, refetchOnMount: true },
    social: { label: 'Followers / Following', staleMinutes: 10, refetchOnFocus: false, refetchOnMount: false },
    badges: { label: 'Badges & Roles', staleMinutes: 30, refetchOnFocus: false, refetchOnMount: false },
    testimonials: { label: 'Testimonials', staleMinutes: 10, refetchOnFocus: false, refetchOnMount: false },
    skills: { label: 'Skills / Intentions / Desires', staleMinutes: 30, refetchOnFocus: false, refetchOnMount: false },
    affiliate: { label: 'Affiliate Codes', staleMinutes: 60, refetchOnFocus: false, refetchOnMount: false },
    activityFeed: { label: 'Activity Feed', staleMinutes: 10, refetchOnFocus: false, refetchOnMount: false },
    listings: { label: 'Marketplace Listings', staleMinutes: 5, refetchOnFocus: false, refetchOnMount: true },
  },
  globalDefaults: {
    retryCount: 0,
    gcTimeMultiplier: 2,
  }
};

export default function CacheAdminTab() {
  const queryClient = useQueryClient();

  const { data: savedSettings = [] } = useQuery({
    queryKey: ['platformSetting', 'cache_config'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'cache_config' }),
    staleTime: 60000,
  });

  const savedConfig = useMemo(() => {
    const raw = savedSettings?.[0]?.value;
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
  }, [savedSettings]);

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (savedConfig) {
      setConfig(prev => ({
        ...prev,
        ...savedConfig,
        groups: { ...prev.groups, ...savedConfig.groups },
        globalDefaults: { ...prev.globalDefaults, ...savedConfig.globalDefaults },
      }));
    }
  }, [savedConfig]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = savedSettings?.[0];
      const payload = { key: 'cache_config', value: JSON.stringify(config) };
      if (existing?.id) {
        await base44.entities.PlatformSetting.update(existing.id, payload);
      } else {
        await base44.entities.PlatformSetting.create(payload);
      }
    },
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['platformSetting', 'cache_config'] });
    }
  });

  const updateGroup = (key, field, value) => {
    setConfig(prev => ({
      ...prev,
      groups: { ...prev.groups, [key]: { ...prev.groups[key], [field]: value } }
    }));
    setDirty(true);
  };

  const updateGlobal = (field, value) => {
    setConfig(prev => ({
      ...prev,
      globalDefaults: { ...prev.globalDefaults, [field]: value }
    }));
    setDirty(true);
  };

  const resetToDefaults = () => { setConfig(DEFAULT_CONFIG); setDirty(true); };

  const queryCache = queryClient.getQueryCache();
  const allQueries = queryCache.getAll();

  const cacheStats = useMemo(() => {
    const total = allQueries.length;
    const fresh = allQueries.filter(q => q.state.status === 'success' && !q.isStale()).length;
    const stale = allQueries.filter(q => q.isStale()).length;
    const fetching = allQueries.filter(q => q.state.fetchStatus === 'fetching').length;
    const errored = allQueries.filter(q => q.state.status === 'error').length;
    const totalDataSize = allQueries.reduce((acc, q) => {
      try { return acc + JSON.stringify(q.state.data || '').length; } catch { return acc; }
    }, 0);
    return { total, fresh, stale, fetching, errored, totalDataSize };
  }, [allQueries]);

  const queryKeyGroups = useMemo(() => {
    const map = {};
    allQueries.forEach(q => {
      const key = Array.isArray(q.queryKey) ? q.queryKey[0] : String(q.queryKey);
      if (!map[key]) map[key] = { count: 0, stale: 0, fetching: 0, errors: 0 };
      map[key].count++;
      if (q.isStale()) map[key].stale++;
      if (q.state.fetchStatus === 'fetching') map[key].fetching++;
      if (q.state.status === 'error') map[key].errors++;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 15);
  }, [allQueries]);

  return (
    <div className="space-y-6">
      {/* Unsaved banner */}
      {dirty && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span className="text-amber-700 text-sm">Unsaved changes</span>
          <Button
            size="sm"
            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      )}

      {/* Stats */}
      <CacheStatsBar stats={cacheStats} />

      {/* Load Balance Analyzer */}
      <LoadBalanceAnalyzer 
        config={config} 
        onApplySuggestion={(optimized) => {
          setConfig(prev => ({
            ...prev,
            groups: { ...prev.groups, ...(optimized.groups || {}) },
            globalDefaults: { ...prev.globalDefaults, ...(optimized.globalDefaults || {}) },
          }));
          setDirty(true);
        }}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => queryClient.invalidateQueries()}>
              <RefreshCcw className="w-4 h-4" /> Invalidate All Caches
            </Button>
            <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => queryClient.clear()}>
              <Trash2 className="w-4 h-4" /> Flush Entire Cache
            </Button>
            <Button variant="outline" className="gap-2" onClick={resetToDefaults}>
              <Settings2 className="w-4 h-4" /> Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Query Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Live Query Breakdown
            <Badge variant="secondary" className="ml-2">{allQueries.length} queries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 pr-4">Query Key</th>
                  <th className="pb-2 pr-4 text-center">Count</th>
                  <th className="pb-2 pr-4 text-center">Stale</th>
                  <th className="pb-2 pr-4 text-center">Fetching</th>
                  <th className="pb-2 pr-4 text-center">Errors</th>
                </tr>
              </thead>
              <tbody>
                {queryKeyGroups.map(([key, data]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-mono text-xs text-slate-700">{key}</td>
                    <td className="py-2 pr-4 text-center">{data.count}</td>
                    <td className="py-2 pr-4 text-center">
                      <Badge variant={data.stale > 0 ? 'secondary' : 'outline'} className="text-xs">{data.stale}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {data.fetching > 0 ? (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">{data.fetching}</Badge>
                      ) : <span className="text-slate-300">0</span>}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {data.errors > 0 ? (
                        <Badge className="bg-red-100 text-red-700 text-xs">{data.errors}</Badge>
                      ) : <span className="text-slate-300">0</span>}
                    </td>
                  </tr>
                ))}
                {queryKeyGroups.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">No queries in cache</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Global Defaults */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5 text-slate-500" />
            Global Defaults
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">Retry Count on Failure</Label>
              <Input
                type="number" min={0} max={5}
                value={config.globalDefaults.retryCount}
                onChange={(e) => updateGlobal('retryCount', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">How many times to retry a failed query (0 = no retry)</p>
            </div>
            <div>
              <Label className="text-sm font-medium">GC Time Multiplier</Label>
              <Input
                type="number" min={1} max={10} step={0.5}
                value={config.globalDefaults.gcTimeMultiplier}
                onChange={(e) => updateGlobal('gcTimeMultiplier', parseFloat(e.target.value) || 2)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Garbage collection time = staleTime × this multiplier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Group Editors */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-500" />
          Query Group Cache Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config.groups).map(([key, group]) => (
            <CacheGroupEditor key={key} groupKey={key} group={group} onUpdate={updateGroup} />
          ))}
        </div>
      </div>

      {/* Save Button (bottom) */}
      {dirty && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="w-5 h-5" />
            {saveMutation.isPending ? 'Saving…' : 'Save All Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}