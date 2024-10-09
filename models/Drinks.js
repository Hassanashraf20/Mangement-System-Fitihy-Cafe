const mongoose = require('mongoose')

const DrinkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
})

module.exports = mongoose.model('Drink', DrinkSchema)