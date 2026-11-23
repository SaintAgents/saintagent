import React from 'react';

const light = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/1c992ac8ae01cb527116cf4ece0c1d7e_ca1fe47cc101e7d94a5a4dcc555294ba_RadiantWisdomExchangeBanner.png';
const dark = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/9131f76d7e2a8874785ffa92b3a2f5ad_5fa072c03087cd2955a0fab0c5221a58_WisdomExchange_CosmicKnowledgeTemple.png';
const alt = 'Wisdom Exchange: a global knowledge hub for higher insights, research and collective innovation.';

export default function WisdomHero() {
  return <div className="overflow-hidden rounded-xl" data-no-filter="true">
    <img src={light} alt={alt} width={1024} height={523} className="h-auto w-full [html[data-theme=dark]_&]:hidden" />
    <img src={dark} alt={alt} width={1024} height={524} className="hidden h-auto w-full [html[data-theme=dark]_&]:block" />
  </div>;
}