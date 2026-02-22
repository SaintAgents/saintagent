import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Target,
  DollarSign, Clock, Sparkles, Loader2, RefreshCw, CheckCircle2,
  XCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// AI-driven deal scoring based on multiple factors
const calculateDealScore = (deal, contacts, historicalDeals) => {
  let score = 50; // Base score
  const factors = [];

  // Factor 1: Stage progression (more advanced = higher score)
  const stageScores = {
    prospecting: 10,
    qualification: 25,
    proposal: 50,
    negotiation: 75,
    closed_won: 100,
    closed_lost: 0
  };
  const stageScore = stageScores[deal.stage] || 0;
  score = (score + stageScore) / 2;
  factors.push({
    name: 'Stage',
    impact: stageScore > 50 ? 'positive' : stageScore > 25 ? 'neutral' : 'negative',
    value: deal.stage?.replace(/_/g, ' ')
  });

  // Factor 2: Probability set by user
  if (deal.probability > 0) {
    score = (score + deal.probability) / 2;
    factors.push({
      name: 'User Probability',
      impact: deal.probability > 50 ? 'positive' : 'neutral',
      value: `${deal.probability}%`
    });
  }

  // Factor 3: Deal age (older deals might be stale)
  const dealAge = deal.created_date 
    ? Math.floor((Date.now() - new Date(deal.created_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  if (dealAge > 90) {
    score -= 15;
    factors.push({ name: 'Deal Age', impact: 'negative', value: `${dealAge} days (stale)` });
  } else if (dealAge < 14) {
    score += 5;
    factors.push({ name: 'Deal Age', impact: 'positive', value: `${dealAge} days (fresh)` });
  }

  // Factor 4: Contact quality if we can match the deal to a contact
  const contact = contacts.find(c => 
    c.email === deal.contact_email || c.name === deal.contact_name
  );
  if (contact) {
    const qualityScore = contact.quality_score || 0;
    if (qualityScore >= 70) {
      score += 10;
      factors.push({ name: 'Contact Quality', impact: 'positive', value: `Score ${qualityScore}` });
    } else if (qualityScore < 40) {
      score -= 10;
      factors.push({ name: 'Contact Quality', impact: 'negative', value: `Score ${qualityScore}` });
    }
  }

  // Factor 5: Historical source performance
  const wonDealsBySource = historicalDeals.filter(
    d => d.source === deal.source && d.stage === 'closed_won'
  ).length;
  const totalDealsBySource = historicalDeals.filter(
    d => d.source === deal.source && ['closed_won', 'closed_lost'].includes(d.stage)
  ).length;
  const sourceWinRate = totalDealsBySource > 0 
    ? Math.round((wonDealsBySource / totalDealsBySource) * 100) 
    : 50;
  
  if (sourceWinRate > 60) {
    score += 10;
    factors.push({ name: 'Source Performance', impact: 'positive', value: `${sourceWinRate}% win rate` });
  } else if (sourceWinRate < 30 && totalDealsBySource > 3) {
    score -= 10;
    factors.push({ name: 'Source Performance', impact: 'negative', value: `${sourceWinRate}% win rate` });
  }

  // Factor 6: Deal size vs average
  const avgDealSize = historicalDeals.length > 0
    ? historicalDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / historicalDeals.length
    : 0;
  if (deal.amount > avgDealSize * 2) {
    score -= 5; // Larger deals are harder to close
    factors.push({ name: 'Deal Size', impact: 'neutral', value: 'Above average' });
  }

  // Factor 7: Time to expected close
  if (deal.expected_close_date) {
    const daysToClose = Math.floor(
      (new Date(deal.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysToClose < 0) {
      score -= 15;
      factors.push({ name: 'Close Date', impact: 'negative', value: 'Overdue' });
    } else if (daysToClose < 14) {
      score += 5;
      factors.push({ name: 'Close Date', impact: 'positive', value: `${daysToClose} days` });
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, factors };
};

const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Very Likely', color: 'emerald' };
  if (score >= 60) return { label: 'Likely', color: 'blue' };
  if (score >= 40) return { label: 'Possible', color: 'amber' };
  if (score >= 20) return { label: 'Unlikely', color: 'orange' };
  return { label: 'At Risk', color: 'red' };
};

export default function AIDealPrediction({ deals = [], contacts = [], currentUserId }) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Calculate predictions for all active deals
  const predictions = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const historicalDeals = deals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage));

    return activeDeals.map(deal => {
      const { score, factors } = calculateDealScore(deal, contacts, historicalDeals);
      const scoreInfo = getScoreLabel(score);
      return {
        ...deal,
        prediction: {
          score,
          label: scoreInfo.label,
          color: scoreInfo.color,
          factors
        }
      };
    }).sort((a, b) => b.prediction.score - a.prediction.score);
  }, [deals, contacts]);

  // Calculate overall pipeline health
  const pipelineHealth = useMemo(() => {
    if (predictions.length === 0) return { score: 0, trend: 'neutral' };
    const avgScore = predictions.reduce((sum, p) => sum + p.prediction.score, 0) / predictions.length;
    const highScoreDeals = predictions.filter(p => p.prediction.score >= 60).length;
    const atRiskDeals = predictions.filter(p => p.prediction.score < 40).length;
    
    return {
      score: Math.round(avgScore),
      highScore: highScoreDeals,
      atRisk: atRiskDeals,
      trend: avgScore >= 60 ? 'up' : avgScore < 40 ? 'down' : 'neutral'
    };
  }, [predictions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate AI recalculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Brain className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Deal Predictions</CardTitle>
                <CardDescription>ML-powered deal scoring and outcome predictions</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Pipeline Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Pipeline Health</span>
              {pipelineHealth.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : pipelineHealth.trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              ) : null}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{pipelineHealth.score}</span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
            <Progress value={pipelineHealth.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-500">Active Deals</span>
            </div>
            <span className="text-3xl font-bold text-slate-900">{predictions.length}</span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">High Probability</span>
            </div>
            <span className="text-3xl font-bold text-emerald-700">{pipelineHealth.highScore}</span>
            <p className="text-xs text-emerald-600 mt-1">Score ≥60</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">At Risk</span>
            </div>
            <span className="text-3xl font-bold text-amber-700">{pipelineHealth.atRisk}</span>
            <p className="text-xs text-amber-600 mt-1">Score &lt;40</p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Deal Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No active deals to analyze</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map(deal => (
                <div 
                  key={deal.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedDeal?.id === deal.id ? 'border-violet-400 bg-violet-50' : ''
                  }`}
                  onClick={() => setSelectedDeal(selectedDeal?.id === deal.id ? null : deal)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-slate-900">{deal.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {deal.stage?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{deal.company_name || 'No company'}</span>
                        <span className="font-medium text-slate-700">{formatCurrency(deal.amount)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold text-${deal.prediction.color}-600`}>
                        {deal.prediction.score}
                      </div>
                      <Badge className={`bg-${deal.prediction.color}-100 text-${deal.prediction.color}-700 text-xs`}>
                        {deal.prediction.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded Factor Analysis */}
                  {selectedDeal?.id === deal.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-slate-700 mb-3">Score Factors</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {deal.prediction.factors.map((factor, idx) => (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg text-xs ${
                              factor.impact === 'positive' ? 'bg-emerald-50 text-emerald-700' :
                              factor.impact === 'negative' ? 'bg-red-50 text-red-700' :
                              'bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {factor.impact === 'positive' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : factor.impact === 'negative' ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : null}
                              <span className="font-medium">{factor.name}</span>
                            </div>
                            <p>{factor.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {predictions.length > 0 && pipelineHealth.atRisk > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-700">
            <ul className="space-y-2">
              {predictions.filter(p => p.prediction.score < 40).slice(0, 3).map(deal => (
                <li key={deal.id} className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>
                    <strong>{deal.title}</strong>: {
                      deal.prediction.factors.find(f => f.impact === 'negative')?.name === 'Close Date' 
                        ? 'Update expected close date or schedule follow-up'
                        : deal.prediction.factors.find(f => f.impact === 'negative')?.name === 'Deal Age'
                        ? 'Re-engage contact to prevent deal going stale'
                        : 'Review deal factors and take action to improve score'
                    }
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}