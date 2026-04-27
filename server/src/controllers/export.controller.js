const { readWars, getPlayers } = require("../services/cw.service");
const { readCwlData } = require("../services/cwl.service");
const { readClanMembersData } = require("../services/clan.service"); // Import serwisu klanu
const { generateGloryListByStars } = require("../reports/stars-report");
const { generateGloryListByDestruction } = require("../reports/destruction-report");
const { generateShameList } = require("../reports/missed-report");
const { generateCwlList } = require("../reports/cwl-report");
const { generateClanMembersList } = require("../reports/clan-report");

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

async function exportCwlList(req, res) {
  try {
    const cwlData = readCwlData();
    if (!cwlData) {
      return res.status(404).send("CWL Data Not Found");
    }
    await generateCwlList(res, cwlData);
  } catch (error) {
    console.error("CWL Report Export Error:", error);
    res.status(500).send("CWL Report Export Error");
  }
}

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
  exportGloryListByStars,
  exportGloryListByDestruction,
  exportShameList,
  exportCwlList,
  exportClanMembersList,
};