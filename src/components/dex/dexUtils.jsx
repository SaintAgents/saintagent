// Base Network Chain ID
export const BASE_CHAIN_ID = 8453;

// Popular Base tokens with mock data
export const BASE_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    price: 3200,
    balance: 1.5
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    price: 1,
    balance: 5000
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
    price: 3200,
    balance: 0.5
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
    price: 1,
    balance: 2500
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    price: 1,
    balance: 1000
  },
  {
    symbol: 'AERO',
    name: 'Aerodrome',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/31745/small/token.png',
    price: 1.5,
    balance: 500
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    logo: 'https://assets.coingecko.com/coins/images/40143/small/cbbtc.webp',
    price: 42000,
    balance: 0.02
  },
  {
    symbol: 'DEGEN',
    name: 'Degen',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/34515/small/android-chrome-512x512.png',
    price: 0.01,
    balance: 100000
  }
];

// DEX protocols on Base
export const BASE_DEXS = [
  { name: 'Uniswap V3', logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg', color: '#FF007A' },
  { name: 'Aerodrome', logo: 'https://assets.coingecko.com/coins/images/31745/small/token.png', color: '#0052FF' },
  { name: 'BaseSwap', logo: 'https://baseswap.fi/logo.png', color: '#2775CA' },
  { name: 'PancakeSwap', logo: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png', color: '#D1884F' }
];

// Format balance with appropriate decimals
export function formatBalance(balance, decimals = 4) {
  if (!balance || balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  return balance.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: decimals 
  });
}

// Format USD value
export function formatUSD(value) {
  if (!value || value === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Shorten address
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Mock trending pairs
export const TRENDING_PAIRS = [
  { pair: 'ETH/USDC', price: 3200.45, change: 2.4, volume: '45.2M' },
  { pair: 'AERO/ETH', price: 0.00047, change: -1.2, volume: '12.8M' },
  { pair: 'DEGEN/ETH', price: 0.0000031, change: 15.6, volume: '8.5M' },
  { pair: 'cbBTC/ETH', price: 13.125, change: 0.8, volume: '22.1M' },
  { pair: 'DAI/USDC', price: 1.0001, change: 0.01, volume: '5.2M' }
];

// DCA frequency options
export const DCA_FREQUENCIES = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

// Gas priority options
export const GAS_PRIORITIES = [
  { value: 'low', label: 'Low', gwei: '0.001', time: '~30s' },
  { value: 'medium', label: 'Medium', gwei: '0.002', time: '~15s' },
  { value: 'high', label: 'High', gwei: '0.005', time: '~5s' }
];