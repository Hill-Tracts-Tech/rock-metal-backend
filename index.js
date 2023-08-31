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
const cors = require("cors");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route Not Found",
  });
  next();
});

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
