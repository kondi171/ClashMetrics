<script setup>
defineProps({
  // Dotychczasowe propsy
  warStats: { type: Object, required: true },
  warsCount: { type: Number, required: true },
  clanAvgDestruction: { type: String, required: true },
  attendanceStats: { type: Object, required: true },
  changesData: { type: Object, required: true },
  rosterLists: { type: Object, required: true },
  seasonName: { type: String, required: true },

  // Brakujące propsy wywołujące błędy
  rosterStats: { type: Object, required: true },
  filterMode: { type: String, required: true },
  leadersLabel: { type: String, required: true },
  leadersDisplay: { type: String, required: true },
  reportMode: { type: String, required: true },
  subSortMode: { type: String, required: true },
});

defineEmits(["open-modal"]);
</script>

<template>
  <section class="quick-stats">
    <div class="stats-grid-wrapper">
      <div
        class="stat-card wars-card clickable-card"
        @click="$emit('open-modal', 'wars')"
      >
        <span class="card-label">BILANS WOJEN</span>
        <div class="card-values">
          <span class="val-win" title="Zwycięstwa"
            >{{ warStats.wins }} <small>Wygrane</small></span
          >
          <span class="divider">/</span>
          <span class="val-draw" title="Remisy"
            >{{ warStats.draws }} <small>Remisy</small></span
          >
          <span class="divider">/</span>
          <span class="val-loss" title="Porażki"
            >{{ warStats.losses }} <small>Porażki</small></span
          >
        </div>
      </div>

      <div
        class="stat-card roster-card clickable-card"
        @click="$emit('open-modal', 'roster')"
      >
        <span class="card-label">Uczestnicy</span>
        <div class="card-values">
          <template v-if="filterMode === 'season'">
            <span class="val-battle"
              >{{ rosterStats.inBattle }} <small>W Boju</small></span
            >
            <span class="divider">/</span>
            <span class="val-bench"
              >{{ rosterStats.onBench }} <small>Na Ławce</small></span
            >
          </template>
          <template v-else>
            <span class="val-battle"
              >{{ rosterStats.ironRoster }} <small>Żelazny Skład</small></span
            >
            <span class="divider">/</span>
            <span class="val-bench"
              >{{ rosterStats.benchedAtLeastOnce }}
              <small>Rotowani</small></span
            >
          </template>
          <span class="divider">/</span>
          <span class="val-total"
            >{{ rosterStats.totalRoster }} <small>Cała Kadra</small></span
          >
        </div>
      </div>

      <div
        class="stat-card played-card clickable-card"
        @click="$emit('open-modal', 'played')"
      >
        <span class="card-label">Rozegrane CWL</span>
        <div class="card-values single-value">
          <span class="val-played"
            >{{ warsCount / 7 }} <small>Lig w zakresie</small></span
          >
        </div>
      </div>

      <div
        class="stat-card attendance-card clickable-card"
        @click="$emit('open-modal', 'attendance')"
      >
        <span class="card-label">FREKWENCJA</span>
        <div class="card-values single-value">
          <span class="val-attendance">
            {{ attendanceStats.percentage }}%
            <small
              >{{ attendanceStats.totalDone }} /
              {{ attendanceStats.totalPossible }} ataków</small
            >
          </span>
        </div>
      </div>

      <div
        class="stat-card clan-dest-card clickable-card"
        @click="$emit('open-modal', 'destruction')"
      >
        <span class="card-label">ŚREDNIE ZNISZCZENIA</span>
        <div class="card-values single-value">
          <span class="val-dest">
            {{ clanAvgDestruction }}%
            <small>Globalna skuteczność</small>
          </span>
        </div>
      </div>

      <div class="stat-card leader">
        <span class="stat-label">
          <font-awesome-icon icon="fa-solid fa-crown" />
          <span class="text-inline">{{ leadersLabel }}</span>
        </span>
        <span class="stat-value text-ellipsis">{{ leadersDisplay }}</span>
      </div>

      <div :class="['stat-card', 'highlight', reportMode]">
        <span class="stat-label">
          <font-awesome-icon icon="fa-solid fa-microscope" />
          <span class="text-inline">Tryb</span>
        </span>
        <span class="stat-value text-center">
          {{ reportMode === "attack" ? "OFENSYWA ⚔️" : "DEFENSYWA 🛡️" }}
        </span>
      </div>

      <div class="stat-card">
        <span class="stat-label">
          <font-awesome-icon icon="fa-solid fa-bars-staggered" />
          <span class="text-inline">Priorytet</span>
        </span>
        <span class="stat-value text-center">
          {{ subSortMode === "stars" ? "GWIAZDKI [★]" : "ZNISZCZENIA [٪]" }}
        </span>
      </div>

      <div
        class="stat-card changes-card clickable-card"
        @click="$emit('open-modal', 'changes')"
      >
        <span class="stat-label">
          <font-awesome-icon icon="fa-solid fa-right-left" />
          <span class="text-inline">Zmiany</span>
        </span>
        <span class="stat-value">
          {{ changesData.count }}
          <small class="inline-desc">w zakresie</small>
        </span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.quick-stats {
  margin-bottom: 3vmin;

  .stats-grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  .stat-card {
    background: #1a1a1a;
    padding: 2vmin;
    border-radius: 2vmin;
    border: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 1.5vmin;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      font-size: 2.5vmin;
      font-weight: 800;
      margin-top: 2vmin;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }
  }

  // ==========================================
  // STRUKTURA I PROPORCJE KOLUMN (SIATKA L1 & L2)
  // ==========================================
  .wars-card {
    grid-column: span 2 !important;
  }
  .roster-card {
    grid-column: span 3 !important;
  }
  .played-card {
    grid-column: span 2 !important;
  }
  .attendance-card {
    grid-column: span 2 !important;
  }
  .clan-dest-card {
    grid-column: span 3 !important;
  }

  .leader {
    grid-column: span 5 !important;
  }
  .highlight {
    grid-column: span 2 !important;
  }

  // POPRAWIONE: Zamiast &:nth-child(8) używamy jawnie klasy kafelka
  .stat-card:nth-child(8) {
    grid-column: span 2 !important;
  } // Selektor karty Priorytetu

  .changes-card {
    grid-column: span 3 !important;
  }

  // ==========================================
  // STYLIZACJA KAFELKÓW SPECYFICZNYCH (Z LINII 1)
  // ==========================================
  .wars-card,
  .roster-card,
  .played-card,
  .attendance-card,
  .clan-dest-card {
    text-align: center;
    align-items: center;
    justify-content: center;

    .card-values {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 2.4vmin;
      font-weight: 900;
      font-family: "Inter", sans-serif;
      letter-spacing: 0.5px;
      line-height: 1;
      margin-top: auto;
      padding-top: 2vmin;

      span {
        white-space: nowrap;
      }

      .val-win {
        color: #10b981;
        text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
      }
      .val-draw {
        color: #94a3b8;
        text-shadow: 0 0 15px rgba(148, 163, 184, 0.2);
      }
      .val-loss {
        color: #ef4444;
        text-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
      }
      .val-battle {
        color: #3498db;
        text-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
      }
      .val-bench {
        color: #e67e22;
        text-shadow: 0 0 15px rgba(230, 126, 34, 0.3);
      }
      .val-total {
        color: #ffffff;
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
      }

      .divider {
        color: #334155;
        font-weight: 300;
        font-size: 2vmin;
      }

      small {
        font-size: 1.1vmin;
        color: #555;
        font-weight: 600;
        text-transform: uppercase;
        display: block;
        margin-top: 4px;
        letter-spacing: 0.5px;
      }
    }
  }

  .card-label {
    font-size: 1.5vmin;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
    width: 100%;
    justify-content: center;
  }

  .wars-card {
    border-color: rgba($leagueOrange, 0.4);
    background: rgba($leagueOrange, 0.04);
  }

  .roster-card {
    border-color: rgba($leagueOrange, 0.25);
    background: rgba(255, 255, 255, 0.01);
  }

  // ==========================================
  // STYLIZACJA KAFELKÓW SPECYFICZNYCH (Z LINII 2)
  // ==========================================
  .leader,
  .highlight,
  .stat-card:nth-child(8) {
    text-align: left;
    align-items: flex-start;
    justify-content: center;

    .stat-label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      gap: 8px;
    }

    .stat-value {
      text-align: left;
      width: 100%;
      justify-content: flex-start;
      padding-left: 2px;
    }
  }

  .leader {
    color: $gold;
    border-color: rgba($gold, 0.4);
    background: rgba($gold, 0.05);
  }

  .highlight.attack {
    border-color: rgba($leagueOrange, 0.4);
    background: rgba($leagueOrange, 0.05);
  }

  .highlight.defense {
    border-color: rgba(#e74c3c, 0.4);
    background: rgba(#e74c3c, 0.05);
  }

  .changes-card {
    text-align: left;
    align-items: flex-start;
    justify-content: center;
    border-left: 3px solid #e18a00 !important;

    .stat-label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      gap: 8px;
    }

    .stat-value {
      color: #e18a00;
      font-weight: 800;
      text-shadow: 0 0 10px rgba(#e18a00, 0.2);
      display: flex;
      align-items: baseline;
      gap: 6px;

      .inline-desc {
        font-size: 0.72rem;
        color: #a0aec0;
        font-weight: 600;
        text-transform: uppercase;
      }
    }
  }

  .single-value {
    justify-content: center;
    text-align: center;
    margin-top: auto;
    padding-top: 6px;

    .val-played,
    .val-attendance,
    .val-dest {
      font-size: 1.6rem;
      font-weight: 900;
      line-height: 1.1;

      small {
        display: block;
        font-size: 0.68rem;
        color: #a0aec0;
        margin-top: 4px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
    }

    .val-played {
      color: #ffd700;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
    }
    .val-attendance {
      color: #00e676;
      text-shadow: 0 0 10px rgba(0, 230, 118, 0.15);
    }
    .val-dest {
      color: #00b0ff;
      text-shadow: 0 0 10px rgba(0, 176, 255, 0.15);
    }
  }

  .clickable-card {
    cursor: pointer;
    transition:
      transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.22s ease,
      border-color 0.22s ease;

    &:hover {
      transform: translateY(-3px);
      border-color: rgba(#e18a00, 0.45) !important;
      box-shadow:
        0 6px 20px rgba(0, 0, 0, 0.55),
        0 0 12px rgba(#e18a00, 0.15);
      .card-label {
        color: #fff;
      }
    }
  }

  span.text-inline {
    margin-left: 1vmin;
  }
}

@media (max-width: 1150px) {
  .quick-stats .stats-grid-wrapper {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .quick-stats .stat-card {
    grid-column: span 1 !important;
    text-align: center !important;
    align-items: center !important;

    .stat-label,
    .stat-value,
    .card-label,
    .card-values {
      justify-content: center !important;
      text-align: center !important;
    }
  }
}
</style>
