const express = require("express");
const router = express.Router();

const exportController = require("../controllers/export.controller");

router.get("/", (req, res) => {
  res.send("ClashMetrics działa 🚀");
});

router.get("/api/shame-list", exportController.exportShameList);
router.get("/api/glory-list/stars", exportController.exportGloryListByStars);
router.get("/api/glory-list/destruction", exportController.exportGloryListByDestruction);

module.exports = router;