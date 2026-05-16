const { generateShameList } = require("../reports/shame-report");

async function exportShameList(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);
    await generateShameList(res, wars, players);
  } catch (error) {
    console.error(error);
    res.status(500).send("Shame List Export Error");
  }
}

module.exports = {
  exportShameList,
};
