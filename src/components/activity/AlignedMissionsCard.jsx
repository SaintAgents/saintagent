import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Target, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function AlignedMissionsCard() {
  const { data: missions = [] } = useQuery({
    queryKey: ['alignedMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 5),
    staleTime: 600000,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-lg text-slate-900">Aligned Missions</h3>
      </div>
      <div className="space-y-3">
        {missions.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No active missions found</p>
        ) : (
          missions.slice(0, 3).map((mission) => (
            <Link
              key={mission.id}
              to={`/MissionDetail?id=${mission.id}`}
              className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-900 font-medium">{mission.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500">{mission.participant_count || 0} joined</span>
            </Link>
          ))
        )}
      </div>
      <Link to="/Missions" className="block mt-4">
        <p className="text-xs text-violet-600 font-medium hover:text-violet-800 transition-colors">
          View all missions →
        </p>
      </Link>
    </div>
  );
}