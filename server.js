const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config({ path: "config.env" });

const apiError = require(`./utils/apiError`);
const dbconnection = require("./config/database");
const globaleError = require(`./middlewares/errorMidlleware`);
const requestLogger = require("./middlewares/requestLogger");

//mountRoutes
const mountRoutes = require("./routes");

//Express app
const app = express();
app.use(cors());
app.options("*", cors());

//Database Call
dbconnection();

//Middleware
app.use(express.json());

// ✅ Fixed: was "Node_ENV" (wrong casing) — now correctly reads NODE_ENV
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Colorized compact logs for development
  console.log(`[SERVER] Mode: DEVELOPMENT`);
} else {
  app.use(morgan("combined")); // ✅ Fixed: "prod" is not a valid morgan format — use "combined" for production
  console.log(`[SERVER] Mode: PRODUCTION`);
}

// ✅ Custom structured request logger — logs all routes with method, URL, status, and response time
app.use(requestLogger);

// Mount Routes
mountRoutes(app);

// Handle Unhandled Routes
app.all("*", (req, res, next) => {
  console.warn(`[ROUTE NOT FOUND] ${req.method} ${req.originalUrl}`);
  next(new apiError(`Can not find this route: ${req.originalUrl}`, 404));
});

// Global Error Handling Middleware
app.use(globaleError);

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error(`[UNHANDLED REJECTION] ${err.name}: ${err.message}`);
  console.error(err.stack);
  server.close(() => {
    console.error(`[SERVER] Shutting down due to unhandled rejection...`);
    process.exit(1);
  });
});

// Uncaught Exceptions (safety net)
process.on("uncaughtException", (err) => {
  console.error(`[UNCAUGHT EXCEPTION] ${err.name}: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || process.env.port || 5000;
const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running on port: ${PORT} | ENV: ${process.env.NODE_ENV || "not set"}`);
});
