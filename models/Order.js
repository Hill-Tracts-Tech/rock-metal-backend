const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
    address: {
      present: String,
      shipping: String,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
