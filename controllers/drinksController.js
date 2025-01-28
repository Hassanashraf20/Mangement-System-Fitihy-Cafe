const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

const Drink = require("../models/Drinks");

// @desc    Create Drink
// @route   POST /api/drink
exports.createDrink = asyncHandler(async (req, res) => {
  const drinks = await Drink.create({
    name: req.body.name,
    price: req.body.price,
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
  const { price, unionPrice, dentPrice } = req.body;

  const errors = [];
  if (price !== undefined && (isNaN(price) || price <= 0)) {
    errors.push("Price must be a number greater than 0.");
  }
  if (unionPrice !== undefined && (isNaN(unionPrice) || unionPrice <= 0)) {
    errors.push("Union price must be a number greater than 0.");
  }
  if (dentPrice !== undefined && (isNaN(dentPrice) || dentPrice <= 0)) {
    errors.push("Dentistry price must be a number greater than 0.");
  }

  if (errors.length > 0) {
    return next(new apiError(errors.join(" "), 400));
  }

  const drink = await Drink.findByIdAndUpdate(
    req.params.id,
    { price, unionPrice, dentPrice },
    { new: true, runValidators: true }
  );

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
  const drink = await Drink.findByIdAndDelete(req.params.id);

  if (!drink) {
    return next(
      new apiError(`Drink not found for this: ${req.params.id}`, 404)
    );
  }
  res.status(204).send();
});
