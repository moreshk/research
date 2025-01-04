import { getTokens } from '@/lib/db';
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

const CACHE_KEY = 'token_prices';

export async function GET() {
  try {
    const tokens = await getTokens();
    
    // Try to get cached price data
    const cachedPrices = await redis.get(CACHE_KEY);
    if (cachedPrices) {
      const priceUpdates = JSON.parse(cachedPrices);
      
      // Merge cached price data with tokens
      tokens.forEach(token => {
        const priceData = priceUpdates.find((update: any) => update.id === token.id);
        if (priceData) {
          token.price = priceData.price;
          token.market_cap = priceData.market_cap;
          token.price_change_24h = priceData.price_change_24h;
          token.price_updated_at = priceData.price_updated_at;
        }
      });
    }

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300; 