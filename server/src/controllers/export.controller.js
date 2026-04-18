const { readWars, getPlayers } = require("../services/war.service");
const { generateGloryListByStars } = require("../services/stars-report.service");
const { generateGloryListByDestruction } = require("../services/destruction-report.service");
const { generateShameList } = require("../services/missed-report.service");

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

async function exportGloryListByStars(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);

    await generateGloryListByStars(res, wars, players);
  } catch (error) {
    console.error("Glory List By Stars Export Error:", error);
    res.status(500).send("Glory List Export Error");
  }
}

async function exportGloryListByDestruction(req, res) {
  try {
    const wars = readWars();
    const players = getPlayers(wars);

    await generateGloryListByDestruction(res, wars, players);
  } catch (error) {
    console.error("Glory List By Destruction Export Error:", error);
    res.status(500).send("Glory List By Destruction Export Error");
  }
}

module.exports = {
  exportGloryListByStars,
  exportGloryListByDestruction,
  exportShameList,
};