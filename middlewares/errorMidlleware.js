const apiError = require("../utils/apiError");

// Development: full error detail for debugging
const sendErrorForDev = (err, res) => {
  console.error(`[ERROR DEV] ${err.status} | ${err.message}`);
  console.error(err.stack);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message, // ✅ Fixed: was "massage" (typo)
    stack: err.stack,
  });
};

// Production: safe error for clients — no stack traces exposed
const sendErrorForProd = (err, res) => {
  console.error(`[ERROR PROD] ${err.statusCode} | ${err.status} | ${err.message}`);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message, // ✅ Fixed: was "massage" (typo)
  });
};

const handleJwtInvalidSignature = () =>
  new apiError("Invalid token, please login again.", 401);

const handleJwtExpired = () =>
  new apiError("Expired token, please login again.", 401);

const globaleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    // Handle known JWT errors
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();

    sendErrorForProd(err, res);
  }
};

module.exports = globaleError;