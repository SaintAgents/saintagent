import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SECTOR_CONFIG } from './ProjectSummaryBar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'rfi_pending', label: 'RFI Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'funded', label: 'Funded' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'declined', label: 'Declined' },
  { value: 'flagged', label: 'Flagged' },
];

const STAGE_OPTIONS = [
  { value: 'all', label: 'All Stages' },
  { value: 'idea', label: 'Idea' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'pilot', label: 'Pilot' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'mature_ops', label: 'Mature Ops' },
];

const FUNDING_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'grant', label: 'Grant' },
  { value: 'investment', label: 'Investment' },
  { value: 'bridge_funding', label: 'Bridge Funding' },
];

export default function ProjectSearchSidebar({ filters, onFilterChange, onClose }) {
  const update = (key, value) => onFilterChange({ ...filters, [key]: value });
  
  const resetAll = () => onFilterChange({
    status: 'all', stage: 'all', sector: 'all', fundingType: 'all',
    region: '', minBudget: '', maxBudget: '', dateFrom: '', dateTo: '',
    hasTeam: 'all', riskGrade: 'all',
  });

  const activeCount = Object.entries(filters).filter(([k, v]) => v && v !== 'all' && v !== '').length;

  return (
    <div className="w-72 shrink-0 bg-white border-r border-slate-200 p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)] rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-violet-600" />
          <h3 className="font-semibold text-sm text-slate-900">Advanced Filters</h3>
          {activeCount > 0 && (
            <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetAll} title="Reset all">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <FilterGroup label="Status">
        <Select value={filters.status} onValueChange={v => update('status', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup label="Stage">
        <Select value={filters.stage} onValueChange={v => update('stage', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{STAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup label="Sector">
        <Select value={filters.sector} onValueChange={v => update('sector', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup label="Funding Type">
        <Select value={filters.fundingType} onValueChange={v => update('fundingType', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{FUNDING_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup label="Region / Geography">
        <Input
          className="h-8 text-xs"
          placeholder="e.g. Africa, US, Europe..."
          value={filters.region}
          onChange={e => update('region', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup label="Budget Range">
        <div className="flex items-center gap-2">
          <Input className="h-8 text-xs" type="number" placeholder="Min" value={filters.minBudget} onChange={e => update('minBudget', e.target.value)} />
          <span className="text-slate-400 text-xs">–</span>
          <Input className="h-8 text-xs" type="number" placeholder="Max" value={filters.maxBudget} onChange={e => update('maxBudget', e.target.value)} />
        </div>
      </FilterGroup>

      <FilterGroup label="Date Range (Created)">
        <div className="space-y-2">
          <Input className="h-8 text-xs" type="date" value={filters.dateFrom} onChange={e => update('dateFrom', e.target.value)} />
          <Input className="h-8 text-xs" type="date" value={filters.dateTo} onChange={e => update('dateTo', e.target.value)} />
        </div>
      </FilterGroup>

      <FilterGroup label="Risk Grade">
        <Select value={filters.riskGrade} onValueChange={v => update('riskGrade', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {['A','B','C','D','F'].map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup label="Has Team Members">
        <Select value={filters.hasTeam} onValueChange={v => update('hasTeam', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="yes">Has Team</SelectItem>
            <SelectItem value="no">Solo / No Team</SelectItem>
          </SelectContent>
        </Select>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500">{label}</Label>
      {children}
    </div>
  );
}