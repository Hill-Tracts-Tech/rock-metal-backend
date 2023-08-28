const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  data: Object,
  products: Array,
  paymentStatus: String,
  transaction_Id: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Order", OrderSchema);
