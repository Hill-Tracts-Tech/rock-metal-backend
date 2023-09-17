const Slider = require("../models/Slider");
const { verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newSlider = new Slider(req.body);

  try {
    const savedSlider = await newSlider.save();
    res.status(200).json({ success: true, data: savedSlider });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Get Specific Product
router.get("/find/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    res.status(200).json({ success: true, data: slider });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
//GET ALL Slider
router.get("/", async (req, res) => {
  try {
    const slider = await Slider.find();
    res.status(200).json({ success: true, data: slider });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
// Delete Slider
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Slider deleted Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updateSlider = await Slider.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({ success: true, data: updateSlider });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
