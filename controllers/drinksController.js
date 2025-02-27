const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

const Drink = require("../models/Drinks");
const Order = require("../models/order");
// @desc    Create Drink
// @route   POST /api/drink
exports.createDrink = asyncHandler(async (req, res) => {
  const drinks = await Drink.create({
    name: req.body.name,
    price: req.body.price,
    unionPrice: req.body.unionPrice,
    dentistryPrice: req.body.dentistryPrice,
  });
  res
    .status(201)
    .json({ message: `${drinks.name} add succsesfuly.`, data: drinks });
});

// @desc    GET ALL Drinks
// @route   GET /api/drink
exports.getDrinks = asyncHandler(async (req, res) => {
  const drinks = await Drink.find(req.query);
  res.status(200).json({ result: drinks.length, data: drinks });
});

// @desc    GET Drink
// @route   GET /api/drink
exports.getDrink = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const drink = await Drink.findById(id);
  if (!drink) {
    return next(
      new apiError(`drink not found for this: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: drink });
});

// @desc    UPDATE ONE Drink bi ID
// @route   UPDATE /api/Drink
exports.updateDrink = asyncHandler(async (req, res, next) => {
  const { price, unionPrice, dentistryPrice } = req.body;

  const updateFields = {};
  if (price !== undefined) updateFields.price = price;
  if (unionPrice !== undefined) updateFields.unionPrice = unionPrice;
  if (dentistryPrice !== undefined)
    updateFields.dentistryPrice = dentistryPrice;

  const drink = await Drink.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
  });

  if (!drink) {
    return next(
      new apiError(`Drink not found for this ID: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ message: "Drink updated successfully", data: drink });
});

// @desc    DELETE ONE Drink bi ID
// @route   DELETE /api/Drink
exports.deleteDrink = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ "drinks.drinkId": req.params.id });

  if (orders.length > 0) {
    return next(
      new apiError(
        `This drink is associated with existing orders and cannot be deleted.`,
        400
      )
    );
  }
  const drink = await Drink.findByIdAndDelete(req.params.id);

  if (!drink) {
    return next(
      new apiError(`Drink not found for this: ${req.params.id}`, 404)
    );
  }
  res.status(204).send();
});
