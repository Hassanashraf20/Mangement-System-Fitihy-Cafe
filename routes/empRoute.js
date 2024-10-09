const express = require("express");

const {
  createEmp,
  getAllEmp,
  getEmp,
  updateEmp,
  deleteEmp,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/", createEmp);
//router.route("/").post(createEmp)
router.route("/").get(getAllEmp);
router.route("/:id").get(getEmp);
router.route("/:id").put(updateEmp);
router.route("/:id").delete(deleteEmp);

module.exports = router;