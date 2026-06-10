const fs = require("fs");
const path = require("path");

// Ścieżka do całego folderu z plikami CWL (zamiast do jednego pliku)
const CWL_DIR_PATH = path.join(__dirname, "../", "database", "cwl");
const MY_CLAN_TAG = `#${process.env.CLAN_TAG}` || "#2YRL8C2Q2";

/**
 * Funkcja skanująca folder i zwracająca listę dostępnych plików CWL wraz z ich sezonami
 */
function getAvailableCwlFiles() {
  try {
    if (!fs.existsSync(CWL_DIR_PATH)) return [];

    const files = fs.readdirSync(CWL_DIR_PATH);

    // Szukamy plików spełniających warunek: zaczynają się od "cwl" i kończą na ".json"
    const cwlFiles = files.filter(
      (file) => file.startsWith("cwl") && file.endsWith(".json"),
    );

    return cwlFiles.map((file) => {
      const filePath = path.join(CWL_DIR_PATH, file);
      let seasonName = file.replace(".json", "").toUpperCase(); // Domyślnie np. "CWL1"

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (content.season) {
          seasonName = content.season; // Jeśli w pliku jest pole season, bierzemy je (np. "2025-07")
        }
      } catch (e) {
        console.error(`Błąd odczytu sezonu z pliku ${file}:`, e);
      }

      return {
        fileId: file.replace(".json", ""), // np. "cwl1", "cwl10"
        season: seasonName, // np. "2025-07"
      };
    });
  } catch (err) {
    console.error("CWL SERVICE LIST FILES ERROR:", err);
    return [];
  }
}

/**
 * Główna funkcja czytająca dane konkretnego pliku CWL
 * @param {string} fileId - identyfikator pliku, np. "cwl1", "cwl10", "cwl11"
 */
function readCwlData(fileId = "cwl1") {
  // Ustawiamy domyślnie cwl1, jeśli folder nie ma czystego "cwl"
  try {
    // Dynamiczne budowanie ścieżki na podstawie przesłanego fileId
    const fileName = `${fileId}.json`;
    const filePath = path.join(CWL_DIR_PATH, fileName);

    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const myClanInfo = data.clans.find((c) => c.tag === MY_CLAN_TAG);
    const players = myClanInfo ? myClanInfo.members : [];

    // 1. Mapujemy WSZYSTKIE bitwy ze wszystkich rund, by móc policzyć ranking całej grupy
    const allRoundsWars = data.rounds.map((round) => {
      if (
        !round.warTags ||
        round.warTags.length === 0 ||
        round.warTags[0] === "#0"
      )
        return [];
      return round.warTags.map((war) => {
        let winnerTag = null;
        if (war.clan.stars > war.opponent.stars) winnerTag = war.clan.tag;
        else if (war.opponent.stars > war.clan.stars)
          winnerTag = war.opponent.tag;
        else if (
          war.clan.destructionPercentage > war.opponent.destructionPercentage
        )
          winnerTag = war.clan.tag;
        else winnerTag = war.opponent.tag;

        return {
          clan: war.clan,
          opponent: war.opponent,
          winnerTag: winnerTag,
          startTime: war.startTime,
        };
      });
    });

    // 2. Wyciągamy tylko nasze wojny do głównej tabeli graczy
    const wars = allRoundsWars
      .map((roundWars, index) => {
        const myWar = roundWars.find(
          (w) => w.clan.tag === MY_CLAN_TAG || w.opponent.tag === MY_CLAN_TAG,
        );
        if (!myWar) return null;

        const isUsClan = myWar.clan.tag === MY_CLAN_TAG;
        return {
          number: index + 1,
          startTime: myWar.startTime,
          myClan: isUsClan ? myWar.clan : myWar.opponent,
          enemyClan: isUsClan ? myWar.opponent : myWar.clan,
          result: myWar.winnerTag === MY_CLAN_TAG ? "win" : "loss",
        };
      })
      .filter((w) => w !== null);

    const getPlayerWarStats = (war, playerTag) => {
      const member = war.myClan.members.find((m) => m.tag === playerTag);
      let attack = { stars: 0, destr: 0, done: 0 };
      let defense = { stars: 0, destr: 0 };
      let isParticipating = false;

      if (member) {
        isParticipating = true;
        if (member.attacks && member.attacks.length > 0) {
          attack.stars = member.attacks[0].stars;
          attack.destr = member.attacks[0].destructionPercentage;
          attack.done = 1;
        }
        const enemyAttacker = war.enemyClan.members.find(
          (em) =>
            em.attacks && em.attacks.some((a) => a.defenderTag === playerTag),
        );
        if (enemyAttacker) {
          const attackOnUs = enemyAttacker.attacks.find(
            (a) => a.defenderTag === playerTag,
          );
          defense.stars = attackOnUs.stars;
          defense.destr = attackOnUs.destructionPercentage;
        }
      }
      return { attack, defense, isParticipating };
    };

    const sortedPlayers = players
      .map((p) => {
        let totalA_S = 0,
          totalA_D = 0,
          totalD_S = 0,
          totalD_D = 0,
          attacksDone = 0,
          possibleAttacks = 0;
        wars.forEach((w) => {
          const s = getPlayerWarStats(w, p.tag);
          if (s.isParticipating) {
            possibleAttacks++;
            attacksDone += s.attack.done;
            totalA_S += s.attack.stars;
            totalA_D += s.attack.destr;
            totalD_S += s.defense.stars;
            totalD_D += s.defense.destr;
          }
        });
        return {
          ...p,
          totalA_S,
          totalA_D,
          totalD_S,
          totalD_D,
          attacksDone,
          possibleAttacks,
          avgDestr: attacksDone > 0 ? (totalA_D / attacksDone).toFixed(1) : 0,
        };
      })
      .sort((a, b) => b.totalA_S - a.totalA_S || b.totalA_D - a.totalA_D);

    return {
      season: data.season,
      wars,
      players: sortedPlayers,
      clans: data.clans,
      allRoundsWars,
    };
  } catch (err) {
    console.error("CWL SERVICE ERROR:", err);
    return null;
  }
}

// Pamiętaj o wyeksportowaniu OBU funkcji!
module.exports = {
  readCwlData,
  getAvailableCwlFiles,
};
