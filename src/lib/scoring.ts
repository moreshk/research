export interface TokenMetrics {
  // Price changes
  priceChange24hPercent: number;
  priceChange1hPercent: number;
  priceChange2hPercent: number;
  priceChange4hPercent: number;
  priceChange8hPercent: number;
  
  // Volume changes
  v24hChangePercent: number;
  v1hChangePercent: number;
  v2hChangePercent: number;
  v4hChangePercent: number;
  v8hChangePercent: number;
  
  // Buy/Sell changes
  vBuy24hChangePercent: number;
  vBuy1hChangePercent: number;
  vBuy2hChangePercent: number;
  vBuy4hChangePercent: number;
  vBuy8hChangePercent: number;
  vSell24hChangePercent: number;
  vSell1hChangePercent: number;
  vSell2hChangePercent: number;
  vSell4hChangePercent: number;
  vSell8hChangePercent: number;
  
  // Wallet changes
  uniqueWallet24hChangePercent: number;
  uniqueWallet1hChangePercent: number;
  uniqueWallet2hChangePercent: number;
  uniqueWallet4hChangePercent: number;
  uniqueWallet8hChangePercent: number;
  
  // Trade count changes
  trade24hChangePercent: number;
  trade1hChangePercent: number;
  trade2hChangePercent: number;
  trade4hChangePercent: number;
  trade8hChangePercent: number;
}

interface ComponentScore {
  score: number;
  details: {
    [key: string]: number;
  };
}

// Normalize any value to 0-100 range
const normalizeScore = (value: number, maxRange: number): number => {
  const normalized = ((value + maxRange) / (2 * maxRange)) * 100;
  return Math.max(0, Math.min(100, normalized));
};

// Calculate price momentum score
const calculatePriceScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4,  // 40% weight for 24h
    '8h': 0.25,  // 25% weight for 8h
    '4h': 0.15,  // 15% weight for 4h
    '2h': 0.12,  // 12% weight for 2h
    '1h': 0.08   // 8% weight for 1h
  };
  const maxPriceChange = 20; // 20% max price change consideration
  
  const details = {
    '24h': normalizeScore(data.priceChange24hPercent, maxPriceChange),
    '8h': normalizeScore(data.priceChange8hPercent, maxPriceChange),
    '4h': normalizeScore(data.priceChange4hPercent, maxPriceChange),
    '2h': normalizeScore(data.priceChange2hPercent, maxPriceChange),
    '1h': normalizeScore(data.priceChange1hPercent, maxPriceChange)
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate volume momentum score
const calculateVolumeScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4, 
    '8h': 0.25, 
    '4h': 0.15, 
    '2h': 0.12, 
    '1h': 0.08 
  };
  const maxVolumeChange = 200;
  
  const details = {
    '24h': normalizeScore(data.v24hChangePercent, maxVolumeChange),
    '8h': normalizeScore(data.v8hChangePercent, maxVolumeChange),
    '4h': normalizeScore(data.v4hChangePercent, maxVolumeChange),
    '2h': normalizeScore(data.v2hChangePercent, maxVolumeChange),
    '1h': normalizeScore(data.v1hChangePercent, maxVolumeChange)
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate buy/sell ratio score
const calculateBuySellScore = (data: TokenMetrics): ComponentScore => {
  const weights = { '1h': 0.1, '2h': 0.2, '4h': 0.3, '8h': 0.4 };
  const maxRatioDiff = 150; // 150% max difference consideration
  
  const details = {
    '1h': normalizeScore(data.vBuy1hChangePercent - data.vSell1hChangePercent, maxRatioDiff),
    '2h': normalizeScore(data.vBuy2hChangePercent - data.vSell2hChangePercent, maxRatioDiff),
    '4h': normalizeScore(data.vBuy4hChangePercent - data.vSell4hChangePercent, maxRatioDiff),
    '8h': normalizeScore(data.vBuy8hChangePercent - data.vSell8hChangePercent, maxRatioDiff)
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate wallet growth score
const calculateWalletScore = (data: TokenMetrics): ComponentScore => {
  const weights = { '1h': 0.1, '2h': 0.2, '4h': 0.3, '8h': 0.4 };
  const maxWalletChange = 50; // 50% max wallet growth consideration
  
  const details = {
    '1h': normalizeScore(data.uniqueWallet1hChangePercent, maxWalletChange),
    '2h': normalizeScore(data.uniqueWallet2hChangePercent, maxWalletChange),
    '4h': normalizeScore(data.uniqueWallet4hChangePercent, maxWalletChange),
    '8h': normalizeScore(data.uniqueWallet8hChangePercent, maxWalletChange)
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate trade count score
const calculateTradeScore = (data: TokenMetrics): ComponentScore => {
  const weights = { '1h': 0.1, '2h': 0.2, '4h': 0.3, '8h': 0.4 };
  const maxTradeChange = 100; // 100% max trade count change consideration
  
  const details = {
    '1h': normalizeScore(data.trade1hChangePercent, maxTradeChange),
    '2h': normalizeScore(data.trade2hChangePercent, maxTradeChange),
    '4h': normalizeScore(data.trade4hChangePercent, maxTradeChange),
    '8h': normalizeScore(data.trade8hChangePercent, maxTradeChange)
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate final breakout score
export const calculateBreakoutScore = (data: TokenMetrics) => {
  // Check if we have valid data
  const hasValidData = Object.values(data).some(value => value !== null && value !== undefined);
  
  if (!hasValidData) {
    return {
      breakoutScore: null,
      components: {
        price: { score: null, details: {} },
        volume: { score: null, details: {} },
        buySell: { score: null, details: {} },
        wallet: { score: null, details: {} },
        trade: { score: null, details: {} }
      },
      interpretation: {
        level: 'N/A'
      }
    };
  }

  const priceScore = calculatePriceScore(data);
  const volumeScore = calculateVolumeScore(data);
  const buySellScore = calculateBuySellScore(data);
  const walletScore = calculateWalletScore(data);
  const tradeScore = calculateTradeScore(data);
  
  // Component weights
  const weights = {
    price: 0.3,    // 30%
    volume: 0.25,  // 25%
    buySell: 0.2,  // 20%
    wallet: 0.15,  // 15%
    trade: 0.1     // 10%
  };
  
  // Calculate final weighted score
  const finalScore = Math.round(
    priceScore.score * weights.price +
    volumeScore.score * weights.volume +
    buySellScore.score * weights.buySell +
    walletScore.score * weights.wallet +
    tradeScore.score * weights.trade
  );
  
  return {
    breakoutScore: finalScore,
    components: {
      price: priceScore,
      volume: volumeScore,
      buySell: buySellScore,
      wallet: walletScore,
      trade: tradeScore
    },
    interpretation: {
      level: finalScore >= 80 ? 'Strong Breakout' :
             finalScore >= 60 ? 'Bullish' :
             finalScore >= 40 ? 'Neutral' :
             finalScore >= 20 ? 'Slightly Bearish' :
                               'Weak/Bearish'
    }
  };
}; 