import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart3, 
  Copy, 
  Trash2, 
  ExternalLink,
  Target,
  ShoppingBag,
  Calendar,
  Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TARGET_ICONS = {
  general: Link2,
  listing: ShoppingBag,
  event: Calendar,
  mission: Target
};

const TARGET_COLORS = {
  general: 'bg-slate-100 text-slate-700',
  listing: 'bg-blue-100 text-blue-700',
  event: 'bg-purple-100 text-purple-700',
  mission: 'bg-amber-100 text-amber-700'
};

export default function CampaignAnalytics({ 
  campaigns = [], 
  clicks = [],
  referrals = [],
  onDelete,
  baseUrl
}) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied!');
  };

  const getCampaignStats = (campaign) => {
    const campaignClicks = clicks.filter(c => c.affiliate_code_id === campaign.id || c.affiliate_code === campaign.code);
    const campaignReferrals = referrals.filter(r => r.affiliate_code_id === campaign.id || r.affiliate_code === campaign.code);
    
    return {
      clicks: campaign.total_clicks || campaignClicks.length,
      signups: campaign.total_signups || campaignReferrals.length,
      activated: campaign.total_activated || campaignReferrals.filter(r => r.status === 'activated' || r.status === 'paid').length,
      paid: campaign.total_paid || campaignReferrals.filter(r => r.status === 'paid').length,
      gggEarned: campaign.total_ggg_earned || campaignReferrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.ggg_amount || 0.25), 0)
    };
  };

  const getCampaignUrl = (campaign) => {
    const params = new URLSearchParams({ ref: campaign.code });
    
    if (campaign.target_type === 'listing' && campaign.target_id) {
      return `${baseUrl}/ListingDetail?id=${campaign.target_id}&${params}`;
    } else if (campaign.target_type === 'event' && campaign.target_id) {
      return `${baseUrl}/EventDetail?id=${campaign.target_id}&${params}`;
    } else if (campaign.target_type === 'mission' && campaign.target_id) {
      return `${baseUrl}/MissionDetail?id=${campaign.target_id}&${params}`;
    }
    return `${baseUrl}/Join?${params}`;
  };

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No Campaign Links Yet</h3>
          <p className="text-sm text-slate-500">
            Create custom campaign links to track specific promotions
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separate primary link from campaign links
  const primaryLink = campaigns.find(c => !c.campaign_name);
  const campaignLinks = campaigns.filter(c => c.campaign_name);

  return (
    <div className="space-y-6">
      {/* Primary Link Stats */}
      {primaryLink && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Primary Affiliate Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const stats = getCampaignStats(primaryLink);
              const conversionRate = stats.clicks > 0 ? ((stats.signups / stats.clicks) * 100).toFixed(1) : 0;
              return (
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{stats.clicks}</p>
                    <p className="text-xs text-slate-500">Clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.signups}</p>
                    <p className="text-xs text-slate-500">Signups</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{stats.activated}</p>
                    <p className="text-xs text-slate-500">Activated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                    <p className="text-xs text-slate-500">Paid</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{stats.gggEarned.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">GGG Earned</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Campaign Links Table */}
      {campaignLinks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Campaign Links Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">Signups</TableHead>
                  <TableHead className="text-center">Paid</TableHead>
                  <TableHead className="text-center">Conv. Rate</TableHead>
                  <TableHead className="text-center">GGG</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignLinks.map(campaign => {
                  const stats = getCampaignStats(campaign);
                  const convRate = stats.clicks > 0 ? ((stats.paid / stats.clicks) * 100).toFixed(1) : 0;
                  const TargetIcon = TARGET_ICONS[campaign.target_type] || Link2;
                  
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{campaign.campaign_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{campaign.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", TARGET_COLORS[campaign.target_type])}>
                          <TargetIcon className="w-3 h-3" />
                          {campaign.target_name || campaign.target_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{stats.clicks}</TableCell>
                      <TableCell className="text-center">{stats.signups}</TableCell>
                      <TableCell className="text-center font-medium text-emerald-600">{stats.paid}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <Progress value={parseFloat(convRate)} className="h-1.5 w-12" />
                          <span className="text-xs">{convRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-amber-600">
                        {stats.gggEarned.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(getCampaignUrl(campaign))}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(getCampaignUrl(campaign), '_blank')}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => onDelete(campaign.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}