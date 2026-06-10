<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import GloryAttackReport from "./GloryAttackReport.vue";
import GloryDefenseReport from "./GloryDefenseReport.vue";
import InfoModal from "../../components/InfoModal.vue";
import Footer from "../../components/Footer.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import FloatingActionPanel from "@/components/FloatingActionPanel.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const players = ref([]);
const warsCount = ref(0);
const seasonName = ref("");
const seasonsList = ref([]);
const isLoading = ref(true);

const reportMode = ref("attack");
const subSortMode = ref("stars");
const filterMode = ref("season");
const selectedSeason = ref("");
const startDate = ref("");
const endDate = ref("");
const errorMessage = ref("");
const isModalOpen = ref(false);

const exportToExcel = () => {
  console.log("Eksportowanie obecnej tabeli do pliku Excel...");
};

const fetchData = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const params = {
      mode: reportMode.value,
      sortBy: subSortMode.value,
      season: filterMode.value === "season" ? selectedSeason.value : undefined,
      startDate: filterMode.value === "range" ? startDate.value : undefined,
      endDate: filterMode.value === "range" ? endDate.value : undefined,
    };

    const response = await axios.get(`${apiUrl}/glory`, { params });

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (response.data.availableSeasons) {
      seasonsList.value = response.data.availableSeasons;

      if (!selectedSeason.value && seasonsList.value.length > 0) {
        selectedSeason.value = seasonsList.value[0];
      }
    }

    if (!response.data.players || response.data.players.length === 0) {
      players.value = [];
      return;
    }

    const mappedPlayers = response.data.players.map((p) => {
      const totalWars = response.data.warsCount;
      const part = p.warsParticipated || 0;
      const missing = totalWars - part;

      return {
        ...p,
        totalDefStars: p.totalDefStars + missing * 3,
        totalDefDest: p.totalDefDest + missing * 100,
        avgAtkStarsPerHit:
          part > 0 ? parseFloat((p.totalAtkStars / (part * 2)).toFixed(2)) : 0,
        avgAtkDestPerHit:
          part > 0 ? parseFloat((p.totalAtkDest / (part * 2)).toFixed(1)) : 0,
        avgDefStars: parseFloat(
          ((p.totalDefStars + missing * 3) / totalWars).toFixed(2),
        ),
        avgDefDest: parseFloat(
          ((p.totalDefDest + missing * 100) / totalWars).toFixed(1),
        ),
      };
    });

    // --- OBLIČZANIE POZYCJI SPORTOWEJ ORAZ UNIKALNYCH MEDALI W LIŚCIE CHWAŁY ---
    let currentRank = 1;
    let currentMedalTier = 1;

    for (let i = 0; i < mappedPlayers.length; i++) {
      if (i > 0) {
        const prev = mappedPlayers[i - 1];
        const curr = mappedPlayers[i];

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
      mappedPlayers[i].rank = currentRank;
      mappedPlayers[i].medalTier = currentMedalTier;
    }

    players.value = mappedPlayers;
    // ... (reszta kodu funkcji fetchData bez zmian)

    players.value = mappedPlayers;

    warsCount.value = response.data.warsCount;
    seasonName.value = response.data.seasonName;
  } catch (error) {
    console.error("Błąd pobierania:", error);
    errorMessage.value =
      "Wystąpił problem z połączeniem. Sprawdź dane i spróbuj ponownie.";
  } finally {
    isLoading.value = false;
  }
};
const formatSeason = (seasonStr) => {
  if (!seasonStr || typeof seasonStr !== "string") return seasonStr;

  const parts = seasonStr.split("-");
  if (parts.length !== 2) return seasonStr;

  const [year, month] = parts;
  const monthNames = {
    "01": "Styczeń",
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

  return `${monthNames[month] || month} ${year}`;
};
const getAvgClass = (player) => {
  if (!player) return "";

  if (reportMode.value === "defense") {
    const score = Number(player.avgDefStars) || 0;
    if (score <= 1.5) return "perfect";
    if (score <= 2.0) return "good";
    if (score <= 2.5) return "neutral";
    return "negative";
  }

  const score = Number(player.avgAtkStarsPerHit) || 0;
  if (score == 3.0) return "perfect";
  if (score >= 2.5) return "good";
  if (score >= 2.0) return "neutral";
  return "negative";
};

const formatWarValue = (val, unit) =>
  val === null || val === undefined ? "" : `${val}${unit}`;

const getRankDisplay = (i) => {
  const player = players.value[i];
  if (!player || player.medalTier === undefined) return `${i + 1}.`;

  if (player.medalTier === 1) return "🥇";
  if (player.medalTier === 2) return "🥈";
  if (player.medalTier === 3) return "🥉";
  return `${player.rank}.`;
};

const getPodiumClass = (i) => {
  const player = players.value[i];
  if (!player || player.medalTier === undefined) return "";

  if (player.medalTier === 1) return "podium-gold";
  if (player.medalTier === 2) return "podium-silver";
  if (player.medalTier === 3) return "podium-bronze";
  return "";
};
const leadersDisplay = computed(() => {
  if (!players.value.length) return "---";
  const topPlayers = players.value.filter((p) => p.rank === 1);
  return topPlayers.map((p) => p.name).join(", ");
});

watch(
  [reportMode, subSortMode, filterMode, selectedSeason, startDate, endDate],
  () => {
    fetchData();
  },
);

onMounted(() => fetchData());
</script>

<template>
  <div class="report-view glory-theme" :class="reportMode">
    <header class="header-main">
      <div class="header-container">
        <router-link to="/" class="back-link"
          ><font-awesome-icon icon="fa-solid fa-arrow-left" />
          <span class="text-inline">DASHBOARD</span>
          <font-awesome-icon icon="fa-solid fa-home"
        /></router-link>
        <div class="header-title">
          <div class="badge">
            <font-awesome-icon icon="fa-solid fa-award" />
            <span class="text-inline">Analiza Wojenna</span>
          </div>
          <h1>LISTA <span>CHWAŁY</span></h1>

          <div class="season-badge">
            <span class="season-text" v-if="!seasonName.includes('Zakres')"
              >Sezon:
            </span>
            {{ formatSeason(seasonName) }}
          </div>
        </div>
      </div>
    </header>

    <main class="report-content">
      <section class="control-panel">
        <div class="panel-header">
          <h3>
            <font-awesome-icon icon="fa-solid fa-sliders" />
            <span class="text-inline">PANEL STEROWANIA</span>
          </h3>
        </div>

        <div class="panel-content">
          <div class="control-group">
            <label>
              <font-awesome-icon icon="fa-solid fa-microscope" />
              <span class="text-inline">Tryb Analizy</span>
            </label>
            <div class="segmented-control mode-toggle">
              <button
                @click="reportMode = 'attack'"
                :class="{ active: reportMode === 'attack' }"
              >
                ⚔️ OFENSYWA
              </button>
              <button
                @click="reportMode = 'defense'"
                :class="{ active: reportMode === 'defense' }"
              >
                🛡️ DEFENSYWA
              </button>
              <div class="selection-slider" :class="reportMode"></div>
            </div>
          </div>

          <div class="control-group">
            <label>
              <font-awesome-icon icon="fa-solid fa-bars-staggered" />
              <span class="text-inline">Priorytet Sortowania</span>
            </label>
            <div class="segmented-control sort-toggle">
              <button
                @click="subSortMode = 'stars'"
                :class="{ active: subSortMode === 'stars' }"
              >
                <font-awesome-icon icon="fa-solid fa-star" />
                GWIAZDKI
              </button>
              <button
                @click="subSortMode = 'destruction'"
                :class="{ active: subSortMode === 'destruction' }"
              >
                <font-awesome-icon icon="fa-solid fa-percentage" />
                ZNISZCZENIA
              </button>
              <div class="selection-slider" :class="subSortMode"></div>
            </div>
          </div>

          <div class="control-group">
            <label>
              <font-awesome-icon icon="fa-solid fa-arrow-down-wide-short" />
              <span class="text-inline">Typ Filtra</span>
            </label>
            <div class="segmented-control filter-toggle">
              <button
                @click="filterMode = 'season'"
                :class="{ active: filterMode === 'season' }"
              >
                SEZON
              </button>
              <button
                @click="filterMode = 'range'"
                :class="{ active: filterMode === 'range' }"
              >
                ZAKRES
              </button>
              <div
                class="selection-slider"
                :class="{ 'second-pos': filterMode === 'range' }"
              ></div>
            </div>
          </div>

          <div class="control-group filters-main">
            <label>
              <font-awesome-icon icon="fa-solid fa-calendar-check" />
              <span class="text-inline">{{
                filterMode === "season" ? "Wybierz Sezon" : "Ustaw Daty"
              }}</span>
            </label>
            <div class="filters-row">
              <select
                v-if="filterMode === 'season'"
                v-model="selectedSeason"
                class="custom-select"
              >
                <option v-for="s in seasonsList" :key="s" :value="s">
                  {{ formatSeason(s) }}
                </option>
              </select>
              <div v-else class="date-inputs">
                <input
                  type="date"
                  v-model="startDate"
                  title="Data początkowa"
                />
                <span class="date-sep">/</span>
                <input type="date" v-model="endDate" title="Data końcowa" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-stats">
        <div class="stat-card">
          <span class="stat-label">
            <font-awesome-icon icon="fa-solid fa-khanda" />
            <span class="text-inline">Rozegrane Wojny</span>
          </span>
          <span class="stat-value">{{ warsCount }}</span>
        </div>
        <div class="stat-card leader">
          <span class="stat-label">
            <font-awesome-icon icon="fa-solid fa-crown" />
            <span class="text-inline">Lider</span>
          </span>
          <span class="stat-value">{{ leadersDisplay }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">
            <font-awesome-icon icon="fa-solid fa-users" />
            <span class="text-inline">Liczba Graczy</span>
          </span>
          <span class="stat-value">{{ players.length }}</span>
        </div>
        <div :class="['stat-card', 'highlight', reportMode]">
          <span class="stat-label">
            <font-awesome-icon icon="fa-solid fa-microscope" />
            <span class="text-inline">Tryb</span>
          </span>
          <span class="stat-value">
            {{ reportMode === "attack" ? "OFENSYWA ⚔️" : "DEFENSYWA 🛡️" }}
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">
            <font-awesome-icon icon="fa-solid fa-bars-staggered" />
            <span class="text-inline">Priorytet</span>
          </span>
          <span class="stat-value">{{
            subSortMode === "stars" ? "GWIAZDKI [★]" : "ZNISZCZENIA [٪]"
          }}</span>
        </div>
      </section>

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
          type="glory"
          message="Przetwarzanie Danych..."
        />

        <ErrorMessage
          v-else-if="errorMessage"
          is-error
          show-retry
          icon="⚠️"
          title="Coś poszło nie tak"
          :message="errorMessage"
          @retry="fetchData"
        />

        <ErrorMessage
          v-else-if="players.length === 0"
          icon="🔍"
          title="Brak danych do wyświetlenia"
          message="W wybranym okresie nie znaleziono żadnych zapisanych wojen klanowych."
        />

        <div v-else class="table-wrapper no-scrollbar">
          <GloryAttackReport
            v-if="reportMode === 'attack'"
            :players="players"
            :getRankDisplay="getRankDisplay"
            :getPodiumClass="getPodiumClass"
            :getAvgClass="getAvgClass"
            :formatWarValue="formatWarValue"
          />

          <GloryDefenseReport
            v-else
            :players="players"
            :getRankDisplay="getRankDisplay"
            :getPodiumClass="getPodiumClass"
            :formatWarValue="formatWarValue"
            :get-avg-class="getAvgClass"
          />
        </div>
      </div>
    </main>

    <FloatingActionPanel
      @export-excel="exportToExcel"
      @open-info="isModalOpen = true"
    />
    <InfoModal :is-open="isModalOpen" @close="isModalOpen = false" />

    <Footer />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/_glory.scss";
</style>
