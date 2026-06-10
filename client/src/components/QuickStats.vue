<template>
  <div class="stats-grid-wrapper">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  config: { type: Array, required: true },
  // Przykład config: [{ id: 'wars', class: 'wars-card', clickable: true }, ...]
});
defineEmits(["card-click"]);
</script>

<style scoped lang="scss">
.stats-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}
// LINIA 1: Metryki (Suma = 12 kolumn) - ZOPTYMALIZOWANE PROPORCJE
.wars-card {
  grid-column: span 2 !important;
}
.roster-card {
  grid-column: span 3 !important;
} // Zwiększono z 2 na 3 (Koniec z łamaniem linii tekstów!)
.played-card {
  grid-column: span 2 !important;
}
.attendance-card {
  grid-column: span 2 !important;
} // Zmniejszono z 3 na 2 (Krótkie dane, idealnie pasuje)
.clan-dest-card {
  grid-column: span 3 !important;
}

// LINIA 2: Info & Filtry (Suma = 12 kolumn)
.leader {
  grid-column: span 6 !important;
}
.highlight {
  grid-column: span 3 !important;
}
.stat-card:last-child {
  grid-column: span 3 !important;
}
// --- LINIA 1: Pełne wycentrowanie ---
.wars-card,
.roster-card,
.played-card,
.attendance-card,
.clan-dest-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .card-label {
    text-align: center;
    width: 100%;
    justify-content: center;
  }

  .card-values {
    display: flex;
    align-items: baseline;
    justify-content: center;
    width: 100%;
    gap: 6px;

    // Blokada łamania pojedynczych członów etykiet wewnątrz kafelków linii pierwszej
    span {
      white-space: nowrap;
    }
  }
}

// --- LINIA 2: Wyrównanie do lewej ---
.leader,
.highlight,
.stat-card:last-child {
  text-align: left;
  display: flex;
  flex-direction: column;
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

// ==========================================
// FORMATOWANIE WARTOŚCI PIONOWYCH
// ==========================================
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

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2vmin;
  margin-bottom: 3vmin;

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
    &.leader {
      color: $gold;
      border-color: rgba($gold, 0.4);
      background: rgba($gold, 0.05);
    }
    &.attack {
      border-color: rgba($leagueOrange, 0.4);
      background: rgba($leagueOrange, 0.05);
    }
    &.defense {
      border-color: rgba(#e74c3c, 0.4);
      background: rgba(#e74c3c, 0.05);
    }
  }

  /* NOWE UKŁADY DLA PODWÓJNEGO KAFELKA PODSUMOWANIA LIGI */
  .cwl-summary-dash {
    display: contents; /* Pozwala wewnętrznym kartom wejść bezpośrednio do głównej siatki */
  }

  .card-label {
    font-size: 1.5vmin;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .card-values {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 2.4vmin;
    font-weight: 900;
    font-family: "Inter", sans-serif;
    letter-spacing: 0.5px;
    line-height: 1;
    margin-top: auto; /* Wyrównuje do dołu karty analogicznie do stat-value */
    padding-top: 2vmin;

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

  .wars-card {
    border-color: rgba($leagueOrange, 0.4);
    background: rgba($leagueOrange, 0.04);
  }

  .roster-card {
    border-color: rgba($leagueOrange, 0.25);
    background: rgba(255, 255, 255, 0.01);
  }
}
</style>
