import { Pool } from 'pg';

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
        price_updated_at,
        project_desc,
        github_url,
        github_analysis,
        twitter_url,
        dexscreener_url
      FROM tokens 
      ORDER BY name ASC
    `);
    return result.rows;
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
  price_updated_at: string,
  contract_address: string,
  chain: string
}[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`Updating ${tokenUpdates.length} tokens`);
    for (const update of tokenUpdates) {
      // Special handling for Virtuals (ID 3)
      const chainToStore = update.id === 3 ? 'ethereum' : update.chain;
      
      console.log(
        `Updating token ID ${update.id}: price=${update.price}, market_cap=${update.market_cap}, ` +
        `contract=${update.contract_address}, chain=${update.chain}, stored_chain=${chainToStore}`
      );

      await client.query(
        'UPDATE tokens SET price = $1, market_cap = $2, price_change_24h = $3, price_updated_at = $4, chain = $5 WHERE id = $6',
        [update.price, update.market_cap, update.price_change_24h, update.price_updated_at, chainToStore, update.id]
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