import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Folder, CheckCircle2, Clock, XCircle, Flag, FileEdit, 
  LayoutGrid, Droplets, Wheat, Home, Zap, Heart, Mountain,
  Globe, Leaf, GraduationCap, Cpu, Hammer, ShieldCheck, Sparkles,
  Briefcase, Lightbulb, FlaskConical, Rocket, TrendingUp, Building2
} from 'lucide-react';

const STAGE_CONFIG = {
  idea: { label: 'Idea', icon: Lightbulb, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  prototype: { label: 'Prototype', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  pilot: { label: 'Pilot', icon: Rocket, color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  scaling: { label: 'Scaling', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  mature_ops: { label: 'Mature Ops', icon: Building2, color: 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300' },
};

const STATUS_CHIPS = [
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { key: 'pending_review', label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { key: 'rfi_pending', label: 'RFI Pending', icon: Clock, color: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200' },
  { key: 'declined', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { key: 'flagged', label: 'Flagged', icon: Flag, color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
  { key: 'draft', label: 'Drafts', icon: FileEdit, color: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' },
];

export const SECTOR_CONFIG = {
  water: { label: 'Water', icon: Droplets, color: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200', keywords: ['water', 'desalination', 'irrigation', 'aqua', 'hydro', 'well', 'purification'] },
  food: { label: 'Food', icon: Wheat, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200', keywords: ['food', 'agriculture', 'farming', 'permaculture', 'biodynamic', 'harvest', 'crop', 'seed', 'nutrition', 'organic'] },
  housing: { label: 'Housing', icon: Home, color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200', keywords: ['housing', 'shelter', 'home', 'building', 'construction', 'vaastu', 'architecture', 'temple', 'garbha', 'residential'] },
  power: { label: 'Power / Energy', icon: Zap, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200', keywords: ['power', 'energy', 'solar', 'wind', 'electric', 'grid', 'battery', 'renewable', 'generator', 'tesla'] },
  healing: { label: 'Healing', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200', keywords: ['healing', 'health', 'wellness', 'therapy', 'holistic', 'medicine', 'meditation', 'consciousness', 'sanctuary'] },
  mining: { label: 'Mining', icon: Mountain, color: 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300', keywords: ['mining', 'mineral', 'extraction', 'ore', 'gold', 'lithium', 'rare earth'] },
  environment: { label: 'Environment', icon: Leaf, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', keywords: ['environment', 'climate', 'regenerative', 'earth', 'sustainability', 'eco', 'conservation', 'reforestation'] },
  education: { label: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200', keywords: ['education', 'school', 'academy', 'learning', 'training', 'course', 'teach', 'curriculum'] },
  technology: { label: 'Technology', icon: Cpu, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', keywords: ['technology', 'tech', 'ai', 'software', 'platform', 'digital', 'blockchain', 'app', 'web3'] },
  infrastructure: { label: 'Infrastructure', icon: Hammer, color: 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300', keywords: ['infrastructure', 'road', 'bridge', 'transport', 'logistics', 'supply chain', 'network'] },
  governance: { label: 'Governance', icon: ShieldCheck, color: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200', keywords: ['governance', 'community', 'cooperative', 'council', 'sovereign', 'alliance', 'policy', 'legal'] },
  other: { label: 'Other', icon: Sparkles, color: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200', keywords: [] },
};

export function classifyProjectSector(project) {
  // Use stored sector if available
  if (project.sector && SECTOR_CONFIG[project.sector]) {
    return project.sector;
  }
  // Fallback to keyword classification
  const text = [
    project.title || '',
    project.description || '',
    project.problem_statement || '',
    project.use_of_funds || '',
    project.alignment_statement || '',
    project.success_definition || '',
    project.impact_beneficiaries || '',
    project.lane_code || '',
    ...(project.derived_tags || []),
    ...(project.impact_tags || []),
    ...(project.lane_secondary || []),
  ].join(' ').toLowerCase();

  for (const [key, cfg] of Object.entries(SECTOR_CONFIG)) {
    if (key === 'other') continue;
    if (cfg.keywords.some(kw => text.includes(kw))) {
      return key;
    }
  }
  return 'other';
}

function ChipButton({ isActive, onClick, icon: Icon, label, count, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
        isActive
          ? 'bg-violet-600 text-white border-violet-600 shadow-md'
          : colorClass
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label} {count !== undefined ? `(${count})` : ''}
    </button>
  );
}

export default function ProjectSummaryBar({ projects = [], activeStatus, activeSector, activeStage, onStatusClick, onSectorClick, onStageClick }) {
  // Helper: filter by status + stage (for sector counts)
  const filterByStatusAndStage = (p) => {
    if (activeStatus !== 'all' && p.status !== activeStatus) return false;
    if (activeStage !== 'all' && (p.stage || 'idea') !== activeStage) return false;
    return true;
  };
  // Helper: filter by sector + stage (for status counts)
  const filterBySectorAndStage = (p) => {
    if (activeSector !== 'all' && classifyProjectSector(p) !== activeSector) return false;
    if (activeStage !== 'all' && (p.stage || 'idea') !== activeStage) return false;
    return true;
  };
  // Helper: filter by sector + status (for stage counts)
  const filterBySectorAndStatus = (p) => {
    if (activeSector !== 'all' && classifyProjectSector(p) !== activeSector) return false;
    if (activeStatus !== 'all' && p.status !== activeStatus) return false;
    return true;
  };

  // Sector counts: filtered by current status + stage
  const sectorFiltered = projects.filter(filterByStatusAndStage);
  const sectorCounts = {};
  for (const p of sectorFiltered) {
    const sector = classifyProjectSector(p);
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
  }

  // Stage counts: filtered by current sector + status
  const stageFiltered = projects.filter(filterBySectorAndStatus);
  const stageCounts = {};
  for (const p of stageFiltered) {
    const s = p.stage || 'idea';
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  }

  // Status counts: filtered by current sector + stage
  const statusFiltered = projects.filter(filterBySectorAndStage);
  const statusCounts = {};
  for (const chip of STATUS_CHIPS) {
    statusCounts[chip.key] = statusFiltered.filter(p => p.status === chip.key).length;
  }

  // Only show sectors that have at least 1 project (from full list, so they don't disappear)
  const allSectorCounts = {};
  for (const p of projects) {
    const sector = classifyProjectSector(p);
    allSectorCounts[sector] = (allSectorCounts[sector] || 0) + 1;
  }
  const visibleSectors = Object.entries(SECTOR_CONFIG).filter(
    ([key]) => (allSectorCounts[key] || 0) > 0
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Sector Dashboard */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Project Sectors
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <button
            onClick={() => onSectorClick('all')}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer",
              activeSector === 'all'
                ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            )}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-xs font-semibold">All</span>
            <span className={cn("text-lg font-bold", activeSector === 'all' ? 'text-white' : 'text-slate-900')}>{sectorFiltered.length}</span>
          </button>
          {visibleSectors.map(([key, cfg]) => {
            const count = sectorCounts[key] || 0;
            const Icon = cfg.icon;
            const isActive = activeSector === key;
            return (
              <button
                key={key}
                onClick={() => onSectorClick(key)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : cn('border', cfg.color)
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold truncate max-w-full">{cfg.label}</span>
                <span className={cn("text-lg font-bold", isActive ? 'text-white' : 'text-slate-900')}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage row */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Stage
        </div>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            isActive={activeStage === 'all'}
            onClick={() => onStageClick('all')}
            icon={LayoutGrid}
            label="All Stages"
            colorClass="bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
          />
          {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
            <ChipButton
              key={key}
              isActive={activeStage === key}
              onClick={() => onStageClick(key)}
              icon={cfg.icon}
              label={cfg.label}
              count={stageCounts[key] || 0}
              colorClass={cfg.color}
            />
          ))}
        </div>
      </div>

      {/* Status row */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5" /> Status
        </div>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            isActive={activeStatus === 'all'}
            onClick={() => onStatusClick('all')}
            icon={LayoutGrid}
            label="All"
            count={statusFiltered.length}
            colorClass="bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
          />
          {STATUS_CHIPS.map(chip => (
            <ChipButton
              key={chip.key}
              isActive={activeStatus === chip.key}
              onClick={() => onStatusClick(chip.key)}
              icon={chip.icon}
              label={chip.label}
              count={statusCounts[chip.key] || 0}
              colorClass={chip.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}