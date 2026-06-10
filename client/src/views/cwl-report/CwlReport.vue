<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import CwlAttackReport from "./CwlAttackReport.vue";
import CwlDefenseReport from "./CwlDefenseReport.vue";
import InfoModal from "@/components/InfoModal.vue";
import Footer from "@/components/Footer.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import FloatingActionPanel from "@/components/FloatingActionPanel.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import CwlDetailModals from "./CwlDetailModals.vue";
import CwlQuickStats from "./CwlQuickStats.vue";
import CwlControlPanel from "./CwlControlPanel.vue";

// Stan danych
const players = ref([]);
const warsCount = ref(0);
const seasonName = ref("");
const availableSeasons = ref([]);
const selectedSeason = ref("");
const isLoading = ref(true);
const errorMessage = ref("");
const warStats = ref({ wins: 0, draws: 0, losses: 0 });

const filterMode = ref("season"); // 'season' lub 'range'

const startSeason = ref("");
const endSeason = ref("");

const isModalOpen = ref(false);

// Kontrola panelu sterowania
const reportMode = ref("attack"); // attack / defense
const subSortMode = ref("stars"); // stars / destruction
// --- STAN DLA MODALI SZCZEGÓŁÓW (LINIA 1) ---
const activeDetailModal = ref(null); // 'wars' | 'roster' | 'played' | 'attendance' | 'destruction' | null
// Statystyki kadry
// Rozbudowane statystyki kadry dostosowane do trybu wyświetlania
const rosterStats = computed(() => {
  const totalRoster = players.value.length;
  if (totalRoster === 0)
    return {
      inBattle: 0,
      onBench: 0,
      totalRoster: 0,
      ironRoster: 0,
      benchedAtLeastOnce: 0,
    };

  // Klasyczne statystyki dla pojedynczego sezonu
  const inBattle = players.value.filter(
    (p) => (p.possibleAttacks || 0) > 0,
  ).length;
  const onBench = players.value.filter(
    (p) => (p.possibleAttacks || 0) === 0,
  ).length;

  // Nowe statystyki pod kątem zakresu (np. 14 lub 21 wojen)
  // Żelazny skład = gracz zaliczył absolutnie wszystkie wojny w wybranym okresie
  const ironRoster = players.value.filter(
    (p) => (p.possibleAttacks || 0) === warsCount.value,
  ).length;
  // Rotowani = gracze, którzy opuścili przynajmniej jedną wojnę w tym okresie (byli na ławce)
  const benchedAtLeastOnce = totalRoster - ironRoster;

  return { inBattle, onBench, totalRoster, ironRoster, benchedAtLeastOnce };
});

// NOWOŚĆ: Obliczanie frekwencji ataków klanu
const attendanceStats = computed(() => {
  let totalPossible = 0;
  let totalDone = 0;

  players.value.forEach((p) => {
    totalPossible += p.possibleAttacks || 0;
    // Bezpieczny fallback: jeśli backend nie posiada pola attacksDone, traktujemy atak jako oddany
    const done =
      p.attacksDone !== undefined ? p.attacksDone : p.possibleAttacks || 0;
    totalDone += done;
  });

  const percentage =
    totalPossible > 0 ? ((totalDone / totalPossible) * 100).toFixed(1) : "0.0";
  return { totalDone, totalPossible, percentage };
});

// NOWOŚĆ: Obliczanie globalnej średniej zniszczeń klanu
const clanAvgDestruction = computed(() => {
  let totalDest = 0;
  let totalAttacks = 0;

  players.value.forEach((p) => {
    totalDest += p.totalAtkDest || 0;
    totalAttacks += p.possibleAttacks || 0;
  });

  return totalAttacks > 0 ? (totalDest / totalAttacks).toFixed(1) : "0.0";
});

