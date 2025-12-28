import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import MatchCard from '@/components/hud/MatchCard';
import AIMatchGenerator from '@/components/ai/AIMatchGenerator';

export default function SynchronicityEngine({ profile, matchTab, setMatchTab, filteredMatches = [], matches = [], onMatchAction }) {
  return (
    <div>
      <div className="mb-4">
        <AIMatchGenerator profile={profile} />
      </div>
      <Tabs value={matchTab} onValueChange={setMatchTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
          <TabsTrigger value="offers" className="text-xs">Offers</TabsTrigger>
          <TabsTrigger value="missions" className="text-xs">Missions</TabsTrigger>
          <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
          <TabsTrigger value="teachers" className="text-xs">Teachers</TabsTrigger>
        </TabsList>
        <div className="space-y-3">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No matches yet</p>
              <p className="text-xs text-slate-400 mt-1">Complete your profile to find matches</p>
            </div>
          ) : (
            filteredMatches.slice(0, 3).map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onAction={onMatchAction}
              />
            ))
          )}
          {filteredMatches.length > 3 && (
            <Button variant="ghost" className="w-full text-violet-600">
              View all {filteredMatches.length} matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Tabs>
    </div>
  );
}