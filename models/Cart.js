const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        title: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        img: String,
        desc: String,
        color: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: Number,
      },
    ],
    amount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