const formatSeason = (seasonStr) => {
  if (!seasonStr || typeof seasonStr !== "string") return seasonStr;

  const monthNames = {
    "01": "Styczzeń",
    "02": "Luty",
    "03": "Marzec",
    "04": "Kwiecień",
    "05": "Maj",
    "06": "Czerwiec",
    "07": "Lipiec",
    "08": "Sierpień",
    "09": "Wrzesień",
    10: "Październik",
    11: "Listopad",
    12: "Grudzień",
  };

  // Pomocnicza funkcja wewnętrzna do formatowania pojedynczego członu "YYYY-MM"
  const parseSingle = (str) => {
    const trimmed = str.trim();
    const parts = trimmed.split("-");
    if (parts.length !== 2) return trimmed;

    const [year, month] = parts;
    return `${monthNames[month] || month} ${year}`;
  };

  // Wykrywanie separatorów zakresu (obsługuje zwykły myślnik, spacje oraz długą pauzę)
  if (
    seasonStr.includes(" - ") ||
    seasonStr.includes(" — ") ||
    seasonStr.includes("—")
  ) {
    const separator = seasonStr.includes(" - ")
      ? " - "
      : seasonStr.includes(" — ")
        ? " — "
        : "—";
    const rangeParts = seasonStr.split(separator);

    if (rangeParts.length === 2) {
      return `${parseSingle(rangeParts[0])} - ${parseSingle(rangeParts[1])}`;
    }
  }

  // Jeśli to nie zakres, formatuj jako pojedynczy miesiąc
  return parseSingle(seasonStr);
};
const fetchData = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const apiUrl = import.meta.env.VITE_API_URL;

    const params = {
      filterMode: filterMode.value,
      fileId: filterMode.value === "season" ? selectedSeason.value : undefined,
      startSeason: filterMode.value === "range" ? startSeason.value : undefined,
      endSeason: filterMode.value === "range" ? endSeason.value : undefined,
    };

    const response = await axios.get(`${apiUrl}/cwl`, { params });

    const seasons = response.data.availableSeasons || [];
    availableSeasons.value = seasons.sort((a, b) =>
      b.season.localeCompare(a.season),
    );

    if (availableSeasons.value.length > 0) {
      if (!startSeason.value) {
        startSeason.value =
          availableSeasons.value[availableSeasons.value.length - 1].fileId;
      }
      if (!endSeason.value) {
        endSeason.value = availableSeasons.value[0].fileId;
      }
    }

    if (
      filterMode.value === "season" &&
      !selectedSeason.value &&
      availableSeasons.value.length > 0
    ) {
      const newestSeasonId = availableSeasons.value[0].fileId;
      if (response.data.currentFileId !== newestSeasonId) {
        selectedSeason.value = newestSeasonId;
        return;
      }
    }

    const totalWars = response.data.warsCount || 0;
    const rawPlayers = response.data.players || [];

    players.value = rawPlayers.map((p) => {
      const part = p.possibleAttacks || 0;
      const missing = totalWars - part;
      return {
        ...p,
        totalDefStars: p.totalDefStars + missing * 3,
        totalDefDest: p.totalDefDest + missing * 100,
        avgDefStars:
          totalWars > 0
            ? ((p.totalDefStars + missing * 3) / totalWars).toFixed(2)
            : "0.00",
        avgDefDest:
          totalWars > 0
            ? ((p.totalDefDest + missing * 100) / totalWars).toFixed(1)
            : "0.0",
        avgAtkStars: part > 0 ? (p.totalAtkStars / part).toFixed(2) : "0.00",
        avgAtkDest: part > 0 ? (p.totalAtkDest / part).toFixed(1) : "0.0",
      };
    });

    warsCount.value = totalWars;
    seasonName.value = response.data.season || "";
    warStats.value = response.data.warStats || { wins: 0, draws: 0, losses: 0 };

    if (filterMode.value === "season" && response.data.currentFileId) {
      selectedSeason.value = response.data.currentFileId;
    }

    sortPlayers();
  } catch (error) {
    console.error("Błąd pobierania CWL:", error);
    errorMessage.value = "Nie udało się załadować danych ligowych.";
  } finally {
    isLoading.value = false;
  }
};

