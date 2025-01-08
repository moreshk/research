import { getTokens, insertToken } from '@/lib/db';
import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { Token, TokensResponse } from '@/types/token';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { tokens, totalCount } = await getTokens(page, limit);
    
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

    return NextResponse.json({
      tokens,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      cached: !!cachedPrices,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.contract_address || !body.chain || !body.transactionSignature) {
      return NextResponse.json(
        { error: 'Contract address, chain, and transaction signature are required' },
        { status: 400 }
      );
    }

    // Verify the transaction
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    const transactionStatus = await connection.getSignatureStatus(body.transactionSignature);
    
    if (!transactionStatus.value || transactionStatus.value.err) {
      return NextResponse.json(
        { error: 'Invalid or failed transaction' },
        { status: 400 }
      );
    }

    // Fetch and verify the transaction details
    const transaction = await connection.getTransaction(body.transactionSignature);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 400 }
      );
    }

    // Verify the transaction details (recipient, amount, token)
    const expectedRecipient = new PublicKey(process.env.FEE_RECIPIENT_ADDRESS!);
    const expectedTokenMint = new PublicKey(process.env.FEE_TOKEN_MINT_ADDRESS!);
    const expectedAmount = 1000 * 10**9; // 1000 tokens, adjust as needed

    // Add logic to verify the transaction details
    // This part depends on how you structure your transaction and may require additional checks
    // You'll need to parse the transaction instructions and verify:
    // 1. The recipient matches the expected recipient
    // 2. The token mint matches the expected token mint
    // 3. The amount transferred matches the expected amount

    // If everything is valid, proceed with token insertion
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