import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";

export default function MissionGridLauncher() {
  return (
    <Card>
      <CardContent className="pt-6 text-center space-y-3">
        <Network className="w-12 h-12 text-violet-400 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-900">Mission Grid Visualization</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          View an interactive network map of all missions, their connections, participants, and status.
        </p>
        <Link to="/MissionGrid">
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2 mt-2">
            <Network className="w-4 h-4" />
            Open Grid Visualization
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}