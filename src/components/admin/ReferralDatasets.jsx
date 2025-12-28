import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Section({ title, count, children }) {
  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
        <Badge variant="secondary" className="rounded-full">{count}</Badge>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

const KV = ({ label, value }) => (
  <div className="text-xs text-slate-600"><span className="text-slate-500">{label}: </span><span className="font-medium text-slate-800">{String(value ?? '')}</span></div>
);

function Item({ item, fields = [] }) {
  return (
    <div className="p-3 rounded-lg border bg-slate-50/60 border-slate-200">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>ID</span>
        <span>{item.id}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(({ label, keys }) => (
          <KV key={label} label={label} value={(keys.find(k => item?.[k] !== undefined) && item[keys.find(k => item?.[k] !== undefined)]) || ''} />
        ))}
        <KV label="Created" value={item.created_date ? new Date(item.created_date).toLocaleString() : ''} />
      </div>
    </div>
  );
}

export default function ReferralDatasets() {
  const { data: codes = [] } = useQuery({
    queryKey: ['affiliateCodes'],
    queryFn: () => base44.entities.AffiliateCode.list('-created_date', 50)
  });
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 50)
  });
  const { data: clicks = [] } = useQuery({
    queryKey: ['affiliateClicks'],
    queryFn: () => base44.entities.AffiliateClick.list('-created_date', 100)
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Referral System Datasets</h2>
        <p className="text-sm text-slate-600">Overview of Affiliate Codes, Referrals, and Clicks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Affiliate Codes" count={codes.length}>
          <div className="space-y-2">
            {codes.length === 0 ? (
              <p className="text-sm text-slate-500">No codes yet</p>
            ) : (
              codes.slice(0, 10).map((c) => (
                <Item
                  key={c.id}
                  item={c}
                  fields={[
                    { label: 'Code', keys: ['code', 'slug', 'name'] },
                    { label: 'Owner', keys: ['owner_id', 'user_id', 'creator_id'] },
                    { label: 'Uses', keys: ['uses', 'uses_count'] },
                  ]}
                />
              ))
            )}
          </div>
        </Section>

        <Section title="Referrals" count={referrals.length}>
          <div className="space-y-2">
            {referrals.length === 0 ? (
              <p className="text-sm text-slate-500">No referrals yet</p>
            ) : (
              referrals.slice(0, 10).map((r) => (
                <Item
                  key={r.id}
                  item={r}
                  fields={[
                    { label: 'Referrer', keys: ['referrer_id', 'from_user_id', 'inviter_id'] },
                    { label: 'Referee', keys: ['referee_id', 'to_user_id', 'invitee_id'] },
                    { label: 'Code', keys: ['code', 'affiliate_code', 'source_code'] },
                  ]}
                />
              ))
            )}
          </div>
        </Section>

        <Section title="Clicks" count={clicks.length}>
          <div className="space-y-2">
            {clicks.length === 0 ? (
              <p className="text-sm text-slate-500">No clicks tracked</p>
            ) : (
              clicks.slice(0, 10).map((cl) => (
                <Item
                  key={cl.id}
                  item={cl}
                  fields={[
                    { label: 'Code', keys: ['code', 'affiliate_code'] },
                    { label: 'URL', keys: ['url', 'page_url'] },
                    { label: 'Visitor', keys: ['visitor_id', 'ip', 'session_id'] },
                  ]}
                />
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}