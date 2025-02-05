const express = require("express");

const {
  addOrderForEmployee,
  removeSpecificDrinkFromOrder,
  removeOrderForEmployee,
  getBillForEmployee,
  markBillAsPaidAndRemoveOrders,
  getAllOrders,
  partialPay,
  getAllBillForEmployee,
  updateSpecificDrink,
  RemoveSpecificDrink,
} = require("../controllers/adminController");

const router = express.Router();

// const authz = require("../controllers/authController");
// router.use(authz.auth);

// Admin adds drinks for employees
router.post("/order", addOrderForEmployee);

// Remove a specific drink from an employee's order based on employee name, drink ID, and date
router.delete("/order/remove-drink", removeSpecificDrinkFromOrder);

// Remove Order for employee's order
router.delete("/order/remove-order", removeOrderForEmployee);

// Admin retrieves bills for an employee by name
router.post("/bill", getBillForEmployee);

// Admin marks all unpaid bills as paid and removes them for a specific employee by name
router.put("/pay", markBillAsPaidAndRemoveOrders);

// Admin Partial Pay in specific employee's order Period Date
router.put("/partial-pay", partialPay);

// Admin retrieves all orders for an employee by name
router.get("/orders", getAllOrders);

router.get("/all-bills/:employeeName", getAllBillForEmployee);

router.patch("/orders/update-drink", updateSpecificDrink);

router.delete("/orders/remove-drink", RemoveSpecificDrink);

module.exports = router;
