/**
 * Custom Request Logger Middleware
 * Logs every incoming request with method, URL, status, and response time.
 * Used across all mounted routes for well-structured monitoring.
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Once the response finishes, log the details
  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Color-code status for dev visibility (no effect in Render plain logs)
    const statusLabel =
      statusCode >= 500
        ? "ERROR"
        : statusCode >= 400
        ? "WARN"
        : statusCode >= 300
        ? "REDIRECT"
        : "OK";

    console.log(
      `[${timestamp}] ${statusLabel} | ${method} ${originalUrl} | ${statusCode} | ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
