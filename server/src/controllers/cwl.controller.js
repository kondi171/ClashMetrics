const {
  readCwlData,
  getAvailableCwlFiles,
} = require("../services/cwl.service");

// Funkcja pomocnicza zamieniająca tekstowy sezon na wartość porównywalną YYYYMM
// Funkcja pomocnicza zamieniająca sezon na wartość porównywalną YYYYMM
function parseSeasonToValue(seasonStr) {
  if (!seasonStr) return 0;

  // 1. Obsługa formatu YYYY-MM (np. "2025-07")
  if (seasonStr.includes("-")) {
    const parts = seasonStr.split("-");
    if (parts.length === 2) {
      const yearNum = parts[0].trim();
      const monthNum = parts[1].trim();
      // Upewniamy się, że to liczby i zwracamy spójny format YYYYMM
      if (!isNaN(yearNum) && !isNaN(monthNum)) {
        return parseInt(`${yearNum}${monthNum.padStart(2, "0")}`, 10);
      }
    }
  }

  // 2. Obsługa alternatywnego formatu tekstowego (np. "Lipiec 2025")
  const months = {
    styczeń: "01",
    luty: "02",
    marzec: "03",
    kwiecień: "04",
    maj: "05",
    czerwiec: "06",
    lipiec: "07",
    sierpień: "08",
    wrzesień: "09",
    październik: "10",
    listopad: "11",
    grudzień: "12",
  };

  const parts = seasonStr.toLowerCase().trim().split(/\s+/);
  if (parts.length < 2) return 0;

  const monthNum = months[parts[0]] || "01";
  const yearNum = parts[1];
  return parseInt(`${yearNum}${monthNum}`, 10);
}

