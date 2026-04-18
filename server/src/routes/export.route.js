const express = require("express");
const router = express.Router();

const exportController = require("../controllers/export.controller");

router.get("/", (req, res) => {
  res.send("ClashMetrics działa 🚀");
});

router.get("/export-season", exportController.exportSeason);

module.exports = router;