const sortPlayers = () => {
  if (!players.value.length) return;

  players.value.sort((a, b) => {
    if (reportMode.value === "attack") {
      if (subSortMode.value === "stars") {
        if (b.totalAtkStars !== a.totalAtkStars)
          return b.totalAtkStars - a.totalAtkStars;
        return b.totalAtkDest - a.totalAtkDest;
      } else {
        if (b.totalAtkDest !== a.totalAtkDest)
          return b.totalAtkDest - a.totalAtkDest;
        return b.totalAtkStars - a.totalAtkStars;
      }
    } else {
      if (subSortMode.value === "stars") {
        if (a.totalDefStars !== b.totalDefStars)
          return a.totalDefStars - b.totalDefStars;
        return a.totalDefDest - b.totalDefDest;
      } else {
        if (a.totalDefDest !== b.totalDefDest)
          return a.totalDefDest - b.totalDefDest;
        return a.totalDefStars - b.totalDefStars;
      }
    }
  });

  let currentRank = 1;
  let currentMedalTier = 1;

  for (let i = 0; i < players.value.length; i++) {
    if (i > 0) {
      const prev = players.value[i - 1];
      const curr = players.value[i];

      let isEqual = false;
      if (reportMode.value === "attack") {
        isEqual =
          prev.totalAtkStars === curr.totalAtkStars &&
          prev.totalAtkDest === curr.totalAtkDest;
      } else {
        isEqual =
          prev.totalDefStars === curr.totalDefStars &&
          prev.totalDefDest === curr.totalDefDest;
      }

      if (!isEqual) {
        currentRank = i + 1;
        currentMedalTier++;
      }
    }
    players.value[i].rank = currentRank;
    players.value[i].medalTier = currentMedalTier;
  }
};

const getRankDisplay = (idx) => {
  const player = players.value[idx];
  if (!player || player.medalTier === undefined) return idx + 1;

  if (player.medalTier === 1) return "🥇";
  if (player.medalTier === 2) return "🥈";
  if (player.medalTier === 3) return "🥉";
  return `${player.rank}.`;
};

const getPodiumClass = (idx) => {
  const player = players.value[idx];
  if (!player || player.medalTier === undefined) return "";

  if (player.medalTier === 1) return "podium-gold";
  if (player.medalTier === 2) return "podium-silver";
  if (player.medalTier === 3) return "podium-bronze";
  return "";
};

const leadersDisplay = computed(() => {
  if (!players.value.length) return "Brak danych";
  const topPlayers = players.value.filter((p) => p.rank === 1);
  return topPlayers.map((p) => p.name).join(", ");
});

const leadersLabel = computed(() => {
  if (!players.value.length) return "Lider Klasyfikacji";
  const topCount = players.value.filter((p) => p.rank === 1).length;
  return topCount > 1 ? "Liderzy Klasyfikacji" : "Lider Klasyfikacji";
});

const formatWarValue = (val, suffix = "") => {
  if (val === undefined || val === null) return "—";
  return `${val}${suffix}`;
};

const getAvgClass = (avg) => {
  if (avg === undefined || avg === null || avg === "" || avg === "—") return "";
  const num = Number(avg);
  if (isNaN(num)) return "";

  if (reportMode.value === "attack") {
    if (num === 3.0) return "perfect";
    if (num >= 2.5 && num < 3.0) return "good";
    if (num >= 2.0 && num < 2.5) return "neutral";
    if (num < 2.0) return "negative";
  } else {
    if (num <= 1.5) return "perfect";
    if (num <= 2.0) return "good";
    if (num <= 2.5) return "neutral";
    return "negative";
  }
  return "";
};

const openDetailModal = (type) => {
  activeDetailModal.value = type;
};

const closeDetailModal = () => {
  activeDetailModal.value = null;
};

// Obliczenia procentowe do modalu bilansu wojen
const warPercentages = computed(() => {
  const total =
    warStats.value.wins + warStats.value.draws + warStats.value.losses;
  if (total === 0) return { wins: 0, draws: 0, losses: 0 };
  return {
    wins: ((warStats.value.wins / total) * 100).toFixed(1),
    draws: ((warStats.value.draws / total) * 100).toFixed(1),
    losses: ((warStats.value.losses / total) * 100).toFixed(1),
  };
});

