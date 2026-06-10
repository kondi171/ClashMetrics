<script setup>
defineProps({
  activeDetailModal: {
    type: String,
    default: null,
  },
  warsCount: {
    type: Number,
    required: true,
  },
  warPercentages: {
    type: Object,
    required: true,
  },
  warStats: {
    type: Object,
    required: true,
  },
  filterMode: {
    type: String,
    required: true,
  },
  rosterLists: {
    type: Object,
    required: true,
  },
  formattedSeason: {
    type: String,
    required: true,
  },
  attendanceStats: {
    type: Object,
    required: true,
  },
  missedAttacksPlayers: {
    type: Array,
    required: true,
  },
  clanAvgDestruction: {
    type: String,
    required: true,
  },
  changesData: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);
</script>

<template>
  <div
    v-if="activeDetailModal"
    class="detail-modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="detail-modal-box">
      <header class="detail-modal-header">
        <h4 v-if="activeDetailModal === 'wars'">📊 SZCZEGÓŁY BILANSU WOJEN</h4>
        <h4 v-else-if="activeDetailModal === 'roster'">
          👥 STRUKTURA KADRY KLANOWEJ
        </h4>
        <h4 v-else-if="activeDetailModal === 'played'">
          📅 PODSUMOWANIE OKRESU LIGOWEGO
        </h4>
        <h4 v-else-if="activeDetailModal === 'attendance'">
          🎯 ANALIZA FREKWENCJI ATAKÓW
        </h4>
        <h4 v-else-if="activeDetailModal === 'destruction'">
          💥 METRYKA ZNISZCZEŃ KLANU
        </h4>
        <h4 v-else-if="activeDetailModal === 'changes'">
          🕒 HISTORIA ROTACJI KADROWYCH
        </h4>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="detail-modal-body">
        <div
          v-if="activeDetailModal === 'wars'"
          class="modal-data-layout text-center"
        >
          <p>
            Łączna liczba rozegranych starć w wybranym filtrze wynosi
            <strong>{{ warsCount }}</strong> wojen.
          </p>
          <div class="percentage-bar">
            <div class="p-win" :style="{ width: warPercentages.wins + '%' }">
              {{ warPercentages.wins }}%
            </div>
            <div class="p-draw" :style="{ width: warPercentages.draws + '%' }">
              {{ warPercentages.draws }}%
            </div>
            <div class="p-loss" :style="{ width: warPercentages.losses + '%' }">
              {{ warPercentages.losses }}%
            </div>
          </div>
          <ul class="stats-breakdown">
            <li>
              🟢 <strong>Zwycięstwa:</strong> {{ warStats.wins }} z
              {{ warsCount }}
            </li>
            <li>
              🟡 <strong>Remisy:</strong> {{ warStats.draws }} z
              {{ warsCount }}
            </li>
            <li>
              🔴 <strong>Porażki:</strong> {{ warStats.losses }} z
              {{ warsCount }}
            </li>
          </ul>
        </div>

        <div
          v-else-if="activeDetailModal === 'roster'"
          class="modal-data-layout"
        >
          <div class="roster-split-container">
            <div class="roster-column">
              <h5>
                {{
                  filterMode === "season"
                    ? "⚔️ W BOJU (" + rosterLists.primary.length + ")"
                    : "💎 ŻELAZNY SKŁAD (" + rosterLists.primary.length + ")"
                }}
              </h5>
              <div class="names-list custom-scrollbar">
                <span
                  v-for="p in rosterLists.primary"
                  :key="p.tag || p.name"
                  class="name-badge text-ellipsis"
                  >{{ p.name }}</span
                >
                <p v-if="!rosterLists.primary.length" class="empty-info">
                  Brak graczy
                </p>
              </div>
            </div>
            <div class="roster-column">
              <h5>
                {{
                  filterMode === "season"
                    ? "💤 NA ŁAWCE (" + rosterLists.secondary.length + ")"
                    : "🔄 ROTOWANI (" + rosterLists.secondary.length + ")"
                }}
              </h5>
              <div class="names-list custom-scrollbar">
                <span
                  v-for="p in rosterLists.secondary"
                  :key="p.tag || p.name"
                  class="name-badge benched text-ellipsis"
                  >{{ p.name }}</span
                >
                <p v-if="!rosterLists.secondary.length" class="empty-info">
                  Brak graczy
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="activeDetailModal === 'played'"
          class="modal-data-layout text-center"
        >
          <div class="big-metric">{{ Math.floor(warsCount / 7) }}</div>
          <p class="metric-desc">Pełnych Turniejów Ligi Wojny Klanów</p>
          <div class="range-info-box">
            <p>
              Analizujesz aktualnie przedział: <br /><strong>{{
                formattedSeason
              }}</strong>
            </p>
            <small
              >Zsumowano dane z <strong>{{ warsCount }}</strong> unikalnych dni
              wojny klanu.</small
            >
          </div>
        </div>

        <div
          v-else-if="activeDetailModal === 'attendance'"
          class="modal-data-layout"
        >
          <p class="text-center">
            Klan oddał <strong>{{ attendanceStats.totalDone }}</strong> z
            <strong>{{ attendanceStats.totalPossible }}</strong>
            przysługujących ataków.
          </p>

          <h5 class="sub-section-title">⚠️ OSOBY, KTÓRE OPUSZCIŁY ATAKI:</h5>
          <div class="missed-list custom-scrollbar">
            <div
              v-for="p in missedAttacksPlayers"
              :key="p.name"
              class="missed-row"
            >
              <span class="player-name">{{ p.name }}</span>
              <span class="missed-count"
                >❌ Brakujące ataki: <strong>{{ p.missed }}</strong></span
              >
            </div>
            <p v-if="!missedAttacksPlayers.length" class="empty-info green">
              🔥 100% perfekcyjna dyscyplina! Nikt nie odpuścił ataku!
            </p>
          </div>
        </div>

        <div
          v-else-if="activeDetailModal === 'destruction'"
          class="modal-data-layout text-center"
        >
          <div class="big-metric light-blue">{{ clanAvgDestruction }}%</div>
          <p class="metric-desc">Globalna skuteczność niszczenia baz</p>
          <div class="formula-box">
            <p>💡 <strong>Jak to liczymy?</strong></p>
            <small
              >Jest to całkowity zsumowany procent destrukcji zdobyty przez
              wszystkich graczy, podzielony przez sumaryczną ilość maksymalnie
              możliwych podejść ofensywnych. Odzwierciedla realną siłę klanu w
              niszczeniu wiosek rywali.</small
            >
          </div>
        </div>

        <div
          v-else-if="activeDetailModal === 'changes'"
          class="modal-data-layout"
        >
          <p class="text-center">
            W wybranym zakresie czasowym odnotowano
            <strong>{{ changesData.count }}</strong> modyfikacji składu
            wyjściowego.
          </p>

          <h5 class="sub-section-title">
            🕒 HISTORIA ROTACJI W LINII WOJENNEJ:
          </h5>
          <div class="changes-list custom-scrollbar">
            <div
              v-for="(log, index) in changesData.log"
              :key="index"
              class="change-row"
            >
              <div class="change-meta">
                <span class="change-season">{{ log.formattedSeason }}</span>
                <span class="change-war">{{ log.war }}</span>
              </div>
              <div class="change-action">
                <span class="p-out" title="Zszedł na ławkę rezerwowych">{{
                  log.out
                }}</span>
                <font-awesome-icon
                  icon="fa-solid fa-right-long"
                  class="swap-icon"
                />
                <span class="p-in" title="Wszedł do składu bojowego">{{
                  log.in
                }}</span>
              </div>
              <span class="change-type-badge">{{ log.type }}</span>
            </div>
            <p v-if="!changesData.log.length" class="empty-info green">
              ✅ Pełna stabilizacja! Brak jakichkolwiek zmian kadrowych w tym
              okresie.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ==========================================
// STYLIZACJA SYSTEMU MODALI DANYCH
// ==========================================
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Zwiększony z-index, aby na pewno przykrywał Footer i dashboard */
  animation: fadeIn 0.18s ease-out;
}

