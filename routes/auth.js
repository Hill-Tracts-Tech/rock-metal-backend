const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res
        .status(409)
        .json({ success: false, error: "This email is already taken" });
    }

    if (req.body?.password?.length < 6) {
      return res.status(403).json({
        success: false,
        error: "Password length have to be at least 6",
      });
    }

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.userNumber,
      isAdmin: req.body?.isAdmin ? req.body?.isAdmin : false,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
    });

    const savedUser = await newUser.save();

    const accessToken = jwt.sign(
      {
        id: savedUser._id,
        isAdmin: savedUser?.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...userInfo } = savedUser._doc;

    res.status(201).json({ success: true, data: { ...userInfo, accessToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Email or Password is incorrect" });
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res
        .status(401)
        .json({ success: false, error: "Email or Password is incorrect" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user?.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...userInfo } = user._doc;

    res.status(200).json({ success: true, data: { ...userInfo, accessToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
