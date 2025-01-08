export const formatPrice = (price: number | null | undefined, isMarketCap: boolean = false) => {
  if (price === null || price === undefined) return 'N/A';
  
  const numPrice = Number(price);
  if (isNaN(numPrice)) return 'N/A';

  if (isMarketCap) {
    if (numPrice >= 1e9) return `$${(numPrice / 1e9).toFixed(2)}B`;
    if (numPrice >= 1e6) return `$${(numPrice / 1e6).toFixed(2)}M`;
    if (numPrice >= 1e3) return `$${(numPrice / 1e3).toFixed(2)}K`;
  }

  return numPrice < 0.01 
    ? `$${numPrice.toFixed(8)}`
    : `$${numPrice.toFixed(2)}`;
};

export const formatPriceChange = (change: number | null | undefined) => {
  if (change === null || change === undefined) return 'N/A';
  
  const numChange = Number(change);
  if (isNaN(numChange)) return 'N/A';

  return numChange > 0 
    ? `+${numChange.toFixed(2)}%` 
    : `${numChange.toFixed(2)}%`;
}; 