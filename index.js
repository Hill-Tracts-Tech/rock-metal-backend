const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const sliderRoute = require("./routes/slider");
const cors = require("cors");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

const whitelist = ["http://localhost:3000", "https://api.rockmetaltshirt.com"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors());

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome route");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/sliders", sliderRoute);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route Not Found",
  });
  next();
});

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
  }
}

app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
  } else if (err instanceof ValidationError) {
    res.status(400).json({ success: false, error: err.message });
  } else {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
