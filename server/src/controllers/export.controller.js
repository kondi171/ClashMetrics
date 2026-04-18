const { readWars, getPlayers } = require("../services/war.service");
const { generateSeasonExcel } = require("../services/excel.service");

async function exportSeason(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);

    await generateSeasonExcel(res, wars, players);
  } catch (error) {
    console.error(error);
    res.status(500).send("Błąd eksportu");
  }
}

module.exports = {
  exportSeason,
};