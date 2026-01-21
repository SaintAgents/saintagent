import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// CoinGecko ID mapping for common tokens
const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ARB: 'arbitrum',
  USDC: 'usd-coin',
  USDT: 'tether',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  OP: 'optimism',
  BASE: 'base-protocol',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  DOT: 'polkadot',
  ATOM: 'cosmos',
  XRP: 'ripple',
  LTC: 'litecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { symbols, includeChart, chartDays } = body;
    
    // Default to top tokens if none specified
    const tokenSymbols = symbols || ['BTC', 'ETH', 'SOL', 'ARB', 'USDC'];
    
    // Map symbols to CoinGecko IDs
    const coinIds = tokenSymbols
      .map(s => COINGECKO_IDS[s.toUpperCase()])
      .filter(Boolean);
    
    if (coinIds.length === 0) {
      return Response.json({ error: 'No valid token symbols provided' }, { status: 400 });
    }
    
    // Fetch current prices from CoinGecko
    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`;
    
    const priceResponse = await fetch(priceUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    
    // Transform data to our format
    const prices = {};
    for (const symbol of tokenSymbols) {
      const coinId = COINGECKO_IDS[symbol.toUpperCase()];
      if (coinId && priceData[coinId]) {
        const data = priceData[coinId];
        prices[symbol.toUpperCase()] = {
          price: data.usd,
          change24h: data.usd_24h_change || 0,
          volume24h: data.usd_24h_vol || 0,
          marketCap: data.usd_market_cap || 0,
        };
      }
    }
    
    // Optionally fetch chart data for a specific token
    let chartData = null;
    if (includeChart && tokenSymbols.length === 1) {
      const coinId = COINGECKO_IDS[tokenSymbols[0].toUpperCase()];
      const days = chartDays || 1;
      
      const chartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
      
      const chartResponse = await fetch(chartUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (chartResponse.ok) {
        const rawChart = await chartResponse.json();
        
        // Transform to OHLC-like format
        chartData = rawChart.prices.map(([timestamp, price], index, arr) => {
          const prevPrice = index > 0 ? arr[index - 1][1] : price;
          return {
            time: timestamp,
            price: price,
            open: prevPrice,
            close: price,
            high: Math.max(prevPrice, price) * (1 + Math.random() * 0.002),
            low: Math.min(prevPrice, price) * (1 - Math.random() * 0.002),
            volume: rawChart.total_volumes?.[index]?.[1] || 0,
            isUp: price >= prevPrice
          };
        });
      }
    }
    
    return Response.json({
      prices,
      chartData,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});