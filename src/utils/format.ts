export const formatPrice = (price: number | null | undefined, isMarketCap: boolean = false) => {
  if (price === null || price === undefined) return 'N/A';
  
  // Convert to number to ensure we're working with a numeric value
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return 'N/A';
  
  if (isMarketCap) {
    if (numericPrice >= 1e9) return `$${(numericPrice / 1e9).toFixed(2)}B`;
    if (numericPrice >= 1e6) return `$${(numericPrice / 1e6).toFixed(2)}M`;
    if (numericPrice >= 1e3) return `$${(numericPrice / 1e3).toFixed(2)}K`;
  }
  
  return numericPrice < 0.01 
    ? `$${numericPrice.toFixed(8)}`
    : `$${numericPrice.toFixed(2)}`;
};

export const formatPriceChange = (change: number | null) => {
  if (change === null) return 'N/A';
  
  // Convert to number and check for valid numeric value
  const numericChange = Number(change);
  if (isNaN(numericChange)) return 'N/A';
  
  return numericChange > 0 
    ? `+${numericChange.toFixed(2)}%` 
    : `${numericChange.toFixed(2)}%`;
}; 