.detail-modal-box {
  background: #151515;
  border: 1px solid #2d2d2d;
  border-top: 3px solid #e18a00;
  border-radius: 8px;
  width: 92%;
  max-width: 650px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.detail-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #1c1c1c;
  border-bottom: 1px solid #252525;

  h4 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #e2e8f0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #a0aec0;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1;

    &:hover {
      color: #fff;
    }
  }
}

.detail-modal-body {
  padding: 20px;
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.5;
}

.percentage-bar {
  display: flex;
  width: 100%;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
  font-size: 0.75rem;
  font-weight: 800;
  text-align: center;
  line-height: 24px;
  color: white;

  .p-win {
    background: #196b24;
  }
  .p-draw {
    background: #6b6b6b;
  }
  .p-loss {
    background: #a31d1d;
  }
}

.roster-split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .roster-column {
    h5 {
      margin: 0 0 12px 0;
      font-size: 0.85rem;
      font-weight: 800;
      color: #e2e8f0;
      border-bottom: 1px solid #2d2d2d;
      padding-bottom: 6px;
      letter-spacing: 0.3px;
    }

    .names-list {
      max-height: 280px;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 6px;
      padding-right: 4px;
    }
  }
}

.name-badge {
  background: rgba(#196b24, 0.15);
  border-left: 3px solid #196b24;
  color: #a7f3d0;
  padding: 5px 8px;
  font-size: 0.8rem;
  border-radius: 0 4px 4px 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  &.benched {
    background: rgba(#6b6b6b, 0.15);
    border-left: 3px solid #6b6b6b;
    color: #e2e8f0;
  }
}

.modal-data-layout {
  .big-metric {
    font-size: 3.5rem;
    font-weight: 900;
    color: #ffd700;
    line-height: 1;
    margin-bottom: 5px;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.2);

    &.light-blue {
      color: #00b0ff;
      text-shadow: 0 0 15px rgba(0, 176, 255, 0.2);
    }
  }

  .metric-desc {
    font-size: 0.8rem;
    color: #a0aec0;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
  }
}

.stats-breakdown {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
}

.missed-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}
.missed-row {
  display: flex;
  justify-content: space-between;
  background: #1d1d1d;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid #252525;
  .player-name {
    font-weight: 700;
    color: #fca5a5;
  }
  .missed-count {
    font-size: 0.8rem;
    color: #a0aec0;
  }
}

