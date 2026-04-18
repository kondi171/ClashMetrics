const express = require("express");
const router = express.Router();

const exportController = require("../controllers/export.controller");

// Główny sprawdzacz statusu
router.get("/", (req, res) => {
  res.send("ClashMetrics działa 🚀");
});

// Raport 1: Ranking Gwiazdek
// Wywołanie: GET /api/glory-list/stars
router.get("/api/glory-list/stars", exportController.exportStars);

// Raport 2: Ranking Procentowy (Skuteczność)
// Wywołanie: GET /api/glory-list/destruction
router.get("/api/glory-list/destruction", exportController.exportDestruction);

module.exports = router;