import redis from './redis';
import { NextResponse } from 'next/server';

export interface RateLimitConfig {
  uniqueKey: string;     // Unique identifier for the client
  interval: number;      // Time window in seconds
  limit: number;         // Maximum number of requests allowed in the time window
}

export async function rateLimit(config: RateLimitConfig) {
  const { uniqueKey, interval, limit } = config;
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const key = `rate_limit:${uniqueKey}`;

  try {
    // Create a transaction
    const multi = redis.multi();
    
    // Remove old entries outside the current window
    multi.zremrangebyscore(key, 0, now - interval);
    // Add current request timestamp
    multi.zadd(key, now, `${now}-${Math.random()}`);
    // Count requests in current window
    multi.zcard(key);
    // Set expiry on the key
    multi.expire(key, interval);
    
    const results = await multi.exec();
    
    if (!results) {
      throw new Error('Rate limit check failed');
    }

    const requestCount = results[2][1] as number;

    return {
      success: requestCount <= limit,
      current: requestCount,
      limit,
      remaining: Math.max(0, limit - requestCount),
      reset: now + interval
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // If Redis fails, we'll allow the request but log the error
    return {
      success: true,
      current: 1,
      limit,
      remaining: limit - 1,
      reset: now + interval
    };
  }
} 