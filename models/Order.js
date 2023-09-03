const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    data: Object,
    products: Array,
    paymentStatus: String,
    shippingStatus: String,
    transaction_Id: String,
    total_amount: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
