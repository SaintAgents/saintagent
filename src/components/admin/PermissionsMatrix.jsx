import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lock, Grid3X3 } from "lucide-react";
import ROLE_DEFS, { 
  ROLE_ORDER, 
  PERMISSION_DEFINITIONS,
  SECTION_DEFINITIONS,
  DEFAULT_ROLE_GROUPS 
} from '@/components/roles/RoleDefinitions';

export default function PermissionsMatrix({ roleGroups = [] }) {
  // Combine default and custom groups
  const allGroups = [
    ...Object.values(DEFAULT_ROLE_GROUPS).map(g => ({ ...g, _isDefault: true })),
    ...roleGroups.filter(g => g.is_active !== false)
  ];

  // Get all roles (excluding member)
  const roles = ROLE_ORDER.filter(code => code !== 'member' && ROLE_DEFS[code]);
  const permissions = Object.keys(PERMISSION_DEFINITIONS);
  const sections = Object.keys(SECTION_DEFINITIONS);

  // Build permission matrix
  const getPermissionForRole = (roleCode, permKey) => {
    for (const group of allGroups) {
      if (group.roles?.includes(roleCode) && group.permissions?.[permKey]) {
        return true;
      }
    }
    return false;
  };

  // Build section access matrix
  const getSectionAccessForRole = (roleCode, section) => {
    for (const group of allGroups) {
      if (group.roles?.includes(roleCode)) {
        if (group.section_access?.includes('*') || group.section_access?.includes(section)) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-violet-600" />
            Permissions Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-slate-700 sticky left-0 bg-white z-10">
                    Permission
                  </th>
                  {roles.map(roleCode => (
                    <th key={roleCode} className="p-2 text-center font-medium text-slate-700 min-w-[80px]">
                      <div className="truncate" title={ROLE_DEFS[roleCode]?.title}>
                        {ROLE_DEFS[roleCode]?.title?.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(permKey => (
                  <tr key={permKey} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-slate-900 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {PERMISSION_DEFINITIONS[permKey]?.label}
                      </div>
                    </td>
                    {roles.map(roleCode => {
                      const hasPermission = getPermissionForRole(roleCode, permKey);
                      return (
                        <td key={roleCode} className="p-2 text-center">
                          {hasPermission ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            Section Access Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-slate-700 sticky left-0 bg-white z-10">
                    Section
                  </th>
                  {roles.map(roleCode => (
                    <th key={roleCode} className="p-2 text-center font-medium text-slate-700 min-w-[80px]">
                      <div className="truncate" title={ROLE_DEFS[roleCode]?.title}>
                        {ROLE_DEFS[roleCode]?.title?.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map(section => (
                  <tr key={section} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-slate-900 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {SECTION_DEFINITIONS[section]?.category}
                        </Badge>
                        {SECTION_DEFINITIONS[section]?.label}
                      </div>
                    </td>
                    {roles.map(roleCode => {
                      const hasAccess = getSectionAccessForRole(roleCode, section);
                      return (
                        <td key={roleCode} className="p-2 text-center">
                          {hasAccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Group Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Role Group Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {allGroups.map(group => {
              const permCount = Object.values(group.permissions || {}).filter(Boolean).length;
              const sectionCount = group.section_access?.includes('*') 
                ? sections.length 
                : (group.section_access?.length || 0);
              
              return (
                <div 
                  key={group.code} 
                  className={`p-3 rounded-lg border bg-${group.color || 'slate'}-50 border-${group.color || 'slate'}-200`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-${group.color || 'slate'}-500`} />
                    <span className="font-medium text-sm">{group.name}</span>
                    {group._isDefault && (
                      <Badge variant="outline" className="text-[9px]">Default</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Level: {group.hierarchy_level || 0}</p>
                    <p>Roles: {(group.roles || []).length}</p>
                    <p>Permissions: {permCount}</p>
                    <p>Sections: {group.section_access?.includes('*') ? 'All' : sectionCount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}