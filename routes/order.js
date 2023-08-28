const Cart = require("../models/Cart");
const { ObjectId } = require("mongodb");
const router = require("express").Router();
const { SslCommerzPayment } = require("sslcommerz");
const Order = require("../models/Order");
require("dotenv").config();

router.post("/payment", async (req, res) => {
  const transaction_Id = new ObjectId().toString();

  const result = await Cart.findOne({
    user: req.body._id,
  });

  const { amount: total_amount, products } = result;
  const { name, email, address, postcode, city, phone } = req.body;

  const data = {
    total_amount: total_amount,
    currency: "BDT",
    product_img: products[0]?.img,
    tran_id: transaction_Id,
    success_url: `${process.env.StoreRoute}/payment/success/${transaction_Id}`,
    fail_url: `${process.env.StoreRoute}/payment/fail/${transaction_Id}`,
    cancel_url: `${process.env.StoreRoute}/cancel/${transaction_Id}`,
    ipn_url: `${process.env.StoreRoute}/ipn`,
    shipping_method: "Courier",
    product_name: "my product",
    product_category: "T-Shirt",
    product_profile: "general",
    cus_name: name,
    cus_email: email,
    cus_add1: address,
    cus_add2: city,
    cus_city: city,
    cus_state: city,
    cus_postcode: postcode,
    cus_country: "Bangladesh",
    cus_phone: phone,
    cus_fax: phone,
    ship_name: "Customer Name",
    ship_add1: address,
    ship_add2: city,
    ship_city: city,
    ship_state: city,
    ship_postcode: postcode,
    ship_country: "Bangladesh",
    multi_card_name: "mastercard",
    value_a: "ref001_A",
    value_b: "ref002_B",
    value_c: "ref003_C",
    value_d: "ref004_D",
  };
  const sslcommer = new SslCommerzPayment(
    process.env.STORE_ID,
    process.env.STORE_PASS,
    false
  );

  sslcommer
    .init(data)
    .then(async (apiResponse) => {
      const order = new Order({
        data,
        products,
        paymentStatus: "Pending",
        transaction_Id,
      });

      try {
        await order.save();

        res
          .status(200)
          .json({ success: true, data: apiResponse.GatewayPageURL });
      } catch (error) {
        res.status(400).json({
          status: false,
          error: error.message,
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        status: false,
        error: err,
      })
    );

  router.post(`/payment/success/:transaction_Id`, async (req, res) => {
    try {
      await Order.updateOne(
        {
          transaction_Id: req.params.transaction_Id,
        },
        {
          $set: {
            status: "Paid",
          },
        }
      );
      res.redirect(
        `${process.env.StoreRoute}/payment/success/${transaction_Id}`
      );
    } catch (error) {
      res.status(500).json({ success: false, error: error });
    }
  });

  router.post("/payment/fail/:transaction_Id", async (req, res) => {
    try {
      await Order.deleteOne(req.params.transaction_Id);
      res.redirect(`${process.env.StoreRoute}/payment/fail/${transaction_Id}`);
    } catch (error) {
      res.status(500).json({ success: false, error: error });
    }
  });

  router.post("/payment/cancel/:transaction_Id", async (req, res) => {
    try {
      await Cart.updateOne(
        {
          transaction_Id: req.params.transaction_Id,
        },
        {
          $set: {
            status: "Pending",
          },
        }
      );
      res.redirect(
        `${process.env.StoreRoute}/payment/cancel/${transaction_Id}`
      );
    } catch (error) {
      res.status(500).json({ success: false, error: error });
    }
  });
});

module.exports = router;
