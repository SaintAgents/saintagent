import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { featureInventory } from '@/components/tour/featureInventory';

export default function FeatureInventory({ step }) {
  const { features } = featureInventory[step];
  return (
    <section aria-label="SaintAgent feature inventory" className="min-h-0 overflow-y-auto p-4 sm:p-6">
      <h3 className="font-heading text-lg font-semibold">Feature inventory</h3>
      <p className="mb-3 text-sm text-muted-foreground">{features.length} capabilities in this section</p>
      <ul className="divide-y border-y">
        {features.map(([name, description, page]) => (
          <li key={name} className="py-2.5">
            {page ? (
              <Link to={`/${page}`} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`} className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                {name}<ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            ) : <h4 className="text-sm font-semibold">{name}</h4>}
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}