import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, // per minute
});

export async function checkRateLimit(key: string): Promise<{ success: boolean; message?: string }> {
  try {
    await rateLimiter.consume(key);
    return { success: true };
  } catch {
    return { success: false, message: 'Too many requests. Please try again later.' };
  }
}

// For contact form - stricter limits
const contactRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // 5 requests per minute
});

export async function checkContactRateLimit(key: string): Promise<{ success: boolean; message?: string }> {
  try {
    await contactRateLimiter.consume(key);
    return { success: true };
  } catch {
    return { success: false, message: 'Too many submissions. Please try again later.' };
  }
}