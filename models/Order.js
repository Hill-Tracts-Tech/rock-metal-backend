const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  data: Object,
  products: Array,
  paymentStatus: String,
  transaction_Id: String,
});

module.exports = mongoose.model("Order", OrderSchema);
