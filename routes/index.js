const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const empRoute = require("./empRoute");
const drinkRoute = require("./drinkRoute");
const userRoute = require("./userRoute");

const mountRoutes = (app) => {
  // ✅ Health check — Render pings GET/HEAD "/" to verify the service is alive
  // Without this, every health ping causes a 404 + error log noise
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "Ethaad Cafe API",
      environment: process.env.NODE_ENV || "unknown",
      timestamp: new Date().toISOString(),
    });
  });

  // Support HEAD requests for Render's health checker (same as GET but no body)
  app.head("/", (req, res) => {
    res.status(200).end();
  });

  // API Routes
  app.use("/api/admin", adminRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/emp", empRoute);
  app.use("/api/drink", drinkRoute);
};

module.exports = mountRoutes;
