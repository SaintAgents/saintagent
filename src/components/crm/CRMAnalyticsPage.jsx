import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Mail, Users, Target, TrendingUp } from 'lucide-react';
import { format, parseISO, eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const STATUS_COLORS = {
  new: '#3b82f6',
  contacted: '#06b6d4',
  qualified: '#10b981',
  proposal: '#f59e0b',
  negotiation: '#f97316',
  won: '#22c55e',
  lost: '#ef4444',
  nurturing: '#8b5cf6',
};

const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal',
  negotiation: 'Negotiation', won: 'Won', lost: 'Lost', nurturing: 'Nurturing',
};

const SOURCE_LABELS = {
  referral: 'Referral', website: 'Website', social_media: 'Social Media',
  event: 'Event', cold_outreach: 'Cold Outreach', inbound: 'Inbound',
  partner: 'Partner', advertisement: 'Ad', content: 'Content',
  friend: 'Friend', family: 'Family', soul_fam: 'Soul-Fam', other: 'Other',
};

export default function CRMAnalyticsPage({ contacts = [], emailCampaigns = [] }) {
  // 1. Emails sent over time (monthly)
  const emailsOverTime = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 11);
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const label = format(month, 'MMM yyyy');
      const count = emailCampaigns.filter(e => {
        if (!e.sent_at && !e.created_date) return false;
        const d = parseISO(e.sent_at || e.created_date);
        return format(d, 'yyyy-MM') === format(month, 'yyyy-MM');
      }).length;
      // Also count from contacts' email_outreach_count by created month
      const contactEmails = contacts.reduce((sum, c) => {
        if (!c.last_email_date) return sum;
        const d = parseISO(c.last_email_date);
        if (format(d, 'yyyy-MM') === format(month, 'yyyy-MM')) {
          return sum + (c.email_outreach_count || 0);
        }
        return sum;
      }, 0);
      return { month: label, sent: count + contactEmails };
    });
  }, [emailCampaigns, contacts]);

  // 2. Distribution of leads by status
  const leadStatusData = useMemo(() => {
    const counts = {};
    contacts.forEach(c => {
      const s = c.lead_status || 'new';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        fill: STATUS_COLORS[key] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [contacts]);

  // 3. Lead source breakdown
  const leadSourceData = useMemo(() => {
    const counts = {};
    contacts.forEach(c => {
      const s = c.lead_source || 'other';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: SOURCE_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [contacts]);

  const totalEmails = emailsOverTime.reduce((s, m) => s + m.sent, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-violet-600 font-medium">Total Contacts</span>
            </div>
            <p className="text-2xl font-bold text-violet-900">{contacts.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Emails Sent</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalEmails}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-600 font-medium">Won</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {contacts.filter(c => c.lead_status === 'won').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-600 font-medium">Lead Sources</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{leadSourceData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Emails Sent Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Total Emails Sent Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emailsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sent" name="Emails Sent" stroke="#3b82f6" fill="#3b82f680" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Distribution of Leads by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Contacts" radius={[4, 4, 0, 0]}>
                    {leadStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Breakdown of Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadSourceData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} contacts`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}