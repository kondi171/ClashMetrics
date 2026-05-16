const { readWars, getPlayers } = require("../services/cw.service");

const getBaseData = () => {
  const wars = readWars();
  const players = getPlayers(wars);
  return { wars, players };
};

async function gloryList(req, res) {
  try {
    const { wars, players } = getBaseData();
    // Pobieramy mode (attack/defense) oraz sortBy (stars/destruction)
    const {
      mode = "attack",
      sortBy = "stars",
      season,
      startDate,
      endDate,
    } = req.query;

    const MY_CLAN_TAG = "#2PQ292802";
    const MY_CLAN_NAME = "Polska Husaria";

    // --- POMOCNICY ---
    const getSeasonKey = (dateStr) => {
      if (!dateStr) return "Unknown";
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}`;
    };

    const formatSeasonName = (key) => {
      if (!key || key === "Unknown") return "Własny zakres";
      const [year, month] = key.split("-");
      const months = [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ];
      return `${months[parseInt(month) - 1]} ${year}`;
    };

    const toRoman = (num) => {
      const lookup = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
      let roman = "";
      for (let i in lookup) {
        while (num >= lookup[i]) {
          roman += i;
          num -= lookup[i];
        }
      }
      return roman;
    };

    // --- FILTROWANIE SEZONÓW ---
    const availableSeasons = [
      ...new Set(wars.map((w) => getSeasonKey(w.startTime))),
    ]
      .filter((s) => s !== "Unknown")
      .sort((a, b) => b.localeCompare(a));

    let filteredWars = [];
    let displaySeasonName = "";

    if (startDate && endDate) {
      const start = startDate.replace(/-/g, "");
      const end = endDate.replace(/-/g, "");
      filteredWars = wars.filter((w) => {
        const warDate = w.startTime.substring(0, 8);
        return warDate >= start && warDate <= end;
      });
      displaySeasonName = `Zakres: ${startDate} - ${endDate}`;
    } else {
      const activeSeason = season || availableSeasons[0];
      filteredWars = wars.filter(
        (w) => getSeasonKey(w.startTime) === activeSeason,
      );
      displaySeasonName = formatSeasonName(activeSeason);
    }

    // --- MAPOWANIE DANYCH ---
    const playersData = players.map((player) => {
      let totalAtkStars = 0;
      let totalAtkDest = 0;
      let totalDefStars = 0;
      let totalDefDest = 0; // NOWE: Suma destrukcji w obronie
      let warsParticipated = 0;

      const warsHistory = filteredWars.map((war, index) => {
        const member = war.myClan.members.find((m) => m.tag === player.tag);
        const isParticipant = !!member;

        const atkStars = isParticipant
          ? member.attacks?.reduce((sum, a) => sum + (a.stars || 0), 0) || 0
          : null;
        const atkDest = isParticipant
          ? member.attacks?.reduce(
              (sum, a) => sum + (a.destructionPercentage || 0),
              0,
            ) || 0
          : null;

        // Dane defensywne z pliku JSON
        const defStars = isParticipant
          ? member.bestOpponentAttack?.stars || 0
          : null;
        const defDest = isParticipant
          ? member.bestOpponentAttack?.destructionPercentage || 0
          : null;

        if (isParticipant) {
          totalAtkStars += atkStars;
          totalAtkDest += atkDest;
          totalDefStars += defStars || 0;
          totalDefDest += defDest || 0;
          warsParticipated++;
        }

        const clean = (t) => t?.replace("#", "");
        const isMyClan =
          war.clan?.name === MY_CLAN_NAME ||
          clean(war.clan?.tag) === clean(MY_CLAN_TAG);
        const opponentName = isMyClan
          ? war.opponent?.name || "Nieznany"
          : war.clan?.name || "Nieznany";

        return {
          warName: opponentName,
          date: `${war.startTime.substring(6, 8)}.${war.startTime.substring(4, 6)}`,
          romanNum: toRoman(index + 1),
          atkStars,
          atkDest,
          defStars,
          defDest, // NOWE: Destrukcja w tej konkretnej wojnie
          isParticipant,
        };
      });

      return {
        name: player.name,
        tag: player.tag,
        totalAtkStars,
        totalAtkDest: parseFloat(totalAtkDest.toFixed(1)),
        totalDefStars,
        totalDefDest: parseFloat(totalDefDest.toFixed(1)), // NOWE: Przekazujemy sumę do frontu

        avgAtkStars:
          warsParticipated > 0
            ? parseFloat((totalAtkStars / warsParticipated).toFixed(2))
            : 0,
        avgAtkDest:
          warsParticipated > 0
            ? parseFloat((totalAtkDest / warsParticipated).toFixed(1))
            : 0,
        avgDefStars:
          warsParticipated > 0
            ? parseFloat((totalDefStars / warsParticipated).toFixed(2))
            : 0,
        avgDefDest:
          warsParticipated > 0
            ? parseFloat((totalDefDest / warsParticipated).toFixed(1))
            : 0, // NOWE: Średnia destrukcja obronna

        maxStars: warsParticipated * 6,
        warsParticipated,
        wars: warsHistory,
      };
    });

    const activePlayers = playersData.filter((p) => p.warsParticipated > 0);

    // --- LOGIKA SORTOWANIA W KONTROLERZE ---
    const playersSorted = activePlayers.sort((a, b) => {
      // 1. TRYB OBRONA (Im mniej punktów rankingowych, tym lepiej)
      if (mode === "defense") {
        // Obliczamy "Wirtualne Gwiazdki" - za każdą opuszczoną wojnę dodajemy np. 3 gwiazdki (max strata)
        // To sprawia, że osoby z małą ilością gier spadają w rankingu
        const penaltyPerMissingWar = 3;
        const maxWarsInPeriod = filteredWars.length;

        const virtualDefStarsA =
          a.totalDefStars +
          (maxWarsInPeriod - a.warsParticipated) * penaltyPerMissingWar;
        const virtualDefStarsB =
          b.totalDefStars +
          (maxWarsInPeriod - b.warsParticipated) * penaltyPerMissingWar;

        if (sortBy === "destruction") {
          // Przy destrukcji w obronie podobnie - za brak udziału liczymy 100% zniszczeń
          const virtualDefDestA =
            a.totalDefDest + (maxWarsInPeriod - a.warsParticipated) * 100;
          const virtualDefDestB =
            b.totalDefDest + (maxWarsInPeriod - b.warsParticipated) * 100;

          if (virtualDefDestA !== virtualDefDestB)
            return virtualDefDestA - virtualDefDestB;
          return virtualDefStarsA - virtualDefStarsB;
        } else {
          // Domyślnie gwiazdki (rankingowa suma straconych gwiazdek)
          if (virtualDefStarsA !== virtualDefStarsB)
            return virtualDefStarsA - virtualDefStarsB;
          return a.avgDefDest - b.avgDefDest;
        }
      }

      // 2. TRYB ATAK (Tutaj suma jest sprawiedliwa - im więcej tym lepiej)
      if (sortBy === "destruction") {
        if (b.totalAtkDest !== a.totalAtkDest)
          return b.totalAtkDest - a.totalAtkDest;
        // Tie-breaker: gwiazdki, a potem ilość gier (doceniamy aktywność)
        if (b.totalAtkStars !== a.totalAtkStars)
          return b.totalAtkStars - a.totalAtkStars;
        return b.warsParticipated - a.warsParticipated;
      } else {
        // Domyślnie gwiazdki
        if (b.totalAtkStars !== a.totalAtkStars)
          return b.totalAtkStars - a.totalAtkStars;
        if (b.totalAtkDest !== a.totalAtkDest)
          return b.totalAtkDest - a.totalAtkDest;
        return b.warsParticipated - a.warsParticipated;
      }
    });

    res.json({
      seasonName: displaySeasonName,
      availableSeasons,
      warsCount: filteredWars.length,
      players: playersSorted,
    });
  } catch (error) {
    console.error("GloryList Error:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
}

module.exports = { gloryList };
