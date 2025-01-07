import { getTokens, insertToken } from '@/lib/db';
import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { isAddress } from 'ethers';

const VALID_CHAINS = [
  'solana',
  'ethereum',
  'arbitrum',
  'avalanche',
  'bsc',
  'optimism',
  'polygon',
  'base',
  'zksync',
  'sui'
] as const;

type Chain = typeof VALID_CHAINS[number];

function isValidChain(chain: string): chain is Chain {
  return VALID_CHAINS.includes(chain.toLowerCase() as Chain);
}

function isValidContractAddress(address: string, chain: Chain): boolean {
  // Special handling for Solana and Sui addresses
  if (chain === 'solana') {
    // Solana addresses are 32-44 characters long and base58 encoded
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  
  if (chain === 'sui') {
    // Sui addresses start with '0x' and are 66 characters long
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  }

  // For EVM-compatible chains, use ethers.js validation
  return isAddress(address);
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields exist
    if (!body.contract_address || !body.chain) {
      return NextResponse.json(
        { error: 'Contract address and chain are required' },
        { status: 400 }
      );
    }

    // Validate chain
    if (!isValidChain(body.chain)) {
      return NextResponse.json(
        { error: `Invalid chain. Must be one of: ${VALID_CHAINS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate contract address format
    if (!isValidContractAddress(body.contract_address, body.chain.toLowerCase() as Chain)) {
      return NextResponse.json(
        { error: 'Invalid contract address format for the specified chain' },
        { status: 400 }
      );
    }

    const newToken = await insertToken(body);
    return NextResponse.json(newToken, { status: 201 });
  } catch (error: any) {
    console.error('Error creating token:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300; 