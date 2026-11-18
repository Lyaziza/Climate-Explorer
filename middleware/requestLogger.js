export function requestLogger(req, res, next) {
  const started = new Date().toISOString();
  console.log(`[${started}] ${req.method} ${req.originalUrl}`);
  next();
}
