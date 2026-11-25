import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const ttl = 5 * 60_000;
let cached, pending, retryAfter = 0;

async function fetchQuote() {
  const apiKey = secrets.get('GOLD_API_KEY');
  if (!apiKey) throw new Error('Gold feed unavailable');
  const url = new URL('https://api.metals.dev/v1/metal/spot');
  url.search = new URLSearchParams({ api_key: apiKey, metal: 'gold', currency: 'USD' }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Gold feed unavailable');
  const quote = await response.json();
  if (quote.status !== 'success' || quote.currency !== 'USD' || quote.unit !== 'toz' ||
      !Number.isFinite(quote.rate?.price) || quote.rate.price <= 0 || !Number.isFinite(Date.parse(quote.timestamp))) {
    throw new Error('Invalid gold quote');
  }
  return { price: quote.rate.price, timestamp: quote.timestamp };
}

export default async function(req) {
  try {
    const user = await createClientFromRequest(req).auth.me().catch(error => {
      if (error.status === 401) return null;
      throw error;
    });
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (cached?.expires > Date.now()) return Response.json(cached.quote);
    if (retryAfter > Date.now()) return Response.json({ error: 'Gold quote unavailable' }, { status: 503 });
    pending ??= fetchQuote().then(quote => {
      cached = { quote, expires: Date.now() + ttl };
      return quote;
    }).catch(error => {
      retryAfter = Date.now() + ttl;
      throw error;
    }).finally(() => { pending = undefined; });
    return Response.json(await pending);
  } catch {
    return Response.json({ error: 'Gold quote unavailable' }, { status: 503 });
  }
}