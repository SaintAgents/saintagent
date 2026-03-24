import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeftRight, Shield, MapPin, Lock, AlertTriangle, CheckCircle2,
  XCircle, Coins, Globe, FileText, Search, ChevronRight, Loader2,
  ShieldCheck, ShieldAlert, ArrowRight, Package, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['select_offer', 'select_request', 'validate', 'confirm'];
const STEP_LABELS = ['Your Offer', 'You Want', 'Validation', 'Confirm Trade'];

// Validation rules engine
function validateBarterTrade(offerAsset, requestAsset, userLocation) {
  const checks = [];
  const loc = userLocation || 'United States';

  // 1. Custody status check - both assets must be vault_secured
  const offerCustodyOk = offerAsset.custody_state === 'vault_secured';
  const requestCustodyOk = requestAsset.custody_state === 'vault_secured';
  checks.push({
    id: 'offer_custody',
    label: `Offer asset custody: ${offerAsset.custody_state?.replace(/_/g, ' ')}`,
    passed: offerCustodyOk,
    severity: offerCustodyOk ? 'pass' : 'block',
    detail: offerCustodyOk
      ? 'Asset is vault-secured and available for trade'
      : 'Asset must be vault-secured before it can be bartered. Current status: ' + offerAsset.custody_state
  });
  checks.push({
    id: 'request_custody',
    label: `Request asset custody: ${requestAsset.custody_state?.replace(/_/g, ' ')}`,
    passed: requestCustodyOk,
    severity: requestCustodyOk ? 'pass' : 'block',
    detail: requestCustodyOk
      ? 'Asset is vault-secured and available for trade'
      : 'Asset must be vault-secured before it can be bartered. Current status: ' + requestAsset.custody_state
  });

  // 2. Geo-fence zone overlap check
  const offerZones = offerAsset.geo_fence_zones || [];
  const requestZones = requestAsset.geo_fence_zones || [];
  const offerHasGlobal = offerZones.includes('Global');
  const requestHasGlobal = requestZones.includes('Global');
  const commonZones = offerHasGlobal ? requestZones
    : requestHasGlobal ? offerZones
    : offerZones.filter(z => requestZones.includes(z));
  const geoOverlapOk = commonZones.length > 0;
  checks.push({
    id: 'geo_overlap',
    label: 'Geographic zone compatibility',
    passed: geoOverlapOk,
    severity: geoOverlapOk ? 'pass' : 'block',
    detail: geoOverlapOk
      ? `${commonZones.length} common trading zone(s): ${commonZones.slice(0, 3).join(', ')}${commonZones.length > 3 ? '...' : ''}`
      : 'No overlapping geo-fence zones. These assets cannot be traded across incompatible jurisdictions.'
  });

  // 3. User location check against restricted zones
  const offerRestricted = offerAsset.geo_fence_restricted || [];
  const requestRestricted = requestAsset.geo_fence_restricted || [];
  const userNotRestricted = !offerRestricted.includes(loc) && !requestRestricted.includes(loc);
  checks.push({
    id: 'user_geo',
    label: `Your location (${loc}) not in restricted zones`,
    passed: userNotRestricted,
    severity: userNotRestricted ? 'pass' : 'block',
    detail: userNotRestricted
      ? 'Your jurisdiction is cleared for both assets'
      : 'Your location falls within a restricted zone for one or both assets'
  });

  // 4. Escrow status - neither asset should be in escrow
  const offerNotEscrow = offerAsset.status !== 'in_escrow';
  const requestNotEscrow = requestAsset.status !== 'in_escrow';
  checks.push({
    id: 'escrow_free',
    label: 'Neither asset is locked in escrow',
    passed: offerNotEscrow && requestNotEscrow,
    severity: (offerNotEscrow && requestNotEscrow) ? 'pass' : 'block',
    detail: (offerNotEscrow && requestNotEscrow)
      ? 'Both assets are free for trading'
      : 'One or both assets are currently locked in an active escrow'
  });

  // 5. DNA gating check
  const offerDnaOk = !offerAsset.dna_gating_required;
  const requestDnaOk = !requestAsset.dna_gating_required;
  if (!offerDnaOk || !requestDnaOk) {
    checks.push({
      id: 'dna_gating',
      label: 'DNA gating authorization',
      passed: true, // warn but don't block
      severity: 'warn',
      detail: 'One or both assets require DNA verification. Both parties will need to complete biometric verification before the trade finalizes.'
    });
  }

  // 6. Programmable restrictions (min hold, transfers/year)
  const offerRestrictions = offerAsset.programmable_restrictions;
  const requestRestrictions = requestAsset.programmable_restrictions;
  const hasRestrictions = offerRestrictions || requestRestrictions;
  if (hasRestrictions) {
    const restrictionDetails = [];
    if (offerRestrictions?.min_hold_days) restrictionDetails.push(`Offer: ${offerRestrictions.min_hold_days}-day min hold`);
    if (requestRestrictions?.min_hold_days) restrictionDetails.push(`Request: ${requestRestrictions.min_hold_days}-day min hold`);
    if (offerRestrictions?.requires_kyc || requestRestrictions?.requires_kyc) restrictionDetails.push('KYC required');
    checks.push({
      id: 'restrictions',
      label: 'Programmable restrictions apply',
      passed: true,
      severity: 'warn',
      detail: restrictionDetails.join(' • ')
    });
  }

  // 7. Gold backing fairness check (warn if > 50% difference)
  const offerGold = offerAsset.gold_backing_grams || offerAsset.goldBacking || 0;
  const requestGold = requestAsset.gold_backing_grams || requestAsset.goldBacking || 0;
  const ratio = Math.min(offerGold, requestGold) / Math.max(offerGold, requestGold);
  const fairnessOk = ratio >= 0.5;
  checks.push({
    id: 'fairness',
    label: `Gold backing ratio: ${(ratio * 100).toFixed(0)}%`,
    passed: fairnessOk,
    severity: fairnessOk ? 'pass' : 'warn',
    detail: fairnessOk
      ? `Offer: ${offerGold}g Au vs Request: ${requestGold}g Au — within fair range`
      : `Significant imbalance — Offer: ${offerGold}g Au vs Request: ${requestGold}g Au. Proceed with awareness.`
  });

  const blockers = checks.filter(c => c.severity === 'block' && !c.passed);
  const warnings = checks.filter(c => c.severity === 'warn');
  const canProceed = blockers.length === 0;

  return { checks, blockers, warnings, canProceed };
}

