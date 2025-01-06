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

// Calculate price momentum score
const calculatePriceScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4,  // 40% weight for 24h
    '8h': 0.25,  // 25% weight for 8h
    '4h': 0.15,  // 15% weight for 4h
    '2h': 0.12,  // 12% weight for 2h
    '1h': 0.08   // 8% weight for 1h
  };
  
  const details = {
    '24h': data.priceChange24hPercent,
    '8h': data.priceChange8hPercent,
    '4h': data.priceChange4hPercent,
    '2h': data.priceChange2hPercent,
    '1h': data.priceChange1hPercent
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
    '24h': 0.08,
    '8h': 0.12,
    '4h': 0.15,
    '2h': 0.25,
    '1h': 0.4
  };
  
  const details = {
    '24h': data.v24hChangePercent,
    '8h': data.v8hChangePercent,
    '4h': data.v4hChangePercent,
    '2h': data.v2hChangePercent,
    '1h': data.v1hChangePercent
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate buy/sell ratio score
const calculateBuySellScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4, 
    '8h': 0.25, 
    '4h': 0.15, 
    '2h': 0.12, 
    '1h': 0.08 
  };
  
  const details = {
    '24h': data.vBuy24hChangePercent - data.vSell24hChangePercent,
    '8h': data.vBuy8hChangePercent - data.vSell8hChangePercent,
    '4h': data.vBuy4hChangePercent - data.vSell4hChangePercent,
    '2h': data.vBuy2hChangePercent - data.vSell2hChangePercent,
    '1h': data.vBuy1hChangePercent - data.vSell1hChangePercent
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate wallet growth score
const calculateWalletScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4, 
    '8h': 0.25, 
    '4h': 0.15, 
    '2h': 0.12, 
    '1h': 0.08 
  };
  
  const details = {
    '24h': data.uniqueWallet24hChangePercent,
    '8h': data.uniqueWallet8hChangePercent,
    '4h': data.uniqueWallet4hChangePercent,
    '2h': data.uniqueWallet2hChangePercent,
    '1h': data.uniqueWallet1hChangePercent
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate trade count score
const calculateTradeScore = (data: TokenMetrics): ComponentScore => {
  const weights = { 
    '24h': 0.4, 
    '8h': 0.25, 
    '4h': 0.15, 
    '2h': 0.12, 
    '1h': 0.08 
  };
  
  const details = {
    '24h': data.trade24hChangePercent,
    '8h': data.trade8hChangePercent,
    '4h': data.trade4hChangePercent,
    '2h': data.trade2hChangePercent,
    '1h': data.trade1hChangePercent
  };
  
  const score = Object.entries(weights).reduce(
    (acc, [period, weight]) => acc + details[period as keyof typeof details] * weight,
    0
  );
  
  return { score, details };
};

// Calculate final breakout score
const calculateBreakoutScore = (data: TokenMetrics) => {
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
    volume: 0.15,  // 25%
    buySell: 0.3,  // 20%
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
    }
  };
};

export {
  calculateBreakoutScore,
  calculatePriceScore,
  calculateVolumeScore,
  calculateBuySellScore,
  calculateWalletScore,
  calculateTradeScore,
  type ComponentScore
}; 