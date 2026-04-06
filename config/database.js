const mongoose = require("mongoose");

const dbconnection = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then((conn) => {
      console.log(`[DB] Connected successfully to: ${conn.connection.host}`);
    })
    .catch((err) => {
      // ✅ Fixed: catch was commented out — DB errors now logged and crash the process
      console.error(`[DB] Connection failed: ${err.message}`);
      process.exit(1);
    });
};

module.exports = dbconnection;
