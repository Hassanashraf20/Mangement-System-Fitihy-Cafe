const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

const Employee = require("../models/employee");
const Order = require("../models/order");

// @desc    Create employee
// @route   POST /api/employee
//@acsess   Admin
exports.createEmp = asyncHandler(async (req, res) => {
  const emp = await Employee.create({
    name: req.body.name,
    role: req.body.role,
  });

  res.status(200).json({ date: emp });
});

// @desc    GET ALL employees
// @route   GET /api/employee
//@acsess   Admin
exports.getAllEmp = asyncHandler(async (req, res) => {
  const emp = await Employee.find(req.query);
  res.status(200).json({ result: emp.length, data: emp });
});

// @desc    GET ONE employee bi ID
// @route   GET /api/employee/:id
//@acsess   Admin
exports.getEmp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const emp = await Employee.findById(id);

  if (!emp) {
    return next(new apiError(`emp not found for this: ${req.params.id}`, 404));
  }

  res.status(200).json({ data: emp });
});

// @desc    UPDATE ONE employee bi ID
// @route   UPDATE /api/employee
//@acsess   Admin
exports.updateEmp = asyncHandler(async (req, res, next) => {
  const allowedRoles = ["EMU", "DENT" , "union" , "DENTISTRY"];
  const { role } = req.body;
  if (role && !allowedRoles.includes(role)) {
    return next(new apiError(`Invalid role value: ${role}`, 400));
  }
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!emp) {
    return next(new apiError(`emp not found for this: ${req.params.id}`, 404));
  }

  res.status(200).json({ data: emp });
});

// @desc    DELETE ONE employee bi ID
// @route   DELETE /api/employee
//@acsess   Admin
exports.deleteEmp = asyncHandler(async (req, res, next) => {
  const empId = req.params.id;

  // Check if the employee exists
  const emp = await Employee.findById(empId);
  if (!emp) {
    return next(new apiError(`Employee not found for ID: ${empId}`, 404));
  }

  // Check if the employee has any orders
  const orders = await Order.find({ employee: empId });
  if (orders.length > 0) {
    // Delete all orders for the employee
    await Order.deleteMany({ employee: empId });
  }

  // Delete the employee
  await Employee.findByIdAndDelete(empId);

  res
    .status(204)
    .json({ msg: "Employee and associated orders deleted successfully" });
});