// Dynamiczne listy graczy do modalu Kadry/Uczestników
const rosterLists = computed(() => {
  if (!players.value.length) return { primary: [], secondary: [] };

  if (filterMode.value === "season") {
    return {
      primary: players.value.filter((p) => (p.possibleAttacks || 0) > 0), // W boju
      secondary: players.value.filter((p) => (p.possibleAttacks || 0) === 0), // Na ławce
    };
  } else {
    return {
      primary: players.value.filter(
        (p) => (p.possibleAttacks || 0) === warsCount.value,
      ), // Żelazny skład
      secondary: players.value.filter(
        (p) => (p.possibleAttacks || 0) < warsCount.value,
      ), // Rotowani
    };
  }
});

// Wyciąganie maruderów (osób, które opuściły ataki) do modalu frekwencji
const missedAttacksPlayers = computed(() => {
  return players.value
    .filter((p) => {
      const done =
        p.attacksDone !== undefined ? p.attacksDone : p.possibleAttacks || 0;
      return (p.possibleAttacks || 0) > done;
    })
    .map((p) => {
      const done =
        p.attacksDone !== undefined ? p.attacksDone : p.possibleAttacks || 0;
      const missed = p.possibleAttacks - done;
      return { name: p.name, missed };
    })
    .sort((a, b) => b.missed - a.missed);
});

// --- LOGIKA I REJESTR ROTACJI KADROWYCH (ZMIANY) ---
// --- LOGIKA I REJESTR ROTACJI KADROWYCH (ZMIANY) ---
const changesData = computed(() => {
  if (!players.value.length) return { count: 0, log: [] };

  // Pobieramy rzeczywiste nazwy zawodników z bazy klanowej do symulacji rotacji
  const names = players.value.map((p) => p.name);

  // Rejestr zmian przypisany do konkretnych sezonów
  const fullChangesLog = [
    {
      season: "2026-05",
      war: "Wojna 2",
      out: names[0] || "Gracz A",
      in: names[5] || "Gracz B",
      type: "Taktyczna",
    },
    {
      season: "2026-05",
      war: "Wojna 4",
      out: names[1] || "Gracz C",
      in: names[6] || "Gracz D",
      type: "Wymuszenie",
    },
    {
      season: "2026-05",
      war: "Wojna 6",
      out: names[2] || "Gracz E",
      in: names[7] || "Gracz F",
      type: "Rotacja",
    },
    {
      season: "2026-04",
      war: "Wojna 1",
      out: names[3] || "Gracz G",
      in: names[8] || "Gracz H",
      type: "Taktyczna",
    },
    {
      season: "2026-04",
      war: "Wojna 5",
      out: names[4] || "Gracz I",
      in: names[9] || "Gracz J",
      type: "Rotacja",
    },
    {
      season: "2026-03",
      war: "Wojna 3",
      out: names[0] || "Gracz A",
      in: names[6] || "Gracz D",
      type: "Taktyczna",
    },
  ];

  // Filtrowanie wpisów na podstawie aktywnych filtrów kokpitu
  let filtered = [];
  if (filterMode.value === "season") {
    filtered = fullChangesLog.filter(
      (item) => item.season === selectedSeason.value,
    );
  } else {
    filtered = fullChangesLog.filter((item) => {
      return item.season >= startSeason.value && item.season <= endSeason.value;
    });
  }

  // PRZEKAZANIE JUŻ ZFORMATOWANEJ WARTOŚCI:
  const mappedLog = filtered.map((item) => ({
    ...item,
    formattedSeason: formatSeason(item.season),
  }));

  return {
    count: mappedLog.length,
    log: mappedLog,
  };
});
const exportToExcel = () => {
  console.log("Eksportowanie obecnej tabeli do pliku Excel...");
};

watch([reportMode, subSortMode], () => {
  sortPlayers();
});

watch(
  [reportMode, subSortMode, filterMode, selectedSeason, startSeason, endSeason],
  () => {
    fetchData();
  },
);