.range-info-box,
.formula-box {
  background: #1c1c1c;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #252525;
  margin-top: 10px;
  p {
    margin: 0 0 5px 0;
  }
  small {
    color: #8a99ad;
    display: block;
    line-height: 1.4;
  }
}

.sub-section-title {
  margin: 20px 0 0 0;
  font-size: 0.8rem;
  font-weight: 800;
  color: #fca5a5;
  letter-spacing: 0.5px;
}

.empty-info {
  grid-column: 1 / -1;
  margin: 15px 0;
  color: #8a99ad;
  font-size: 0.85rem;
  text-align: center;
  font-style: italic;
  &.green {
    color: #4ade80;
    font-weight: 600;
  }
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.changes-list {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding-right: 4px;
}

.change-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1d1d1d;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #252525;
  gap: 12px;

  .change-meta {
    display: flex;
    flex-direction: column;
    min-width: 90px;

    .change-season {
      font-size: 0.72rem;
      color: #a0aec0;
      font-weight: 600;
    }
    .change-war {
      font-size: 0.82rem;
      color: #fff;
      font-weight: 700;
    }
  }

  .change-action {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    justify-content: center;
    overflow: hidden;

    .p-out,
    .p-in {
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }

    .p-out {
      color: #fca5a5;
      font-weight: 600;
      text-decoration: line-through;
      opacity: 0.75;
    }

    .swap-icon {
      color: #e18a00;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .p-in {
      color: #4ade80;
      font-weight: 700;
    }
  }

  .change-type-badge {
    font-size: 0.68rem;
    background: rgba(#e18a00, 0.1);
    color: #ffb74d;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border: 1px solid rgba(#e18a00, 0.18);
    flex-shrink: 0;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: #151515;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
