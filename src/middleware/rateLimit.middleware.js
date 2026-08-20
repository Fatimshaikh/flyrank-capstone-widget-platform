import rateLimit from 'express-rate-limit';

// Limits how many submissions a single IP can make in a time window.
// A flood of requests gets 429s, but legitimate traffic keeps working -
// this is what keeps the public submission endpoint from being taken down.
export const submissionRateLimit = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this IP, please try again shortly' },
});
