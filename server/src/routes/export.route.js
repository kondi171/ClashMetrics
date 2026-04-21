const express = require("express");
const router = express.Router();

const exportController = require("../controllers/export.controller");

router.get("/", (req, res) => {
  res.send("ClashMetrics is working on! 🚀");
});

router.get("/api/shame-list", exportController.exportShameList);
router.get("/api/glory-list/stars", exportController.exportGloryListByStars);
router.get("/api/glory-list/destruction", exportController.exportGloryListByDestruction);

router.get("/api/cwl-list", exportController.exportCwlList);

module.exports = router;