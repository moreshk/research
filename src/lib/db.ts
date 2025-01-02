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
      const result = await client.query('SELECT *, framework as ecosystem FROM tokens ORDER BY name ASC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      throw error;
    } finally {
      client.release();
    }
  }