const mongoose = require("mongoose");
const SliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
      required: true,
    },
    bg: {
      type: String,
    },
    cat: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", SliderSchema);
