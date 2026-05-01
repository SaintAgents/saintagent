import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Play, Square, Zap, BarChart3, ArrowRight, RefreshCcw
} from 'lucide-react';
import RateLimitChart from './RateLimitChart';
import SuggestedParameters from './SuggestedParameters';

// Track API calls globally via console error interception
const rateLimitLog = [];
const apiCallLog = [];
let interceptInstalled = false;

function installInterceptor() {
  if (interceptInstalled) return;
  interceptInstalled = true;
  
  const origError = console.error;
  console.error = (...args) => {
    const msg = args.map(a => typeof a === 'string' ? a : '').join(' ');
    if (msg.includes('429') || msg.includes('Rate limit')) {
      rateLimitLog.push({ ts: Date.now(), type: '429' });
      if (rateLimitLog.length > 500) rateLimitLog.shift();
    }
    origError.apply(console, args);
  };

  // Intercept fetch to track all API calls
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const isApi = url.includes('/api/') || url.includes('base44') || url.includes('supabase');
    if (isApi) {
      apiCallLog.push({ ts: Date.now(), url: url.split('?')[0].split('/').slice(-2).join('/') });
      if (apiCallLog.length > 1000) apiCallLog.shift();
    }
    const res = await origFetch.apply(window, args);
    if (isApi && res.status === 429) {
      rateLimitLog.push({ ts: Date.now(), type: '429', url: url.split('?')[0].split('/').slice(-2).join('/') });
      if (rateLimitLog.length > 500) rateLimitLog.shift();
    }
    return res;
  };
}

