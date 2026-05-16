<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import AttackReport from "./AttackReport.vue";
import DefenseReport from "./DefenseReport.vue";
import GloryInfoModal from "./GloryInfoModal.vue";

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

    players.value = response.data.players.map((p) => {
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

const getAvgClass = (player) => {
  if (!player) return "";

  if (reportMode.value === "defense") {
    const score = Number(player.avgDefStars) || 0;
    if (score === 0) return "perfect";
    if (score <= 1.5) return "good";
    if (score <= 2.0) return "neutral";
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

const getRankDisplay = (i) => (i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}.`);

const getPodiumClass = (i) =>
  i === 0
    ? "podium-gold"
    : i === 1
      ? "podium-silver"
      : i === 2
        ? "podium-bronze"
        : "";

watch(
  [reportMode, subSortMode, filterMode, selectedSeason, startDate, endDate],
  () => {
    fetchData();
  },
);

onMounted(() => fetchData());
</script>

<template>
  <div class="report-view" :class="reportMode">
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
            <span v-if="!seasonName.includes('Zakres')">Sezon </span>
            {{ seasonName }}
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
                  {{ s }}
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
          <span class="stat-value">{{ players[0]?.name || "---" }}</span>
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

        <div v-if="isLoading" class="loader-container">
          <div class="spinner"></div>
          <p>PRZETWARZANIE DANYCH...</p>
        </div>

        <div v-else-if="errorMessage" class="empty-state-container error">
          <div class="icon">⚠️</div>
          <h3>Coś poszło nie tak</h3>
          <p>{{ errorMessage }}</p>
          <button @click="fetchData" class="retry-btn">Spróbuj ponownie</button>
        </div>

        <div v-else-if="players.length === 0" class="empty-state-container">
          <div class="icon">🔍</div>
          <h3>Brak danych do wyświetlenia</h3>
          <p>
            W wybranym okresie nie znaleziono żadnych zapisanych wojen
            klanowych.
          </p>
        </div>

        <div v-else class="table-wrapper no-scrollbar">
          <AttackReport
            v-if="reportMode === 'attack'"
            :players="players"
            :getRankDisplay="getRankDisplay"
            :getPodiumClass="getPodiumClass"
            :getAvgClass="getAvgClass"
            :formatWarValue="formatWarValue"
          />

          <DefenseReport
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

    <div class="floating-action-panel">
      <button
        @click="exportToExcel"
        class="action-btn excel-btn"
        data-tooltip="Eksportuj tabelę do Excela (Coming Soon)"
      >
        <font-awesome-icon icon="fa-solid fa-file-excel" />
      </button>
      <button
        @click="isModalOpen = true"
        class="action-btn info-btn"
        data-tooltip="Informacje o systemie"
      >
        <font-awesome-icon icon="fa-solid fa-circle-question" />
      </button>
    </div>
    <GloryInfoModal :is-open="isModalOpen" @close="isModalOpen = false" />

    <footer>
      <p>
        &copy; 2026 Polska Husaria Management System v2.1 • Made By &#64;Kondi
      </p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/_glory.scss";
</style>