function AssetSelector({ assets, selectedId, onSelect, excludeId, theme, label }) {
  const [search, setSearch] = useState('');
  const available = assets.filter(a =>
    a.id !== excludeId &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) ||
     a.category?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${label}...`}
          className={`pl-9 bg-black/40 border-${theme}-500/30 text-white text-sm`}
        />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-2">
          {available.map(nft => {
            const isSelected = selectedId === nft.id;
            return (
              <Card
                key={nft.id}
                onClick={() => onSelect(nft)}
                className={cn(
                  'p-3 cursor-pointer transition-all border',
                  isSelected
                    ? `bg-${theme}-500/20 border-${theme}-500/60`
                    : 'bg-black/30 border-gray-700/50 hover:border-gray-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <img src={nft.image_url || nft.image} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{nft.title}</span>
                      {isSelected && <CheckCircle2 className={`w-4 h-4 text-${theme}-400 shrink-0`} />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[10px] bg-gray-800 text-gray-300 border-gray-600">{nft.category}</Badge>
                      <span className="text-xs text-amber-400 font-mono">{nft.gold_backing_grams || nft.goldBacking}g Au</span>
                      <span className={cn(
                        'text-[10px]',
                        nft.custody_state === 'vault_secured' ? 'text-green-400' : 'text-orange-400'
                      )}>
                        {nft.custody_state === 'vault_secured' ? '● Vault' : '● ' + nft.custody_state?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {nft.geo_fence_zones?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                        <Globe className="w-3 h-3" />
                        {nft.geo_fence_zones.slice(0, 2).join(', ')}{nft.geo_fence_zones.length > 2 ? ` +${nft.geo_fence_zones.length - 2}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {available.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No assets found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function AssetSummaryCard({ asset, label, theme }) {
  if (!asset) return null;
  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <img src={asset.image_url || asset.image} alt="" className="w-14 h-14 rounded object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{asset.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Coins className="w-3 h-3 mr-1" />{asset.gold_backing_grams || asset.goldBacking}g Au
            </Badge>
            <Badge className={cn('text-[10px]',
              asset.custody_state === 'vault_secured'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            )}>
              {asset.custody_state === 'vault_secured' ? 'Vault Secured' : asset.custody_state?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{asset.ucc_filing}</div>
        </div>
      </div>
    </Card>
  );
}

function ValidationResultsPanel({ results, theme }) {
  return (
    <div className="space-y-2">
      {results.checks.map(check => (
        <div
          key={check.id}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border',
            check.severity === 'pass' && 'bg-green-500/5 border-green-500/20',
            check.severity === 'warn' && 'bg-amber-500/5 border-amber-500/20',
            check.severity === 'block' && !check.passed && 'bg-red-500/5 border-red-500/20'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {check.severity === 'pass' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {check.severity === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {check.severity === 'block' && !check.passed && <XCircle className="w-4 h-4 text-red-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(
              'text-sm font-medium',
              check.severity === 'pass' && 'text-green-300',
              check.severity === 'warn' && 'text-amber-300',
              check.severity === 'block' && !check.passed && 'text-red-300'
            )}>
              {check.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{check.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BarterTradeModal({ open, onClose, allAssets, theme = 'lime' }) {
  const [step, setStep] = useState(0);
  const [offerAsset, setOfferAsset] = useState(null);
  const [requestAsset, setRequestAsset] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  const reset = () => {
    setStep(0);
    setOfferAsset(null);
    setRequestAsset(null);
    setNote('');
    setIsSubmitting(false);
    setValidating(false);
    setValidationResults(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const runValidation = () => {
    setValidating(true);
    // Simulate async validation with a brief delay for UX
    setTimeout(() => {
      const results = validateBarterTrade(offerAsset, requestAsset, 'United States');
      setValidationResults(results);
      setValidating(false);
    }, 1200);
  };

  const handleNext = () => {
    if (step === 2 && !validationResults) {
      runValidation();
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 2) setValidationResults(null);
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate trade proposal submission
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    handleClose();
  };

  const canProceed = () => {
    if (step === 0) return !!offerAsset;
    if (step === 1) return !!requestAsset;
    if (step === 2) return validationResults?.canProceed;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-950 border border-gray-800 text-white p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className={`p-4 pb-3 border-b border-gray-800 bg-gradient-to-r from-${theme}-500/10 to-purple-500/10`}>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ArrowLeftRight className={`w-5 h-5 text-${theme}-400`} />
            Peer-to-Peer Barter Trade
          </DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  i === step ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/40` :
                  i < step ? 'bg-green-500/10 text-green-400' : 'bg-gray-800/50 text-gray-500'
                )}>
                  {i < step ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center text-[10px]">{i + 1}</span>}
                  <span className="hidden sm:inline">{STEP_LABELS[i]}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-4 space-y-4">
            {/* Step 0: Select Offer */}
            {step === 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-3">Select the asset you want to <span className={`text-${theme}-400 font-medium`}>offer</span> in this trade.</p>
                <AssetSelector
                  assets={allAssets}
                  selectedId={offerAsset?.id}
                  onSelect={setOfferAsset}
                  excludeId={requestAsset?.id}
                  theme={theme}
                  label="your assets"
                />
              </div>
            )}

            {/* Step 1: Select Request */}
            {step === 1 && (
              <div>
                <AssetSummaryCard asset={offerAsset} label="You are offering" theme={theme} />
                <div className="flex items-center justify-center my-3">
                  <div className={`p-2 rounded-full bg-${theme}-500/10 border border-${theme}-500/30`}>
                    <ArrowLeftRight className={`w-4 h-4 text-${theme}-400`} />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">Select the asset you want to <span className="text-purple-400 font-medium">receive</span> in return.</p>
                <AssetSelector
                  assets={allAssets}
                  selectedId={requestAsset?.id}
                  onSelect={setRequestAsset}
                  excludeId={offerAsset?.id}
                  theme={theme}
                  label="available assets"
                />
              </div>
            )}

            {/* Step 2: Validation */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AssetSummaryCard asset={offerAsset} label="You offer" theme={theme} />
                  <AssetSummaryCard asset={requestAsset} label="You receive" theme="purple" />
                </div>

                <Card className={`p-4 border bg-black/30 ${validationResults ? (validationResults.canProceed ? 'border-green-500/30' : 'border-red-500/30') : `border-${theme}-500/20`}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {validating ? (
                      <>
                        <Loader2 className={`w-5 h-5 text-${theme}-400 animate-spin`} />
                        <span className="text-sm font-medium text-white">Running compliance validation...</span>
                      </>
                    ) : validationResults ? (
                      <>
                        {validationResults.canProceed
                          ? <ShieldCheck className="w-5 h-5 text-green-400" />
                          : <ShieldAlert className="w-5 h-5 text-red-400" />}
                        <span className={cn('text-sm font-medium', validationResults.canProceed ? 'text-green-400' : 'text-red-400')}>
                          {validationResults.canProceed
                            ? `All checks passed — ${validationResults.warnings.length} warning(s)`
                            : `${validationResults.blockers.length} blocking issue(s) found`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Shield className={`w-5 h-5 text-${theme}-400`} />
                        <span className="text-sm font-medium text-white">Compliance & Geo-Fence Validation</span>
                      </>
                    )}
                  </div>

                  {!validationResults && !validating && (
                    <div className="text-xs text-gray-400 mb-4">
                      This step verifies custody status, geo-fence zone compatibility, escrow locks, DNA gating, 
                      programmable restrictions, and gold-backing fairness for both assets.
                    </div>
                  )}

                  {validating && (
                    <div className="space-y-3 py-4">
                      {['Checking custody status...', 'Verifying geo-fence zones...', 'Scanning escrow locks...', 'Validating restrictions...'].map((msg, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                          <div className={`w-2 h-2 rounded-full bg-${theme}-500/50`} />
                          {msg}
                        </div>
                      ))}
                    </div>
                  )}

                  {validationResults && <ValidationResultsPanel results={validationResults} theme={theme} />}
                </Card>

                {!validationResults && !validating && (
                  <Button
                    onClick={runValidation}
                    className={`w-full bg-gradient-to-r from-${theme}-500 to-emerald-500 hover:from-${theme}-400 hover:to-emerald-400 text-black font-semibold`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Run Validation Checks
                  </Button>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <Card className={`bg-gradient-to-br from-${theme}-500/5 to-purple-500/5 border border-${theme}-500/20 p-4`}>
                  <div className="text-center mb-4">
                    <Sparkles className={`w-8 h-8 text-${theme}-400 mx-auto mb-2`} />
                    <h3 className="text-lg font-bold text-white">Confirm Barter Trade</h3>
                    <p className="text-xs text-gray-400 mt-1">Review the final trade details before submitting your proposal</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AssetSummaryCard asset={offerAsset} label="You send" theme={theme} />
                    <AssetSummaryCard asset={requestAsset} label="You receive" theme="purple" />
                  </div>

                  <div className="flex items-center justify-center my-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Lock className="w-3 h-3" />
                      Both assets will be held in escrow until the counterparty accepts
                    </div>
                  </div>
                </Card>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Trade note (optional)</label>
                  <Textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a message to the asset owner..."
                    className={`bg-black/40 border-${theme}-500/30 text-white text-sm`}
                    rows={2}
                  />
                </div>

                {/* Validation summary */}
                {validationResults && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-xs text-green-300">
                      All compliance checks passed • {validationResults.checks.filter(c => c.severity === 'pass').length} verified •{' '}
                      {validationResults.warnings.length} advisory notice(s)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={step === 0 ? handleClose : handleBack}
            className="text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || validating}
                className={cn(
                  'font-semibold',
                  canProceed()
                    ? `bg-gradient-to-r from-${theme}-500 to-emerald-500 hover:from-${theme}-400 hover:to-emerald-400 text-black`
                    : 'bg-gray-800 text-gray-500'
                )}
              >
                {step === 2 && !validationResults ? 'Run Validation' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-${theme}-500 to-purple-500 hover:from-${theme}-400 hover:to-purple-400 text-black font-semibold`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Submit Trade Proposal
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}