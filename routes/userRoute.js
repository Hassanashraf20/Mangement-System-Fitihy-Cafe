const express = require("express");

const {
  getLoggedUser,
  getUser,
  updateLoggedUserPassword,
  updateLoggedUserData,
} = require("../controllers/userController");

const {
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");

const router = express.Router();

const authz = require("../controllers/authController");
router.use(authz.auth);

router.route("/getMe").get(getLoggedUser, getUser);
router
  .route("/changeMyPassword")
  .put(changeUserPasswordValidator, updateLoggedUserPassword);
router.route("/updateMe").put(updateLoggedUserValidator, updateLoggedUserData);

module.exports = router;
