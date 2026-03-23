import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Gift, Coins, Sparkles } from 'lucide-react';

const PRICE_TYPES = {
  free: { label: 'Free', color: 'bg-emerald-100 text-emerald-700', icon: Gift },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700', icon: DollarSign },
  donation: { label: 'Donation', color: 'bg-amber-100 text-amber-700', icon: Coins },
  ggg: { label: 'GGG', color: 'bg-violet-100 text-violet-700', icon: Sparkles },
};

export default function BusinessServicesTab({ entity, isOwner }) {
  const services = entity.services_offered || [];

  if (services.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 mb-1">No services listed yet</p>
        <p className="text-xs text-slate-400">Services offered by this entity will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service, i) => {
        const pt = PRICE_TYPES[service.price_type] || PRICE_TYPES.free;
        const PriceIcon = pt.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-semibold text-slate-900">{service.name}</h4>
              <Badge className={`${pt.color} gap-1 shrink-0`}>
                <PriceIcon className="w-3 h-3" />
                {service.price_type === 'paid' && service.price_amount ? `$${service.price_amount}` : pt.label}
              </Badge>
            </div>
            {service.description && (
              <p className="text-sm text-slate-600">{service.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}