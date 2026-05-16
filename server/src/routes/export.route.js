const express = require("express");
const router = express.Router();

const exportShameList =
  require("../controllers/shame.controller").exportShameList;
const exportCwlList = require("../controllers/cwl.controller").exportCwlList;
const exportClanMembersList =
  require("../controllers/clan.controller").exportClanMembersList;
const gloryExportController = require("../controllers/glory.controller");

const { exportGloryListByStars, exportGloryListByDestruction } =
  gloryExportController;

router.get("/", (req, res) => {
  res.send("ClashMetrics is working on! 🚀");
});

router.get("/api/shame/export", exportShameList);

router.get("/api/glory/stars/export", exportGloryListByStars);
router.get("/api/glory/destruction/export", exportGloryListByDestruction);

router.get("/api/cwl/export", exportCwlList);

router.get("/api/clan/export", exportClanMembersList);

module.exports = router;
