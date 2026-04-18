const { readWars, getPlayers } = require("../services/war.service");
const { generateGloryListByStars } = require("../services/stars-report.service");
const { generateGloryListByDestruction } = require("../services/destruction-report.service");

// Raport 1: Gwiazdki (tradycyjny)
async function exportStars(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);

    await generateGloryListByStars(res, wars, players);
  } catch (error) {
    console.error("Błąd eksportu gwiazdek:", error);
    res.status(500).send("Błąd eksportu raportu gwiazdek");
  }
}

// Raport 2: Procenty (skuteczność)
async function exportDestruction(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);

    await generateGloryListByDestruction(res, wars, players);
  } catch (error) {
    console.error("Błąd eksportu procentów:", error);
    res.status(500).send("Błąd eksportu raportu zniszczeń");
  }
}

module.exports = {
  exportStars,
  exportDestruction,
};