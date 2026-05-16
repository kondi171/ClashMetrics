const { generateClanMembersList } = require("../reports/clan-report");

async function exportClanMembersList(req, res) {
  try {
    const clanData = readClanMembersData();
    if (!clanData) {
      return res.status(404).send("Clan Data Not Found");
    }
    await generateClanMembersList(res, clanData);
  } catch (error) {
    console.error("Clan Members Export Error:", error);
    res.status(500).send("Clan Members Export Error");
  }
}

module.exports = {
  exportClanMembersList,
};