onMounted(() => fetchData());
</script>

<template>
  <div class="report-view league-theme">
    <header class="header-main">
      <div class="header-container">
        <router-link to="/" class="back-link">
          <font-awesome-icon icon="fa-solid fa-arrow-left" />
          <span class="text-inline">DASHBOARD</span>
          <font-awesome-icon icon="fa-solid fa-home" />
        </router-link>

        <div class="header-title">
          <div class="badge">
            <font-awesome-icon icon="fa-solid fa-trophy" />
            <span class="text-inline">Clan War League</span>
          </div>
          <h1>STATYSTYKI <span>LIGOWE</span></h1>
          <div class="season-text">
            Sezon:
            <span class="season-badge">{{ formatSeason(seasonName) }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="report-content">
      <CwlControlPanel
        :available-seasons="availableSeasons"
        v-model:filterMode="filterMode"
        v-model:selectedSeason="selectedSeason"
        v-model:startSeason="startSeason"
        v-model:endSeason="endSeason"
        v-model:reportMode="reportMode"
        v-model:subSortMode="subSortMode"
      />
      <CwlQuickStats
        :war-stats="warStats"
        :wars-count="warsCount"
        :clan-avg-destruction="clanAvgDestruction"
        :attendance-stats="attendanceStats"
        :changes-data="changesData"
        :roster-lists="rosterLists"
        :season-name="seasonName"
        :roster-stats="rosterStats"
        :filter-mode="filterMode"
        :leaders-label="leadersLabel"
        :leaders-display="leadersDisplay"
        :report-mode="reportMode"
        :sub-sort-mode="subSortMode"
        @open-modal="activeDetailModal = $event"
      />
      <div class="table-outer-wrapper">
        <div class="table-scroll-hint">
          <font-awesome-icon
            icon="fa-solid fa-arrows-left-right"
            class="icon"
          />
          <span class="text-inline">
            Przesuń w lewo/prawo, aby zobaczyć całą tabelę
          </span>
        </div>

        <LoadingSpinner
          v-if="isLoading"
          type="league"
          message="Wczytywanie Macierzy Ligowej..."
        />

        <ErrorMessage
          v-else-if="errorMessage"
          is-error
          show-retry
          icon="⚠️"
          title="Błąd systemu CWL"
          :message="errorMessage"
          @retry="fetchData"
        />

        <ErrorMessage
          v-else-if="players.length === 0"
          icon="🔍"
          title="Brak danych ligowych"
          message="W wybranym zakresie sezonów nie znaleziono żadnych zapisanych raportów z Ligi Wojny Klanów."
        />

        <div v-else class="table-wrapper no-scrollbar">
          <CwlAttackReport
            v-if="reportMode === 'attack'"
            :players="players"
            :getRankDisplay="getRankDisplay"
            :getPodiumClass="getPodiumClass"
            :formatWarValue="formatWarValue"
            :getAvgClass="getAvgClass"
          />
          <CwlDefenseReport
            v-else
            :players="players"
            :getRankDisplay="getRankDisplay"
            :getPodiumClass="getPodiumClass"
            :formatWarValue="formatWarValue"
            :getAvgClass="getAvgClass"
          />
        </div>
      </div>
    </main>
    <FloatingActionPanel
      @export-excel="exportToExcel"
      @open-info="isModalOpen = true"
    />
  </div>
  <InfoModal :is-open="isModalOpen" @close="isModalOpen = false" />
  <CwlDetailModals
    :active-detail-modal="activeDetailModal"
    :wars-count="warsCount"
    :war-percentages="warPercentages"
    :war-stats="warStats"
    :filter-mode="filterMode"
    :roster-lists="rosterLists"
    :formatted-season="formatSeason(seasonName)"
    :attendance-stats="attendanceStats"
    :missed-attacks-players="missedAttacksPlayers"
    :clan-avg-destruction="clanAvgDestruction"
    :changes-data="changesData"
    @close="closeDetailModal"
  />
  <Footer />
</template>

<style scoped lang="scss">
@use "@/assets/scss/_league.scss";
</style>
