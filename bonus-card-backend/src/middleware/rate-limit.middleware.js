const attempts = new Map();

function removeExpired(now) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

function createRateLimiter({ windowMs, max }) {
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const current = attempts.get(key);

    if (attempts.size > 10000) {
      removeExpired(now);
    }

    if (!current || current.resetAt <= now) {
      attempts.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      next();
      return;
    }

    if (current.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Слишком много запросов. Попробуйте немного позже.'
      });
      return;
    }

    current.count += 1;
    next();
  };
}

module.exports = {
  createRateLimiter
};
