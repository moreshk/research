import { getTokens, updateTokenPrices } from '@/lib/db';
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

const CACHE_KEY = 'token_prices';
const CACHE_EXPIRY = 3600; // 1 hour in seconds

async function fetchTokenOverview(address: string) {
  const url = `https://public-api.birdeye.so/defi/token_overview?address=${address}`;
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': process.env.BIRDEYE_API_KEY!,
      'accept': 'application/json',
      'x-chain': 'solana'
    }
  });
  return response.json();
}

export async function GET() {
  try {
    // Check cache first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ 
        success: true, 
        message: 'Prices retrieved from cache',
        cached: true,
        data: JSON.parse(cachedData)
      });
    }

    // If no cache, fetch fresh data
    const tokens = await getTokens();
    const updates = [];

    for (const token of tokens) {
      const overviewData = await fetchTokenOverview(token.contract_address);
      
      if (overviewData.success) {
        updates.push({
          id: token.id,
          price: overviewData.data.price,
          market_cap: overviewData.data.mc,
          price_change_24h: overviewData.data.priceChange24hPercent,
          price_updated_at: new Date().toISOString()
        });
      }
    }

    await updateTokenPrices(updates);

    // Cache the updated data
    await redis.setex(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(updates));

    return NextResponse.json({ 
      success: true, 
      message: 'Prices updated successfully',
      cached: false,
      data: updates 
    });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
  }
} 