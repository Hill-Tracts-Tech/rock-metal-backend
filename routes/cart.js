const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE or UPDATE
router.post("/", verifyToken, async (req, res) => {
  const { user, products, amount } = req.body;

  try {
    // Check if cart already exists for the user
    let existingCart = await Cart.findOne({ user: user });

    if (existingCart) {
      // If cart exists, update the products
      existingCart.products = products;
      existingCart.amount = amount;
      await existingCart.save();
      res.status(200).json({ success: true, data: existingCart });
    } else {
      // If cart doesn't exist, create a new one
      const newCart = new Cart({ user: user, products, amount });
      const savedCart = await newCart.save();
      res.status(200).json({ success: true, data: savedCart });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER CartS
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const Carts = await Cart.find({ userId: req.params.userId }).populate(
      "user"
    );
    res.status(200).json({ success: true, data: Carts });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Carts = await Cart.find();
    res.status(200).json({ success: true, data: Carts });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Cart.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
