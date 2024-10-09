const express = require("express");

const {
  addOrderForEmployee,
  removeSpecificDrinkFromOrder,
  removeOrderForEmployee,
  getBillForEmployee,
  markBillAsPaidAndRemoveOrders,
} = require("../controllers/adminController");

const router = express.Router();

// Admin adds drinks for employees
router.post("/order", addOrderForEmployee);

// Remove a specific drink from an employee's order based on employee name, drink ID, and date
router.delete("/order/remove-drink", removeSpecificDrinkFromOrder);

// Remove Order for employee's order
router.delete("/order/remove-order", removeOrderForEmployee);

// Admin retrieves bills for an employee by name
router.get("/bill", getBillForEmployee);

// Admin marks all unpaid bills as paid and removes them for a specific employee by name
router.put("/pay", markBillAsPaidAndRemoveOrders);

module.exports = router;
