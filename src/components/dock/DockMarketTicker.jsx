import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useDockCryptoFeed, { pairs } from '@/components/dock/useDockCryptoFeed';

const refresh = 5 * 60_000;
const usd = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });
const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' });

export default function DockMarketTicker({ type, visible }) {
  const isGold = type === 'Gold Spot Ticker';
  const crypto = useDockCryptoFeed(visible && !isGold);
  const gold = useQuery({
    queryKey: ['dock-gold-spot'], enabled: visible && isGold,
    queryFn: async () => (await base44.functions.invoke('getDockGoldQuote', {})).data,
    staleTime: refresh, refetchInterval: refresh, retry: false,
  });
  const rows = isGold ? [['XAU · troy oz', gold.data?.price]] : pairs.map(pair => [pair.slice(0, -4), crypto.prices[pair]]);
  const timestamp = isGold ? gold.data?.timestamp : crypto.timestamp;
  const status = isGold ? (gold.isFetching ? 'Checking quote…' : gold.isError ? 'Refresh unavailable' : 'Metals.dev · every 5 min') : `Coinbase · ${crypto.status}`;
  return <div className="grid gap-2 p-1 text-sm" aria-label={isGold ? 'Gold spot price in US dollars' : 'Major cryptocurrency prices in US dollars'}>
    <dl className="flex flex-wrap gap-x-4 gap-y-2">
      {rows.map(([symbol, price]) => <div key={symbol} className="flex flex-wrap items-baseline gap-x-2">
        <dt className="font-semibold">{symbol}</dt>
        <dd className="tabular-nums">{Number.isFinite(price) ? usd.format(price) : '—'}</dd>
      </div>)}
    </dl>
    <p className="text-xs">{status}{Number.isFinite(Date.parse(timestamp)) && <> · <time dateTime={timestamp}>{time.format(new Date(timestamp))}</time></>}</p>
  </div>;
}