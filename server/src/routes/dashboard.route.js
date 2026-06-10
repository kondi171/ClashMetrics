const express = require("express");
const router = express.Router();

const { gloryList } = require("../controllers/glory.controller");
// const { shameList } = require("../controllers/shame.controller");
const { cwlList } = require("../controllers/cwl.controller");
// const { clanMembersList } = require("../controllers/clan.controller");

router.get("/", (req, res) => {
  res.send("ClashMetrics is working on! 🚀");
});

// router.get("/shame", shameList);
router.get("/glory", gloryList);
router.get("/cwl", cwlList);
// router.get("/clan", clanMembersList);

module.exports = router;
