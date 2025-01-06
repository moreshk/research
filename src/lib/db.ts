import { Pool } from 'pg';
import {
  calculateBreakoutScore,
  type TokenMetrics
} from './scoring';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false  // In production, you should use proper SSL certificates
  },
  // Add these parameters to ensure SSL is used
  keepAlive: true,
  connectionTimeoutMillis: 5000,
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    //console.log('Connection successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
} 

export async function getTokens() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id, 
        name,
        symbol,
        description,
        contract_address,
        image_url,
        CASE 
          WHEN contract_address = '0x44ff8620b8ca30902395a7bd3f2407e1a091bf73' THEN 'base'
          ELSE LOWER(chain)
        END as chain,
        framework as ecosystem,
        is_agent,
        is_framework,
        is_application,
        is_meme,
        price,
        price_change_24h,
        price_change_1h,
        price_change_2h,
        price_change_4h,
        price_change_8h,
        volume_change_1h,
        volume_change_2h,
        volume_change_4h,
        volume_change_8h,
        volume_buy_change_1h,
        volume_sell_change_1h,
        volume_buy_change_2h,
        volume_sell_change_2h,
        volume_buy_change_4h,
        volume_sell_change_4h,
        volume_buy_change_8h,
        volume_sell_change_8h,
        unique_wallet_change_1h,
        unique_wallet_change_2h,
        unique_wallet_change_4h,
        unique_wallet_change_8h,
        trade_change_1h,
        trade_change_2h,
        trade_change_4h,
        trade_change_8h,
        price_updated_at,
        project_desc,
        github_url,
        github_analysis,
        twitter_url,
        dexscreener_url,
        v24h_change_percent,
        vbuy24h_change_percent,
        vsell24h_change_percent,
        unique_wallet24h_change_percent,
        trade24h_change_percent
      FROM tokens 
      ORDER BY name ASC
    `);

    // Transform the results to include the calculated scores
    const tokensWithScores = result.rows.map(token => {
      const metrics: TokenMetrics = {
        priceChange24hPercent: token.price_change_24h,
        priceChange1hPercent: token.price_change_1h,
        priceChange2hPercent: token.price_change_2h,
        priceChange4hPercent: token.price_change_4h,
        priceChange8hPercent: token.price_change_8h,
        
        v24hChangePercent: token.v24h_change_percent,
        v1hChangePercent: token.volume_change_1h,
        v2hChangePercent: token.volume_change_2h,
        v4hChangePercent: token.volume_change_4h,
        v8hChangePercent: token.volume_change_8h,
        
        vBuy24hChangePercent: token.vbuy24h_change_percent,
        vBuy1hChangePercent: token.volume_buy_change_1h,
        vBuy2hChangePercent: token.volume_buy_change_2h,
        vBuy4hChangePercent: token.volume_buy_change_4h,
        vBuy8hChangePercent: token.volume_buy_change_8h,
        vSell24hChangePercent: token.vsell24h_change_percent,
        vSell1hChangePercent: token.volume_sell_change_1h,
        vSell2hChangePercent: token.volume_sell_change_2h,
        vSell4hChangePercent: token.volume_sell_change_4h,
        vSell8hChangePercent: token.volume_sell_change_8h,
        
        uniqueWallet24hChangePercent: token.unique_wallet24h_change_percent,
        uniqueWallet1hChangePercent: token.unique_wallet_change_1h,
        uniqueWallet2hChangePercent: token.unique_wallet_change_2h,
        uniqueWallet4hChangePercent: token.unique_wallet_change_4h,
        uniqueWallet8hChangePercent: token.unique_wallet_change_8h,
        
        trade24hChangePercent: token.trade24h_change_percent,
        trade1hChangePercent: token.trade_change_1h,
        trade2hChangePercent: token.trade_change_2h,
        trade4hChangePercent: token.trade_change_4h,
        trade8hChangePercent: token.trade_change_8h
      };

      const scores = calculateBreakoutScore(metrics);
      
      return {
        ...token,
        breakout_score: scores.breakoutScore,
        price_score: scores.components.price.score,
        volume_score: scores.components.volume.score,
        buy_sell_score: scores.components.buySell.score,
        wallet_score: scores.components.wallet.score,
        trade_score: scores.components.trade.score,
        breakout_level: null
      };
    });

    return tokensWithScores;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTokenPrices(tokenUpdates: { 
  id: number, 
  price: number, 
  market_cap: number, 
  price_change_24h: number,
  price_change_1h: number,
  price_change_2h: number,
  price_change_4h: number,
  price_change_8h: number,
  volume_change_1h: number,
  volume_change_2h: number,
  volume_change_4h: number,
  volume_change_8h: number,
  volume_buy_change_1h: number,
  volume_sell_change_1h: number,
  volume_buy_change_2h: number,
  volume_sell_change_2h: number,
  volume_buy_change_4h: number,
  volume_sell_change_4h: number,
  volume_buy_change_8h: number,
  volume_sell_change_8h: number,
  unique_wallet_change_1h: number,
  unique_wallet_change_2h: number,
  unique_wallet_change_4h: number,
  unique_wallet_change_8h: number,
  trade_change_1h: number,
  trade_change_2h: number,
  trade_change_4h: number,
  trade_change_8h: number,
  price_updated_at: string,
  contract_address: string,
  chain: string,
  v24h_change_percent: number,
  vbuy24h_change_percent: number,
  vsell24h_change_percent: number,
  unique_wallet24h_change_percent: number,
  trade24h_change_percent: number
}[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`Updating ${tokenUpdates.length} tokens`);
    
    for (const update of tokenUpdates) {
      const chainToStore = update.id === 3 ? 'ethereum' : update.chain;
      
      await client.query(
        `UPDATE tokens SET 
          price = $1, 
          market_cap = $2, 
          price_change_24h = $3,
          price_change_1h = $4,
          price_change_2h = $5,
          price_change_4h = $6,
          price_change_8h = $7,
          volume_change_1h = $8,
          volume_change_2h = $9,
          volume_change_4h = $10,
          volume_change_8h = $11,
          volume_buy_change_1h = $12,
          volume_sell_change_1h = $13,
          volume_buy_change_2h = $14,
          volume_sell_change_2h = $15,
          volume_buy_change_4h = $16,
          volume_sell_change_4h = $17,
          volume_buy_change_8h = $18,
          volume_sell_change_8h = $19,
          unique_wallet_change_1h = $20,
          unique_wallet_change_2h = $21,
          unique_wallet_change_4h = $22,
          unique_wallet_change_8h = $23,
          trade_change_1h = $24,
          trade_change_2h = $25,
          trade_change_4h = $26,
          trade_change_8h = $27,
          price_updated_at = $28,
          chain = $29,
          v24h_change_percent = $30,
          vbuy24h_change_percent = $31,
          vsell24h_change_percent = $32,
          unique_wallet24h_change_percent = $33,
          trade24h_change_percent = $34
        WHERE id = $35`,
        [
          update.price,
          update.market_cap,
          update.price_change_24h,
          update.price_change_1h,
          update.price_change_2h,
          update.price_change_4h,
          update.price_change_8h,
          update.volume_change_1h,
          update.volume_change_2h,
          update.volume_change_4h,
          update.volume_change_8h,
          update.volume_buy_change_1h,
          update.volume_sell_change_1h,
          update.volume_buy_change_2h,
          update.volume_sell_change_2h,
          update.volume_buy_change_4h,
          update.volume_sell_change_4h,
          update.volume_buy_change_8h,
          update.volume_sell_change_8h,
          update.unique_wallet_change_1h,
          update.unique_wallet_change_2h,
          update.unique_wallet_change_4h,
          update.unique_wallet_change_8h,
          update.trade_change_1h,
          update.trade_change_2h,
          update.trade_change_4h,
          update.trade_change_8h,
          update.price_updated_at,
          chainToStore,
          update.v24h_change_percent,
          update.vbuy24h_change_percent,
          update.vsell24h_change_percent,
          update.unique_wallet24h_change_percent,
          update.trade24h_change_percent,
          update.id
        ]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating token prices:', error);
    throw error;
  } finally {
    client.release();
  }
}