export default function LoadBalanceAnalyzer({ config, onApplySuggestion }) {
  const queryClient = useQueryClient();
  const [monitoring, setMonitoring] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    installInterceptor();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const takeSnapshot = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    const now = Date.now();

    // Count recent rate limits (last 60s)
    const recentLimits = rateLimitLog.filter(r => now - r.ts < 60000).length;
    // Count recent API calls (last 60s)
    const recentCalls = apiCallLog.filter(r => now - r.ts < 60000).length;
    
    // Query stats
    const total = allQueries.length;
    const fetching = allQueries.filter(q => q.state.fetchStatus === 'fetching').length;
    const stale = allQueries.filter(q => q.isStale()).length;
    const errored = allQueries.filter(q => q.state.status === 'error').length;

    // Group by key for hotspot detection
    const keyMap = {};
    allQueries.forEach(q => {
      const key = Array.isArray(q.queryKey) ? q.queryKey[0] : String(q.queryKey);
      if (!keyMap[key]) keyMap[key] = { count: 0, fetching: 0, stale: 0, errors: 0 };
      keyMap[key].count++;
      if (q.state.fetchStatus === 'fetching') keyMap[key].fetching++;
      if (q.isStale()) keyMap[key].stale++;
      if (q.state.status === 'error') keyMap[key].errors++;
    });

    const snapshot = {
      ts: now,
      total,
      fetching,
      stale,
      errored,
      rateLimits: recentLimits,
      apiCalls: recentCalls,
      callsPerSec: recentCalls / 60,
      keyMap
    };

    setSnapshots(prev => {
      const next = [...prev, snapshot];
      return next.length > 120 ? next.slice(-120) : next; // Keep last 10 minutes at 5s intervals
    });

    return snapshot;
  }, [queryClient]);

  const startMonitoring = () => {
    setMonitoring(true);
    setSnapshots([]);
    setAnalysis(null);
    // Take initial snapshot
    takeSnapshot();
    // Take snapshot every 5 seconds
    intervalRef.current = setInterval(takeSnapshot, 5000);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Run analysis
    if (snapshots.length > 2) {
      runAnalysis();
    }
  };

  const runAnalysis = useCallback(() => {
    if (snapshots.length < 2) return;

    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();

    // Aggregate stats
    const avgFetching = snapshots.reduce((s, snap) => s + snap.fetching, 0) / snapshots.length;
    const avgCallsPerSec = snapshots.reduce((s, snap) => s + snap.callsPerSec, 0) / snapshots.length;
    const totalRateLimits = rateLimitLog.length;
    const peakFetching = Math.max(...snapshots.map(s => s.fetching));
    const peakCallsPerSec = Math.max(...snapshots.map(s => s.callsPerSec));
    const avgErrors = snapshots.reduce((s, snap) => s + snap.errored, 0) / snapshots.length;

    // Identify hotspots - queries that are fetching too frequently
    const hotspots = {};
    snapshots.forEach(snap => {
      Object.entries(snap.keyMap).forEach(([key, data]) => {
        if (!hotspots[key]) hotspots[key] = { totalFetching: 0, totalErrors: 0, maxCount: 0, samples: 0 };
        hotspots[key].totalFetching += data.fetching;
        hotspots[key].totalErrors += data.errors;
        hotspots[key].maxCount = Math.max(hotspots[key].maxCount, data.count);
        hotspots[key].samples++;
      });
    });

    // Sort by fetch frequency
    const sortedHotspots = Object.entries(hotspots)
      .map(([key, data]) => ({
        key,
        avgFetchRate: data.totalFetching / data.samples,
        errorRate: data.totalErrors / data.samples,
        maxInstances: data.maxCount
      }))
      .filter(h => h.avgFetchRate > 0.1 || h.errorRate > 0)
      .sort((a, b) => b.avgFetchRate - a.avgFetchRate);

    // Health score (0-100)
    let healthScore = 100;
    if (totalRateLimits > 0) healthScore -= Math.min(40, totalRateLimits * 5);
    if (peakCallsPerSec > 5) healthScore -= Math.min(20, (peakCallsPerSec - 5) * 4);
    if (avgErrors > 2) healthScore -= Math.min(20, avgErrors * 3);
    if (peakFetching > 10) healthScore -= Math.min(20, (peakFetching - 10) * 2);
    healthScore = Math.max(0, Math.round(healthScore));

    // Generate suggestions
    const suggestions = [];
    
    // Check current config groups
    const currentGroups = config?.groups || {};

    sortedHotspots.forEach(h => {
      const matchedGroup = Object.entries(currentGroups).find(([gKey]) => {
        return h.key.toLowerCase().includes(gKey.toLowerCase()) || gKey.toLowerCase().includes(h.key.toLowerCase());
      });

      if (h.avgFetchRate > 0.5) {
        const currentStale = matchedGroup ? matchedGroup[1].staleMinutes : 5;
        const suggestedStale = Math.min(120, Math.max(currentStale, Math.round(currentStale * 2)));
        suggestions.push({
          type: 'increase_stale',
          key: h.key,
          groupKey: matchedGroup?.[0],
          current: currentStale,
          suggested: suggestedStale,
          reason: `"${h.key}" averaging ${h.avgFetchRate.toFixed(1)} concurrent fetches — increase stale time to reduce load`,
          impact: 'high'
        });
      }

      if (h.errorRate > 0.3) {
        suggestions.push({
          type: 'disable_refetch',
          key: h.key,
          groupKey: matchedGroup?.[0],
          reason: `"${h.key}" has ${h.errorRate.toFixed(1)} avg errors — disable refetchOnMount to reduce failing calls`,
          impact: 'medium'
        });
      }

      if (h.maxInstances > 5) {
        suggestions.push({
          type: 'deduplicate',
          key: h.key,
          reason: `"${h.key}" has ${h.maxInstances} instances — consider deduplicating or sharing this query`,
          impact: 'medium'
        });
      }
    });

    if (totalRateLimits > 5) {
      suggestions.push({
        type: 'global_throttle',
        reason: `${totalRateLimits} rate limit events detected — increase all stale times by 50% and disable refetchOnFocus globally`,
        impact: 'critical'
      });
    }

    if (peakCallsPerSec > 8) {
      suggestions.push({
        type: 'stagger_loads',
        reason: `Peak ${peakCallsPerSec.toFixed(1)} calls/sec detected — stagger initial page loads to prevent burst`,
        impact: 'high'
      });
    }

    // Generate optimized config suggestion
    const optimizedConfig = JSON.parse(JSON.stringify(config || {}));
    if (optimizedConfig.groups) {
      Object.keys(optimizedConfig.groups).forEach(gKey => {
        const g = optimizedConfig.groups[gKey];
        const hotspot = sortedHotspots.find(h => 
          h.key.toLowerCase().includes(gKey.toLowerCase()) || gKey.toLowerCase().includes(h.key.toLowerCase())
        );
        if (hotspot && hotspot.avgFetchRate > 0.3) {
          g.staleMinutes = Math.min(120, Math.round(g.staleMinutes * 1.5));
          g.refetchOnFocus = false;
          g.refetchOnMount = false;
        }
      });
      // If rate limits detected, boost everything
      if (totalRateLimits > 3) {
        Object.keys(optimizedConfig.groups).forEach(gKey => {
          const g = optimizedConfig.groups[gKey];
          g.staleMinutes = Math.min(120, Math.round(g.staleMinutes * 1.5));
          g.refetchOnFocus = false;
        });
      }
    }

    setAnalysis({
      healthScore,
      avgFetching: avgFetching.toFixed(1),
      avgCallsPerSec: avgCallsPerSec.toFixed(2),
      peakCallsPerSec: peakCallsPerSec.toFixed(2),
      peakFetching,
      totalRateLimits,
      avgErrors: avgErrors.toFixed(1),
      hotspots: sortedHotspots.slice(0, 8),
      suggestions,
      optimizedConfig,
      duration: ((snapshots[snapshots.length - 1].ts - snapshots[0].ts) / 1000).toFixed(0)
    });
  }, [snapshots, config, queryClient]);

  // Health color
  const healthColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const healthBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-violet-500" />
            Load Balance Analyzer
            {monitoring && (
              <Badge className="bg-red-100 text-red-700 animate-pulse ml-2">
                ● Recording
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Monitor live API performance, detect rate limit patterns, and get AI-suggested cache parameter optimizations.
          </p>
          <div className="flex flex-wrap gap-3">
            {!monitoring ? (
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={startMonitoring}>
                <Play className="w-4 h-4" /> Start Monitoring
              </Button>
            ) : (
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={stopMonitoring}>
                <Square className="w-4 h-4" /> Stop & Analyze
              </Button>
            )}
            {!monitoring && snapshots.length > 2 && (
              <Button variant="outline" className="gap-2" onClick={runAnalysis}>
                <RefreshCcw className="w-4 h-4" /> Re-analyze
              </Button>
            )}
            {monitoring && (
              <span className="text-sm text-slate-500 self-center">
                {snapshots.length} samples collected ({Math.round(snapshots.length * 5)}s)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Performance Chart */}
      {(monitoring || snapshots.length > 0) && (
        <RateLimitChart snapshots={snapshots} monitoring={monitoring} />
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Health Score */}
          <Card className={`border ${healthBg(analysis.healthScore)}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${healthColor(analysis.healthScore)}`}>
                    {analysis.healthScore}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Health Score</div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{analysis.avgCallsPerSec}</div>
                    <div className="text-xs text-slate-500">Avg Calls/sec</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{analysis.peakCallsPerSec}</div>
                    <div className="text-xs text-slate-500">Peak Calls/sec</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{analysis.peakFetching}</div>
                    <div className="text-xs text-slate-500">Peak Concurrent</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${analysis.totalRateLimits > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {analysis.totalRateLimits}
                    </div>
                    <div className="text-xs text-slate-500">Rate Limits (429)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{analysis.duration}s</div>
                    <div className="text-xs text-slate-500">Duration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotspots */}
          {analysis.hotspots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Query Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.hotspots.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-mono text-sm text-slate-700">{h.key}</span>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-slate-500">
                            {h.avgFetchRate.toFixed(1)} avg fetches
                          </span>
                          <span className="text-xs text-slate-500">
                            {h.maxInstances} instances
                          </span>
                          {h.errorRate > 0 && (
                            <span className="text-xs text-red-500">
                              {h.errorRate.toFixed(1)} errors
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${h.avgFetchRate > 1 ? 'bg-red-500' : h.avgFetchRate > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, h.avgFetchRate * 50)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          <SuggestedParameters 
            analysis={analysis} 
            currentConfig={config}
            onApply={onApplySuggestion}
          />
        </>
      )}
    </div>
  );
}