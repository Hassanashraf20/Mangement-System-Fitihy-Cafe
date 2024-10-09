const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  drinks: [
    {
      drinkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drink",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  date: { type: Date, required: true },
  paid: { type: Boolean, default: false },
});

module.exports = mongoose.model("Order", orderSchema);

// const mongoose = require('mongoose')

// const OrderSchema = new mongoose.Schema({
//   employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' , require: true},
//   drinks: [
//     {
//       name: String,
//       quantity: Number,
//       price: Number,
//     },
//   ],
//   date: { type: Date, default: Date.now ,require: true},
//   isPaid: { type: Boolean, default: false }
// })

// module.exports = mongoose.model('Order', OrderSchema)
