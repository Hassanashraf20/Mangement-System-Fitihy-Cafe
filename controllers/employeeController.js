const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

const Employee = require("../models/employee");

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
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
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
  const emp = await Employee.findByIdAndDelete(req.params.id);

  if (!emp) {
    return next(new apiError(`emp not found for this: ${req.params.id}`, 404));
  }

  res.status(204).send();
});
