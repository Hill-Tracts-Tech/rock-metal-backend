const Cart = require("../models/Cart");
const { ObjectId } = require("mongodb");
const router = require("express").Router();
const { SslCommerzPayment } = require("sslcommerz");
const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid"); // Import UUID
const mongoose = require("mongoose");

const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
require("dotenv").config();

router.post("/cash-on-delivery", async (req, res) => {
  try {
    const transaction_Id = new mongoose.Types.ObjectId().toString();
    let total_amount, products;

    // For logged-in users, fetch the cart and products
    if (req.body._id) {
      const cart = await Cart.findOne({ user: req.body._id });
      if (!cart) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }
      total_amount = cart.total; // Make sure to use the correct field here (cart.amount or cart.total)
      products = cart.products;
    } else {
      // For guest users, get the product details from the request
      total_amount = req.body.total_amount;
      products = req.body.products;
    }
    console.log(req.body);
    // Destructure user/guest details from the request body
    const { guest, _id, deliveryCharge } = req.body;
    const { name, email, phone, address } = guest;
    // Ensure address is correctly structured for guests (e.g., street, city, postcode)
    const orderData = {
      products,
      paymentStatus: "Pending",
      shippingStatus: "Pending",
      transaction_Id,
      total_amount,
      deliveryCharge,
      shipping_method: "Courier",
      trackingId: uuidv4(), // Generate unique tracking ID using UUID
    };

    // For logged-in users, store user ID in the order
    if (_id) {
      orderData.user = _id;
    } else {
      // For guest users, store guest details in the order
      orderData.guest = { name, email, phone, address };
    }
    console.log(orderData);
    // Create and save the order
    const order = new Order(orderData);
    await order.save();

    // Send response
    res.status(200).json({ success: true, order });
  } catch (error) {
    // Handle any errors that occur
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/payment", async (req, res) => {
  const transaction_Id = new ObjectId().toString();

  const result = await Cart.findOne({
    user: req.body._id,
  });

  const { amount: total_amount, products } = result;
  const { name, email, address, postcode, city, phone, _id } = req.body;
  const data = {
    total_amount: total_amount,
    currency: "BDT",
    product_img: products[0]?.img,
    transaction_Id: transaction_Id,
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
        shippingStatus: "Pending",
        transaction_Id,
        user: _id,
        total_amount,
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
            paymentStatus: "Paid",
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
      await Order.updateOne(
        {
          transaction_Id: req.params.transaction_Id,
        },
        {
          $set: {
            paymentStatus: "Pending",
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

// GET ALL ORDERS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const limit = Number(req.query.limit);
  try {
    let orders;
    if (limit) {
      orders = await Order.find().limit(limit).populate("user");
    } else {
      orders = await Order.find().populate("user");
    }
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

//GET MONTHLY INCOME STATS

router.get("/income-stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear },
          paymentStatus: "Paid",
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          totalAmountPlusDeliveryCharge: {
            $sum: ["$total_amount", "$deliveryCharge"],
          },
        },
      },
      {
        $group: {
          _id: "$month",
          total_amount: { $sum: "$totalAmountPlusDeliveryCharge" },
        },
      },
    ]);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
//GET ORDER DETAILS
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
    }).populate("user");

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

//GET USER ORDERS
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).populate("user");
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

//GET USER ORDERS
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Order.findOneAndDelete({
      transaction_Id: req.params.id,
    });
    res
      .status(200)
      .json({ success: true, message: "Order Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// UPDATE SHIPPING STATUS
router.put("/shipping/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          shippingStatus: req.body.shippingStatus,
        },
      }
    );
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

// UPDATE PAYMENT STATUS
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          paymentStatus: req.body.paymentStatus,
        },
      }
    );
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

module.exports = router;
