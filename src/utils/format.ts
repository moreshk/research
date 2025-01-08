export const formatPrice = (price: number, isMarketCap: boolean = false) => {
  if (!price) return 'N/A';
  
  if (isMarketCap) {
    if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
    if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
    if (price >= 1e3) return `$${(price / 1e3).toFixed(2)}K`;
  }
  
  return price < 0.01 
    ? `$${price.toFixed(8)}`
    : `$${price.toFixed(2)}`;
};

export const formatPriceChange = (change: number | null) => {
  if (change === null) return 'N/A';
  return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
}; 