import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-slate-500 mt-1">Configure global platform settings</p>
      </div>

      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Platform settings coming soon</p>
      </div>
    </div>
  );
}