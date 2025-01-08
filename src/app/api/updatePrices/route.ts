import { getTokens, updateTokenPrices } from "@/lib/db";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const CACHE_KEY = "token_prices1";
const CACHE_EXPIRY = 3600; // 1 hour in seconds
const RATE_LIMIT = 14; // maximum requests per second
const BATCH_DELAY = 1000; // 1 second delay between batches

// Add this helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTokenOverview(
  address: string,
  chain: string,
  tokenId: number
) {
  // Skip hyperliquid chain
  if (chain.toLowerCase() === 'hyperliquid') {
    // console.log(`Skipping Hyperliquid chain as it's not supported by Birdeye`);
    return { success: false, error: 'Unsupported chain' };
  }

  const apiChain = tokenId === 3 ? "ethereum" : chain.toLowerCase();
  const url = `https://public-api.birdeye.so/defi/token_overview?address=${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": process.env.BIRDEYE_API_KEY!,
        accept: "application/json",
        "x-chain": apiChain,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch token overview: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(
      `Error fetching token overview for ${address} on ${chain}:`,
      error
    );
    // @ts-ignore
    return { success: false, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (parsedData.length) {
        return NextResponse.json({
          success: true,
          message: "Prices retrieved from cache",
          cached: true,
          data: parsedData,
        });
      }
    }

    // If no cache, fetch fresh data
    const tokens = await getTokens();

    // Process tokens in batches
    const updates: any[] = [];
    for (let i = 0; i < tokens.length; i += RATE_LIMIT) {
      const batch = tokens.slice(i, i + RATE_LIMIT);
      const batchPromises = batch.map(async (token) => {
        const overviewData = await fetchTokenOverview(
          token.contract_address,
          token.chain,
          token.id
        );

        if (overviewData.success) {
          return {
            id: token.id,
            price: overviewData.data.price,
            market_cap: overviewData.data.mc,
            price_change_24h: overviewData.data.priceChange24hPercent,
            price_change_1h: overviewData.data.priceChange1hPercent,
            price_change_2h: overviewData.data.priceChange2hPercent,
            price_change_4h: overviewData.data.priceChange4hPercent,
            price_change_8h: overviewData.data.priceChange8hPercent,
            volume_change_1h: overviewData.data.v1hChangePercent,
            volume_change_2h: overviewData.data.v2hChangePercent,
            volume_change_4h: overviewData.data.v4hChangePercent,
            volume_change_8h: overviewData.data.v8hChangePercent,
            volume_buy_change_1h: overviewData.data.vBuy1hChangePercent,
            volume_sell_change_1h: overviewData.data.vSell1hChangePercent,
            volume_buy_change_2h: overviewData.data.vBuy2hChangePercent,
            volume_sell_change_2h: overviewData.data.vSell2hChangePercent,
            volume_buy_change_4h: overviewData.data.vBuy4hChangePercent,
            volume_sell_change_4h: overviewData.data.vSell4hChangePercent,
            volume_buy_change_8h: overviewData.data.vBuy8hChangePercent,
            volume_sell_change_8h: overviewData.data.vSell8hChangePercent,
            unique_wallet_change_1h: overviewData.data.uniqueWallet1hChangePercent,
            unique_wallet_change_2h: overviewData.data.uniqueWallet2hChangePercent,
            unique_wallet_change_4h: overviewData.data.uniqueWallet4hChangePercent,
            unique_wallet_change_8h: overviewData.data.uniqueWallet8hChangePercent,
            trade_change_1h: overviewData.data.trade1hChangePercent,
            trade_change_2h: overviewData.data.trade2hChangePercent,
            trade_change_4h: overviewData.data.trade4hChangePercent,
            trade_change_8h: overviewData.data.trade8hChangePercent,
            price_updated_at: new Date().toISOString().replace("Z", "+00"),
            contract_address: token.contract_address,
            chain: token.id === 3 ? "base" : token.chain,
            v24h_change_percent: overviewData.data.v24hChangePercent,
            vbuy24h_change_percent: overviewData.data.vBuy24hChangePercent,
            vsell24h_change_percent: overviewData.data.vSell24hChangePercent,
            unique_wallet24h_change_percent: overviewData.data.uniqueWallet24hChangePercent,
            trade24h_change_percent: overviewData.data.trade24hChangePercent,
            name: overviewData.data.name,
            symbol: overviewData.data.symbol,
            description: overviewData.data.extensions?.description || null,
          };
        } else {
          console.error(
            `Failed to fetch data for token ${token.name} (${token.symbol}) on chain ${token.chain}.`
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      updates.push(...batchResults.filter((update) => update !== null));

      // If this isn't the last batch, add delay before the next batch
      if (i + RATE_LIMIT < tokens.length) {
        await delay(BATCH_DELAY);
      }
    }

    if (updates.length > 0) {
      // Update token prices in the database
      await updateTokenPrices(updates);

      // Cache the updated data
      await redis.setex(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(updates));
    }

    return NextResponse.json({
      success: true,
      message:
        updates.length > 0
          ? "Prices updated successfully"
          : "No valid updates available",
      cached: false,
      data: updates,
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