async function cwlList(req, res) {
  try {
    const availableFiles = getAvailableCwlFiles();
    let { fileId, filterMode = "season", startSeason, endSeason } = req.query;

    let cwlData = null;

    // --- OBSŁUGA FILTROWANIA PO ZAKRESIE PEŁNYCH MIESIĘCY/SEZONÓW ---
    if (filterMode === "range" && startSeason && endSeason) {
      const startFile = availableFiles.find((f) => f.fileId === startSeason);
      const endFile = availableFiles.find((f) => f.fileId === endSeason);

      const startVal = parseSeasonToValue(startFile?.season);
      const endVal = parseSeasonToValue(endFile?.season);

      const minVal = Math.min(startVal, endVal);
      const maxVal = Math.max(startVal, endVal);

      const filesInRange = availableFiles.filter((f) => {
        const val = parseSeasonToValue(f.season);
        return val >= minVal && val <= maxVal;
      });

      if (filesInRange.length === 0) {
        return res
          .status(404)
          .json({ error: "Brak danych dla wybranego zakresu turniejów." });
      }

      let combinedWars = [];
      let combinedPlayersMap = new Map();

      // Agregujemy sezony i wstrzykujemy metadane rundy
      filesInRange.forEach((f) => {
        const data = readCwlData(f.fileId);
        if (!data) return;

        // Mapujemy wojny z zachowaniem resetu rundy (idx + 1), obliczeniem wyniku oraz zapisaniem składu
        const processedWars = data.wars.map((war, idx) => {
          const myStars = war.myClan.stars || 0;
          const enemyStars = war.enemyClan.stars || 0;
          const myDest = war.myClan.destructionPercentage || 0;
          const enemyDest = war.enemyClan.destructionPercentage || 0;

          let outcome = "draw";
          if (myStars > enemyStars) outcome = "win";
          else if (enemyStars > myStars) outcome = "loss";
          else {
            if (myDest > enemyDest) outcome = "win";
            else if (enemyDest > myDest) outcome = "loss";
          }

          return {
            ...war,
            seasonLabel: data.season,
            roundNum: idx + 1,
            outcome,
            seasonRosterTags: data.players.map((p) => p.tag), // Zapamiętujemy roster z tego konkretnego pliku
          };
        });

        combinedWars.push(...processedWars);

        data.players.forEach((p) => {
          if (!combinedPlayersMap.has(p.tag)) {
            combinedPlayersMap.set(p.tag, {
              tag: p.tag,
              name: p.name,
              totalA_S: 0,
              totalA_D: 0,
              totalD_S: 0,
              totalD_D: 0,
              attacksDone: 0,
              possibleAttacks: 0,
            });
          }
          const current = combinedPlayersMap.get(p.tag);
          current.totalA_S += p.totalA_S || 0;
          current.totalA_D += parseFloat(p.totalA_D || 0);
          current.totalD_S += p.totalD_S || 0;
          current.totalD_D += parseFloat(p.totalD_D || 0);
          current.attacksDone += p.attacksDone || 0;
          current.possibleAttacks += p.possibleAttacks || 0;
        });
      });

      const sortedRangeFiles = [...filesInRange].sort(
        (a, b) => parseSeasonToValue(a.season) - parseSeasonToValue(b.season),
      );

      cwlData = {
        season: `${sortedRangeFiles[0].season} - ${sortedRangeFiles[sortedRangeFiles.length - 1].season}`,
        wars: combinedWars,
        players: Array.from(combinedPlayersMap.values()).filter(
          (p) => p.possibleAttacks > 0,
        ),
      };
    } else {
      // --- DOTYCHCZASOWY TRYB SEZONOWY ---
      if (!fileId || fileId === "cwl") {
        const cwlExists = availableFiles.some((f) => f.fileId === "cwl");
        if (!cwlExists && availableFiles.length > 0) {
          fileId = availableFiles[0].fileId;
        } else if (!cwlExists && availableFiles.length === 0) {
          return res
            .status(404)
            .json({ error: "Folder z plikami CWL jest pompka (pusty)." });
        } else {
          fileId = "cwl";
        }
      }
      cwlData = readCwlData(fileId);

      // Dla pojedynczego sezonu również wstrzykujemy metadane rundy, wyniki i roster
      if (cwlData && cwlData.wars) {
        cwlData.wars = cwlData.wars.map((war, idx) => {
          const myStars = war.myClan.stars || 0;
          const enemyStars = war.enemyClan.stars || 0;
          const myDest = war.myClan.destructionPercentage || 0;
          const enemyDest = war.enemyClan.destructionPercentage || 0;

          let outcome = "draw";
          if (myStars > enemyStars) outcome = "win";
          else if (enemyStars > myStars) outcome = "loss";
          else {
            if (myDest > enemyDest) outcome = "win";
            else if (enemyDest > myDest) outcome = "loss";
          }

          return {
            ...war,
            seasonLabel: cwlData.season,
            roundNum: idx + 1,
            outcome,
            seasonRosterTags: cwlData.players.map((p) => p.tag), // Zapamiętujemy roster
          };
        });
      }
    }

    if (!cwlData) {
      return res.status(404).json({
        error: `Brak danych CWL`,
        availableSeasons: availableFiles,
      });
    }

    // Mapujemy dane graczy do formatu macierzowego
    const formattedPlayers = cwlData.players.map((player) => {
      const playerWarsHistory = cwlData.wars.map((war) => {
        const memberData = war.myClan.members.find((m) => m.tag === player.tag);
        const isParticipant = !!memberData;
        const attack = memberData?.attacks?.[0];

        const enemyAttacker = war.enemyClan.members.find(
          (em) =>
            em.attacks && em.attacks.some((a) => a.defenderTag === player.tag),
        );
        const defense = enemyAttacker?.attacks.find(
          (a) => a.defenderTag === player.tag,
        );

        // Gracz jest na ławce, jeśli nie walczył, ale był w rosterze zgłoszonym na dany turniej/plik
        const isBenched =
          !isParticipant && war.seasonRosterTags?.includes(player.tag);

        return {
          warName: `Runda ${war.roundNum}`,
          seasonLabel: war.seasonLabel,
          opponentName: war.enemyClan.name,
          outcome: war.outcome,
          isParticipant: isParticipant,
          isBenched: isBenched, // Przekazujemy nową flagę do frontendu
          atkStars: attack ? attack.stars : 0,
          atkDest: attack ? attack.destructionPercentage : 0,
          defStars: defense ? defense.stars : 0,
          defDest: defense ? defense.destructionPercentage : 0,
        };
      });

      return {
        name: player.name,
        tag: player.tag,
        totalAtkStars:
          player.totalAtkStars !== undefined
            ? player.totalAtkStars
            : player.totalA_S,
        totalAtkDest: parseFloat(
          player.totalAtkDest !== undefined
            ? player.totalAtkDest
            : player.totalA_D,
        ),
        avgAtkStars:
          player.attacksDone > 0
            ? (
                (player.totalAtkStars !== undefined
                  ? player.totalAtkStars
                  : player.totalA_S) / player.attacksDone
              ).toFixed(2)
            : "0.00",
        avgAtkDest:
          player.attacksDone > 0
            ? parseFloat(
                (
                  (player.totalAtkDest !== undefined
                    ? player.totalAtkDest
                    : player.totalA_D) / player.attacksDone
                ).toFixed(1),
              )
            : 0.0,
        totalDefStars:
          player.totalDefStars !== undefined
            ? player.totalDefStars
            : player.totalD_S,
        totalDefDest: parseFloat(
          player.totalDefDest !== undefined
            ? player.totalDefDest
            : player.totalD_D,
        ),
        avgDefStars:
          player.possibleAttacks > 0
            ? (
                (player.totalDefStars !== undefined
                  ? player.totalDefStars
                  : player.totalD_S) / player.possibleAttacks
              ).toFixed(2)
            : "0.00",
        avgDefDest:
          player.possibleAttacks > 0
            ? (
                (player.totalDefDest !== undefined
                  ? player.totalDefDest
                  : player.totalD_D) / player.possibleAttacks
              ).toFixed(1)
            : "0.0",

        attacksDone: player.attacksDone,
        possibleAttacks: player.possibleAttacks,
        wars: playerWarsHistory,
      };
    });
    // LICZNIKI KADRY (W Boju / Na Ławce / Szeroka Kadra)
    let inBattle = 0;
    let onBench = 0;

    formattedPlayers.forEach((p) => {
      // Jeśli gracz miał chociaż jedną szansę na atak/obronę
      if (p.possibleAttacks > 0) {
        inBattle++;
      } else {
        onBench++;
      }
    });
    const totalRoster = formattedPlayers.length;

    // Liczniki wyników wojen (dotychczasowy kod)
    let wins = 0;
    let draws = 0;
    let losses = 0;
    cwlData.wars.forEach((war) => {
      if (war.outcome === "win") wins++;
      else if (war.outcome === "loss") losses++;
      else draws++;
    });

    // Zwracamy wzbogacony obiekt JSON
    res.json({
      season: cwlData.season,
      currentFileId: fileId,
      warsCount: cwlData.wars.length,
      availableSeasons: availableFiles,
      players: formattedPlayers,
      warStats: { wins, draws, losses },
      rosterStats: { inBattle, onBench, totalRoster }, // <-- NOWOŚĆ
    });
  } catch (error) {
    console.error("CWL Controller Error:", error);
    res.status(500).json({ error: "Błąd serwera przy pobieraniu danych CWL." });
  }
}

module.exports = {
  cwlList,
};
