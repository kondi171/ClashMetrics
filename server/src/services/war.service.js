const fs = require("fs");
const path = require("path");

const WARS_DIR = path.join(__dirname, "../..", "data", "wars");
const CLAN_TAG = "#2YRL8C2Q2";

function readWars() {
  const files = fs
    .readdirSync(WARS_DIR)
    .filter((file) => file.endsWith(".json"));

  const wars = [];

  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(WARS_DIR, file), "utf8");
    const war = JSON.parse(raw);

    if (war.clan?.tag === CLAN_TAG) {
      wars.push({
        ...war,
        myClan: war.clan,
        enemyClan: war.opponent,
      });
    } else if (war.opponent?.tag === CLAN_TAG) {
      wars.push({
        ...war,
        myClan: war.opponent,
        enemyClan: war.clan,
      });
    }
  });

  return wars.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function getPlayers(wars) {
  const map = new Map();

  wars.forEach((war) => {
    war.myClan.members.forEach((member) => {
      if (!map.has(member.tag)) {
        map.set(member.tag, {
          tag: member.tag,
          name: member.name,
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pl")
  );
}

function getStats(war, playerTag) {
  const member = war.myClan.members.find((m) => m.tag === playerTag);

  if (!member) {
    return { attack: 0, defense: 0 };
  }

  const attack =
    member.attacks?.reduce((sum, atk) => sum + atk.stars, 0) || 0;

  const defense = member.bestOpponentAttack?.stars || 0;

  return { attack, defense };
}

module.exports = {
  readWars,
  getPlayers,
  getStats,
};