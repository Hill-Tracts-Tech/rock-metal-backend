const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guest: {
      name: { type: String, required: false },
      phone: { type: String, required: true },
      email: { type: String, required: false },
      address: { type: Object, required: true },
    },
    products: [
      {
        title: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total_amount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    paymentStatus: { type: String, default: "Pending" },
    shippingStatus: { type: String, default: "Processing" },
    transaction_Id: { type: String, required: false },
    trackingId: { type: String, default: uuidv4 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
