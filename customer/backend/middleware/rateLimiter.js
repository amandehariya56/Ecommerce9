// Simple in-memory rate limiter
const rateLimitStore = new Map();

const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (rateLimitStore.has(clientId)) {
      const requests = rateLimitStore.get(clientId);
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      rateLimitStore.set(clientId, validRequests);
    }

    // Get current requests for this client
    const currentRequests = rateLimitStore.get(clientId) || [];

    // Check if limit exceeded
    if (currentRequests.length >= maxRequests) {
      const retryAfterMinutes = Math.ceil(windowMs / (1000 * 60));
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${retryAfterMinutes} minutes before trying again.`,
        retryAfter: Math.ceil(windowMs / 1000),
        retryAfterMinutes: retryAfterMinutes
      });
    }

    // Add current request
    currentRequests.push(now);
    rateLimitStore.set(clientId, currentRequests);

    // Add headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - currentRequests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
};

// Different rate limiters for different endpoints - Development Friendly
const generalLimiter = createRateLimiter(15 * 60 * 1000, 500); // 500 requests per 15 minutes
const authLimiter = createRateLimiter(5 * 60 * 1000, 100); // 100 auth requests per 5 minutes (more lenient for dev)
const otpLimiter = createRateLimiter(5 * 60 * 1000, 50); // 50 OTP requests per 5 minutes (more lenient for dev)

// Cleanup function to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [clientId, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
    if (validRequests.length === 0) {
      rateLimitStore.delete(clientId);
    } else {
      rateLimitStore.set(clientId, validRequests);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  createRateLimiter
};
