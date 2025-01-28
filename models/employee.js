const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["EMU", "DENT", "union", "DENTISTRY"],
    require: true,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
