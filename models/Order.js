const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    amount: Number,
    address: {
      present: String,
      shipping: String,
    },
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
