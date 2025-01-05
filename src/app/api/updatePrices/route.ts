import { getTokens, updateTokenPrices } from "@/lib/db";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const CACHE_KEY = "token_prices";
const CACHE_EXPIRY = 3600; // 1 hour in seconds

async function fetchTokenOverview(
  address: string,
  chain: string,
  tokenId: number
) {
  const apiChain = tokenId === 3 ? "ethereum" : chain.toLowerCase();
  const url = `https://public-api.birdeye.so/defi/token_overview?address=${address}`;
  const response = await fetch(url, {
    headers: {
      "X-API-KEY": process.env.BIRDEYE_API_KEY!,
      accept: "application/json",
      "x-chain": apiChain,
    },
  });
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData && JSON.parse(cachedData).length) {
      return NextResponse.json({
        success: true,
        message: "Prices retrieved from cache",
        cached: true,
        data: JSON.parse(cachedData),
      });
    }

    // If no cache, fetch fresh data
    const tokens = await getTokens();

    const updates = await Promise.all(
      tokens.map(async (token) => {
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
            price_updated_at: new Date().toISOString().replace("Z", "+00"),
            contract_address: token.contract_address,
            chain: token.id === 3 ? "base" : token.chain,
          };
        } else {
          console.error(
            `Failed to fetch data for token ${token.name} (${token.symbol}) on chain ${token.chain}. Error:`,
            overviewData.error || "Unknown error"
          );
          return null; // Handle failed fetch
        }
      })
    );

    const validUpdates = updates.filter((update) => update !== null);
    await updateTokenPrices(validUpdates);
    await redis.setex(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(updates));

    return NextResponse.json({
      success: true,
      message: "Prices updated successfully",
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
