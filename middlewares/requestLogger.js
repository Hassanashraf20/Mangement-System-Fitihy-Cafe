/**
 * Custom Request Logger Middleware
 * Logs every incoming request with method, URL, status, and response time.
 * Health check pings on "/" are suppressed to keep logs clean.
 */

const requestLogger = (req, res, next) => {
  // ✅ Suppress Render's health check pings to avoid log noise
  const isHealthCheck = req.path === "/" && (req.method === "GET" || req.method === "HEAD");

  const start = Date.now();

  res.on("finish", () => {
    if (isHealthCheck) return; // skip logging health checks

    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const statusLabel =
      statusCode >= 500
        ? "ERROR  "
        : statusCode >= 400
        ? "WARN   "
        : statusCode >= 300
        ? "REDIRECT"
        : "OK     ";

    console.log(
      `[${timestamp}] ${statusLabel} | ${method.padEnd(6)} ${originalUrl.padEnd(35)} | ${statusCode} | ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
