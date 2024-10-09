const express = require('express')

const {createDrink,
    getDrinks,
    getDrink,
    updateDrink,
    deleteDrink} = require('../controllers/drinksController')


const router = express.Router()

router.route("/").post(createDrink)
router.route("/:id").put(updateDrink)
router.route("/:id").delete(deleteDrink)

router.route("/").get(getDrinks)
router.route("/:id").get(getDrink)

module.exports = router