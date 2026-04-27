<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const navigateTo = (routeName) => {
  router.push({ name: routeName });
};
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="logo-section">
        <span class="icon">🛡️</span>
        <h1>Clash<span>Metrics</span></h1>
      </div>
      <p class="subtitle">System Zarządzania Klanem Polska Husaria</p>
    </header>

    <main class="stats-grid">
      <div class="card cwl-card">
        <div class="card-content">
          <h3>Ligi Wojen</h3>
          <p>
            Szczegółowy podgląd gwiazdek, bonusów i statystyk z obecnego sezonu
            CWL.
          </p>
          <button @click="navigateTo('CwlReport')" class="btn-primary">
            Otwórz Panel
          </button>
        </div>
      </div>

      <div class="card glory-card">
        <div class="card-content">
          <h3>Lista Chwały</h3>
          <p>
            Rankingi najlepszych graczy. Gwiazdki, procenty i totalny
            destruction.
          </p>
          <button @click="navigateTo('GloryReport')" class="btn-outline">
            Zobacz Rankingi
          </button>
        </div>
      </div>

      <div class="card clan-card">
        <div class="card-content">
          <h3>Skład Klanu</h3>
          <p>
            Zarządzanie listą członków, poziomy Town Hall i analiza aktywności
            klanowiczów.
          </p>
          <button @click="navigateTo('ClanReport')" class="btn-secondary">
            Zarządzaj Składem
          </button>
        </div>
      </div>

      <div class="card shame-card">
        <div class="card-content">
          <h3>Lista Wstydu</h3>
          <p>
            Automatyczne wykrywanie pominiętych ataków i analiza "grzeszników"
            wojennych.
          </p>
          <button @click="navigateTo('ShameReport')" class="btn-danger">
            Sprawdź Raport
          </button>
        </div>
      </div>
    </main>

    <footer class="dashboard-footer">
      <p>&copy; 2026 Polska Husaria Management System • v2.0</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background-color: $backgroundColor;
  color: $textColor;
  font-family: $textFont;
  padding: 4vmin;

  .dashboard-header {
    text-align: center;
    margin-bottom: 8vmin;

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5vmin;
      margin-bottom: 1vmin;

      h1 {
        font-family: $subtitleFont;
        font-size: 8vmin;
        margin: 0;
        color: $primaryColor;
        letter-spacing: 2px;
        line-height: 1;
        text-shadow:
          -2px -2px 0 #800026,
          2px -2px 0 #800026,
          -2px 2px 0 #800026,
          2px 2px 0 #800026,
          5px 5px 0px $secondaryColor,
          8px 8px 15px rgba(0, 0, 0, 0.6);

        span {
          font-family: $subtitleFont;
          padding-left: 0.5rem;
          color: $textColor;
          text-shadow:
            2px 2px 0px #000000,
            5px 5px 0px #000000;
        }
      }

      .icon {
        font-size: 8vmin;
        filter: drop-shadow(4px 4px 0px $secondaryColor);
      }
    }

    .subtitle {
      font-size: 2vmin;
      opacity: 0.9;
      font-style: italic;
      color: #aaaaaa;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 4vmin;
    max-width: 1400px;
    margin: 0 auto;
  }

  .card {
    background: #2a2a2a;
    border-radius: 24px;
    padding: 5vmin;
    border: 1px solid rgba($textColor, 0.05);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    flex-direction: column;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translateY(-10px);
      background: #333333;
      border-color: rgba($primaryColor, 0.3);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    h3 {
      font-family: $titleFont;
      color: $primaryColor;
      font-size: 3vmin;
      margin-top: 0;
      margin-bottom: 2vmin;
      letter-spacing: 1px;
      text-shadow: 2px 2px 0px #000000;
    }

    p {
      line-height: 1.6;
      margin-bottom: 3vmin;
      min-height: 8vmin;
      font-size: 2vmin;
      color: #dddddd;
    }
  }

  button {
    font-family: $titleFont;
    padding: 1vmin 1.5vmin;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 2vmin;
    text-transform: uppercase;
    letter-spacing: 1px;
    width: 100%;

    &:active {
      transform: Scale(0.96);
    }
  }

  .btn-primary {
    background-color: $primaryColor;
    color: #1a1a1a;
    box-shadow: 0 5px 0 #b38f00;

    &:hover {
      background-color: $hoverColor;
      box-shadow: 0 7px 0 #997a00;
    }
  }

  .btn-secondary {
    background-color: $textColor;
    color: #1a1a1a;
    box-shadow: 0 5px 0 #888888;

    &:hover {
      background-color: #eeeeee;
    }
  }

  .btn-danger {
    background-color: $secondaryColor;
    color: white;
    box-shadow: 0 5px 0 #800026;

    &:hover {
      background-color: #ff1a53;
    }
  }

  .btn-outline {
    background: transparent;
    border: 3px solid $primaryColor;
    color: $primaryColor;
    box-shadow: 0 5px 0 rgba($primaryColor, 0.2);

    &:hover {
      background: $primaryColor;
      color: #1a1a1a;
    }
  }

  .dashboard-footer {
    margin-top: 7vmin;
    text-align: center;
    opacity: 0.4;
    font-size: 2vmin;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 2vmin;
    .dashboard-header h1 {
      font-size: 3vmin;
    }
    .card {
      padding: 2vmin;
    }
  }
}
</style>
