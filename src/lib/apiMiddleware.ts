import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './rateLimit';

export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options = {
    interval: 60, // 1 minute
    limit: 30     // 30 requests per minute
  }
) {
  // Get IP address from the request
  const ip = request.headers.get('x-real-ip') || 
            request.headers.get('x-forwarded-for') || 
            '127.0.0.1';

  // Create a unique key based on the IP and route
  const uniqueKey = `${ip}-${request.nextUrl.pathname}`;

  const rateLimitResult = await rateLimit({
    uniqueKey,
    interval: options.interval,
    limit: options.limit
  });

  // Set rate limit headers
  const headers = new Headers({
    'X-RateLimit-Limit': options.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': rateLimitResult.reset.toString()
  });

  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Please try again later'
      }),
      {
        status: 429,
        headers: headers
      }
    );
  }

  // Execute the handler
  const response = await handler();

  // Add rate limit headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
} 