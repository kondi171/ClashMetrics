const fs = require("fs");
const path = require("path");

const WARS_DIR = path.join(__dirname, "../", "database", "cw");
// const CLAN_TAG = `#${process.env.CLAN_TAG}` || "#2YRL8C2Q2";
const CLAN_TAG = "#2YRL8C2Q2";

function readWars() {
  const files = fs
    .readdirSync(WARS_DIR)
    .filter((file) => file.endsWith(".json"));
  console.log(`clantag: ${CLAN_TAG}`);
  console.log(WARS_DIR);
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
    a.name.localeCompare(b.name, "pl"),
  );
}

function getStats(war, playerTag) {
  const member = war.myClan.members.find((m) => m.tag === playerTag);

  if (!member) {
    return { attack: 0, atkDest: 0, defense: 0, defDest: 0 };
  }

  // ATK: Gwiazdki i % zniszczeń (suma z obu ataków)
  const attack =
    member.attacks?.reduce((sum, atk) => sum + (atk.stars || 0), 0) || 0;
  const atkDest =
    member.attacks?.reduce(
      (sum, atk) => sum + (atk.destructionPercentage || 0),
      0,
    ) || 0;

  // DEF: Gwiazdki i % zniszczeń z najlepszej obrony
  const defense = member.bestOpponentAttack?.stars || 0;
  const defDest = member.bestOpponentAttack?.destructionPercentage || 0;

  return { attack, atkDest, defense, defDest };
}

module.exports = {
  readWars,
  getPlayers,
  getStats,
};
