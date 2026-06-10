<script setup>
// Automatyczne dwukierunkowe wiązania (v-model) z plikiem głównym
const filterMode = defineModel("filterMode", { type: String });
const selectedSeason = defineModel("selectedSeason", { type: String });
const startSeason = defineModel("startSeason", { type: String });
const endSeason = defineModel("endSeason", { type: String });
const reportMode = defineModel("reportMode", { type: String });
const subSortMode = defineModel("subSortMode", { type: String });

defineProps({
  availableSeasons: {
    type: Array,
    required: true,
  },
});

// Funkcja pomocnicza formatująca wyświetlanie sezonu (np. "2026-05" -> "Maj 2026")
// Jeśli format z bazy danych jest inny, funkcja bezpiecznie zwróci oryginalny tekst.
const formatSeason = (season) => {
  if (!season) return "";
  const match = season.match(/^(\d{4})-(\d{2})$/);
  if (match) {
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
    const monthIndex = parseInt(match[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${match[1]}`;
    }
  }
  return season;
};
</script>

<template>
  <section class="control-panel">
    <div class="panel-header">
      <h3><font-awesome-icon icon="fa-solid fa-sliders" /> PANEL STEROWANIA</h3>
    </div>
    <div class="panel-content">
      <div class="control-group">
        <label>
          <font-awesome-icon icon="fa-solid fa-microscope" />
          <span class="text-inline">Tryb Analizy</span>
        </label>
        <div class="segmented-control">
          <button
            @click="reportMode = 'attack'"
            :class="{ active: reportMode === 'attack' }"
          >
            ⚔️ ATAK
          </button>
          <button
            @click="reportMode = 'defense'"
            :class="{ active: reportMode === 'defense' }"
          >
            🛡️ OBRONA
          </button>
          <div
            class="selection-slider"
            :class="{
              'second-pos': reportMode === 'defense',
              defense: reportMode === 'defense',
            }"
          ></div>
        </div>
      </div>

      <div class="control-group">
        <label>
          <font-awesome-icon icon="fa-solid fa-bars-staggered" />
          <span class="text-inline">Priorytet Sortowania</span>
        </label>
        <div class="segmented-control">
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
          <div
            class="selection-slider"
            :class="{
              'second-pos': subSortMode === 'destruction',
              destruction: subSortMode === 'destruction',
            }"
          ></div>
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
          <span class="text-inline">
            {{ filterMode === "season" ? "Wybierz Sezon" : "Zakres Sezonów" }}
          </span>
        </label>
        <div class="filters-row">
          <select
            v-if="filterMode === 'season'"
            v-model="selectedSeason"
            class="custom-select"
          >
            <option
              v-for="s in availableSeasons"
              :key="s.fileId"
              :value="s.fileId"
            >
              {{ formatSeason(s.season) }}
            </option>
          </select>

          <div v-else class="range-selects">
            <select v-model="startSeason" class="custom-select short-select">
              <option
                v-for="s in availableSeasons"
                :key="s.fileId"
                :value="s.fileId"
              >
                Od: {{ formatSeason(s.season) }}
              </option>
            </select>
            <span class="range-dash">—</span>
            <select v-model="endSeason" class="custom-select short-select">
              <option
                v-for="s in availableSeasons"
                :key="s.fileId"
                :value="s.fileId"
              >
                Do: {{ formatSeason(s.season) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.control-panel {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba($leagueOrange, 0.2);
  border-radius: 1.5vmin;
  padding: 2.5vmin;
  margin-bottom: 4vmin;
  backdrop-filter: blur(10px);

  .panel-header {
    margin-bottom: 2vmin;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 1vmin;

    h3 {
      font-size: 1.8vmin;
      color: $leagueOrange;
      letter-spacing: 2px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .panel-content {
    display: flex;
    flex-wrap: wrap;
    gap: 3vmin;
    align-items: flex-end;
  }
}

span.text-inline {
  margin-left: 1vmin;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1vmin;

  label {
    font-size: 1.1vmin;
    color: #666;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
  }
}

.segmented-control {
  background: #050505;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  position: relative;
  min-width: 200px;
  height: 4.5vmin;

  button {
    flex: 1;
    background: transparent;
    border: none;
    color: #555;
    font-size: 1.2vmin;
    font-weight: 800;
    cursor: pointer;
    z-index: 2;
    transition: color 0.3s ease;

    &.active {
      color: #fff;
    }
  }

  .selection-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    border-radius: 6px;
    transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    z-index: 1;
    background: $leagueOrange;
    box-shadow: 0 0 15px rgba($leagueOrange, 0.3);

    &.second-pos,
    &.destruction {
      transform: translateX(100%);
    }

    &.defense {
      transform: translateX(100%);
      background: #e74c3c;
      box-shadow: 0 0 15px rgba(#e74c3c, 0.3);
    }
  }
}

.filters-main {
  min-width: 250px;
}

.filters-row {
  display: flex;
  gap: 1.5vmin;
  align-items: center;
  height: 4.5vmin;

  .custom-select,
  input {
    background: #000;
    color: #fff;
    border: 1px solid #333;
    padding: 0 1.5vmin;
    border-radius: 6px;
    font-size: 1.4vmin;
    outline: none;
    transition: border-color 0.3s;
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      border-color: $leagueOrange;
    }
  }

  .custom-select {
    flex-grow: 1;
    cursor: pointer;
  }

  /* INTEGRACJA DROPDOWNÓW ZAKRESU SEZONÓW */
  .range-selects {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 100%;

    .short-select {
      flex: 1;
    }
    .range-dash {
      color: #475569;
      font-weight: bold;
      padding: 0 4px;
    }
  }

  .date-inputs {
    display: flex;
    align-items: center;
    background: #000;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 0 1vmin;
    height: 100%;

    input {
      border: none !important;
      height: 100% !important;
      background: transparent;
    }

    .date-sep {
      color: #444;
      font-weight: bold;
      padding: 0 0.5vmin;
    }
  }
}
@media (max-width: 1100px) {
  .control-panel {
    padding: 1.5rem;
    .panel-content {
      flex-direction: column;
      align-items: stretch;
      gap: 2rem;
      justify-content: center;
    }
  }

  .control-group {
    width: 100%;
    align-items: center;
    label {
      font-size: 0.8rem;
      text-align: center;
    }
  }

  .segmented-control {
    width: 100%;
    height: 50px;
    button {
      font-size: 0.9rem;
    }
  }

  .filters-row {
    flex-direction: column;
    width: 100%;
    height: auto;
    gap: 1rem;
    .custom-select,
    .date-inputs,
    .range-selects,
    input {
      width: 100%;
      height: 50px;
      font-size: 1rem;
    }
  }
}
</style>
