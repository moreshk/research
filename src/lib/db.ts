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
    console.log('Connection successful:', result.rows[0]);
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
        LOWER(chain) as chain,
        framework as ecosystem,
        is_agent,
        is_framework,
        is_application,
        is_meme,
        price,
        price_change_24h,
        price_updated_at,
        project_desc
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

export async function updateTokenPrices(tokenUpdates: { id: number, price: number, price_change_24h: number, price_updated_at: string }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const update of tokenUpdates) {
      await client.query(
        'UPDATE tokens SET price = $1, price_change_24h = $2, price_updated_at = $3 WHERE id = $4',
        [update.price, update.price_change_24h, update.price_updated_at, update.id]
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