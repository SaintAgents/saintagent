import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  GitBranch, Shield, Crown, Users, Lock, Eye, CheckCircle2, 
  ChevronDown, Zap
} from "lucide-react";
import ROLE_DEFS, { 
  ROLE_HIERARCHY, 
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_GROUPS 
} from '@/components/roles/RoleDefinitions';

const LEVEL_COLORS = {
  0: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700', line: 'bg-slate-300' },
  1: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', line: 'bg-emerald-300' },
  2: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800', line: 'bg-emerald-400' },
  3: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', line: 'bg-amber-300' },
  4: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', line: 'bg-amber-400' },
  5: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', line: 'bg-violet-300' },
  6: { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800', line: 'bg-violet-400' },
  7: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', line: 'bg-rose-300' },
  8: { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', line: 'bg-rose-400' },
};

export default function RoleHierarchyTree({ roleGroups = [] }) {
  // Combine default and custom groups
  const allGroups = [
    ...Object.values(DEFAULT_ROLE_GROUPS).map(g => ({ ...g, _isDefault: true })),
    ...roleGroups.filter(g => g.is_active !== false)
  ];

  // Build role-to-group mapping
  const roleToGroups = {};
  allGroups.forEach(group => {
    (group.roles || []).forEach(roleCode => {
      if (!roleToGroups[roleCode]) roleToGroups[roleCode] = [];
      roleToGroups[roleCode].push(group);
    });
  });

  // Sort roles by hierarchy level
  const sortedRoles = Object.entries(ROLE_HIERARCHY)
    .sort(([, a], [, b]) => b - a)
    .map(([code, level]) => ({ code, level, def: ROLE_DEFS[code] }))
    .filter(r => r.def);

  // Get max level for scaling
  const maxLevel = Math.max(...sortedRoles.map(r => r.level));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-violet-600" />
          Role Hierarchy Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative">
            {/* Vertical line connecting all levels */}
            <div className="absolute left-[140px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-400 via-violet-400 to-slate-300" />

            {/* Roles */}
            <div className="space-y-3">
              {sortedRoles.map((role, idx) => {
                const colors = LEVEL_COLORS[role.level] || LEVEL_COLORS[0];
                const groups = roleToGroups[role.code] || [];
                const permissions = getPermissionsForRole(role.code, allGroups);
                const isTopTier = role.level >= 7;
                const isMidTier = role.level >= 4 && role.level < 7;

                return (
                  <div key={role.code} className="flex items-center gap-4">
                    {/* Level indicator */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <Badge variant="outline" className={`${colors.text} ${colors.border} ${colors.bg}`}>
                        L{role.level}
                      </Badge>
                    </div>

                    {/* Connection line */}
                    <div className="relative flex items-center">
                      <div className={`w-12 h-0.5 ${colors.line}`} />
                      <div className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border-2`} />
                    </div>

                    {/* Role card */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex-1 p-3 rounded-lg border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-md cursor-pointer`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isTopTier ? (
                                <Crown className={`w-4 h-4 ${colors.text}`} />
                              ) : isMidTier ? (
                                <Shield className={`w-4 h-4 ${colors.text}`} />
                              ) : (
                                <Users className={`w-4 h-4 ${colors.text}`} />
                              )}
                              <span className={`font-medium ${colors.text}`}>
                                {role.def.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Groups badges */}
                              {groups.slice(0, 2).map(g => (
                                <Badge 
                                  key={g.code} 
                                  variant="secondary" 
                                  className="text-[10px] px-1.5"
                                >
                                  {g.name}
                                </Badge>
                              ))}
                              {groups.length > 2 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{groups.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Permission indicators */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(permissions).filter(([_, v]) => v).slice(0, 5).map(([key]) => (
                              <span 
                                key={key} 
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {PERMISSION_DEFINITIONS[key]?.label || key}
                              </span>
                            ))}
                            {Object.entries(permissions).filter(([_, v]) => v).length > 5 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                +{Object.entries(permissions).filter(([_, v]) => v).length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-medium">{role.def.title}</p>
                          <p className="text-xs text-slate-500">{role.def.purpose}</p>
                          <div className="text-xs">
                            <p className="font-medium mb-1">Capabilities:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {role.def.capabilities?.slice(0, 4).map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          {role.def.minRank && (
                            <p className="text-xs text-amber-600">
                              Requires {role.def.minRank}+ rank
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Authority arrow */}
                    {idx < sortedRoles.length - 1 && (
                      <div className="absolute right-4 -bottom-2 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-rose-500" />
                <span>Platform Leadership (L7-8)</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                <span>Senior Roles (L4-6)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Community Roles (L1-3)</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Higher = More Authority</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// Helper to get combined permissions for a role
function getPermissionsForRole(roleCode, allGroups) {
  const permissions = {};
  
  allGroups.forEach(group => {
    if (group.roles?.includes(roleCode)) {
      Object.entries(group.permissions || {}).forEach(([key, value]) => {
        if (value) permissions[key] = true;
      });
    }
  });
  
  return permissions;
}