import { useCallback, useSyncExternalStore } from 'react';

export const pairs = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD'];
const listeners = new Set();
let state = { prices: {}, status: 'Connecting' };
let stop;
const update = patch => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };

function start() {
  let socket, timeout, watchdog, attempts = 0, closed = false;
  function connect() {
    socket = new WebSocket('wss://advanced-trade-ws.coinbase.com');
    let receivedAt = Date.now();
    watchdog = setInterval(() => { if (Date.now() - receivedAt > 15_000) socket.close(); }, 5_000);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'ticker_batch', product_ids: pairs }));
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'heartbeats' }));
    };
    socket.onmessage = ({ data }) => {
      receivedAt = Date.now();
      let message;
      try { message = JSON.parse(data); } catch { return; }
      if (message.channel !== 'ticker_batch') return;
      const next = {};
      for (const event of message.events || []) for (const ticker of event.tickers || []) {
        const price = Number(ticker.price);
        if (pairs.includes(ticker.product_id) && Number.isFinite(price) && price > 0) next[ticker.product_id] = price;
      }
      if (!Object.keys(next).length) return;
      attempts = 0;
      update({ prices: { ...state.prices, ...next }, timestamp: message.timestamp, status: 'Live' });
    };
    socket.onclose = () => {
      clearInterval(watchdog);
      if (closed) return;
      update({ status: 'Reconnecting' });
      timeout = setTimeout(connect, Math.min(60_000, 2_000 * 2 ** attempts++));
    };
  }
  update({ status: 'Connecting' });
  connect();
  return () => { closed = true; clearTimeout(timeout); clearInterval(watchdog); socket?.close(); };
}

export default function useDockCryptoFeed(visible) {
  const subscribe = useCallback(listener => {
    if (!visible) return () => {};
    listeners.add(listener);
    stop ??= start();
    return () => { listeners.delete(listener); if (!listeners.size) { stop?.(); stop = undefined; } };
  }, [visible]);
  return useSyncExternalStore(subscribe, () => state);
}