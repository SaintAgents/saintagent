import { Activity, CheckCircle2, Clock, AlertTriangle, Loader2, HardDrive } from 'lucide-react';

function StatTile({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function CacheStatsBar({ stats }) {
  const sizeKB = (stats.totalDataSize / 1024).toFixed(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatTile
        icon={Activity}
        label="Total Queries"
        value={stats.total}
        color="bg-blue-500"
      />
      <StatTile
        icon={CheckCircle2}
        label="Fresh (Cached)"
        value={stats.fresh}
        color="bg-emerald-500"
        sub={stats.total > 0 ? `${Math.round((stats.fresh / stats.total) * 100)}% hit rate` : ''}
      />
      <StatTile
        icon={Clock}
        label="Stale"
        value={stats.stale}
        color="bg-amber-500"
      />
      <StatTile
        icon={Loader2}
        label="Currently Fetching"
        value={stats.fetching}
        color="bg-violet-500"
      />
      <StatTile
        icon={AlertTriangle}
        label="Errors"
        value={stats.errored}
        color={stats.errored > 0 ? "bg-red-500" : "bg-slate-400"}
      />
      <StatTile
        icon={HardDrive}
        label="Cache Size"
        value={`${sizeKB} KB`}
        color="bg-slate-600"
      />
    </div>
  );
}