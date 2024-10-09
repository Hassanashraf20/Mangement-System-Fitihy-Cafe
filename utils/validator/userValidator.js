const slugify = require("slugify");
const { check } = require("express-validator");
const validaterMiddliware = require("../../middlewares/validatorMidlleware");
const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("invalid User id"),
  validaterMiddliware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("invalid User id"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("e-mail alaredy in used"));
        }
      })
    ),

  check("role").optional(),
  validaterMiddliware,
];

exports.changeUserPasswordValidator = [
  //check("id").isMongoId().withMessage("invalid user id"),
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter the current Password "),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  check("password")
    .notEmpty()
    .withMessage("You must enter the password ")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await userModel.findById(req.user._id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatch) {
        throw new Error("Your current password is incorrect");
      }
      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validaterMiddliware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("invalid user id"),
  validaterMiddliware,
];

exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("e-mail alaredy in used"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profilePhoto").optional(),

  validaterMiddliware,
];
