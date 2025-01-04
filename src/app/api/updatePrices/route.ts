import { getTokens, updateTokenPrices } from '@/lib/db';
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

const CACHE_KEY = 'token_prices';
const CACHE_EXPIRY = 3600; // 1 hour in seconds

async function fetchPrices(chain: string, addresses: string[]) {
  const url = `https://public-api.birdeye.so/defi/multi_price?list_address=${addresses.join(',')}`;
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': '6b234866de0740509b9c0eef83e97119',
      'accept': 'application/json',
      'x-chain': chain
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
    const tokensByChain: { [key: string]: typeof tokens } = {};

    tokens.forEach(token => {
      if (!tokensByChain[token.chain]) {
        tokensByChain[token.chain] = [];
      }
      tokensByChain[token.chain].push(token);
    });

    const updates = [];

    for (const [chain, chainTokens] of Object.entries(tokensByChain)) {
      const addresses = chainTokens.map(token => token.contract_address);
      const priceData = await fetchPrices(chain, addresses);

      if (priceData.success) {
        for (const token of chainTokens) {
          const tokenData = priceData.data[token.contract_address];
          if (tokenData) {
            updates.push({
              id: token.id,
              price: tokenData.value,
              price_change_24h: tokenData.priceChange24h,
              price_updated_at: new Date(tokenData.updateHumanTime).toISOString()
            });
          }
        }
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