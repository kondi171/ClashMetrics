<script setup>
import { useRouter } from "vue-router";
import Footer from "../components/Footer.vue";
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

    <Footer />
  </div>
</template>
<style scoped lang="scss">
.dashboard {
  height: 100vh;
  width: 100vw;
  background-color: $backgroundColor;
  color: $textColor;
  font-family: $textFont;
  padding: 2vmin 5vmin;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  .dashboard-header {
    text-align: center;
    margin-bottom: 4vmin;
    flex-shrink: 0;

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2vmin;

      h1 {
        font-family: $subtitleFont;
        font-size: 8vmin;
        margin: 0;
        color: $primaryColor;
        line-height: 1;
        text-shadow:
          0.4vmin 0.4vmin 0px $secondaryColor,
          0.8vmin 0.8vmin 1.5vmin rgba(0, 0, 0, 0.6);

        span {
          font-family: $subtitleFont;
          color: $textColor;
        }
      }
      .icon {
        font-size: 8vmin;
      }
    }
    .subtitle {
      font-size: 2vmin;
      opacity: 0.7;
      margin-top: 0.5vmin;
    }
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start; // Kluczowa zmiana: wyrównanie do lewej
    align-content: center;
    gap: 3vmin;
    max-width: 1200px; // To pilnuje, żeby rzędy nie były za szerokie
    width: 100%;
    margin: 0 auto; // To centruje CAŁY kontener z kartami na środku strony
    flex-grow: 1;
    overflow-y: auto;

    padding-left: 2vmin;
  }

  .card {
    background: #2a2a2a;
    border-radius: 2.5vmin;
    padding: 3.5vmin;
    border: 1px solid rgba($textColor, 0.05);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    // Przywrócona szerokość - celujemy w ~350-380px
    flex: 0 1 360px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1.5vmin 3.5vmin rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translateY(-0.8vmin);
      background: #333333;
      border-color: rgba($primaryColor, 0.3);
    }

    h3 {
      font-family: $subtitleFont;
      color: $primaryColor;
      font-size: 3.2vmin;
      margin-bottom: 1.5vmin;
      text-shadow: 0.3vmin 0.3vmin 0px #000000;
    }

    p {
      line-height: 1.5;
      margin-bottom: 2.5vmin;
      font-size: 1.8vmin;
      color: #bbbbbb;
    }
  }

  button {
    font-family: $titleFont;
    padding: 1.2vmin 2.5vmin;
    border-radius: 1.2vmin;
    border: none;
    cursor: pointer;
    font-size: 1.6vmin; // Zgrabniejszy font
    text-transform: uppercase;
    letter-spacing: 0.1vmin;

    width: fit-content;
    align-self: flex-start;
    margin-top: auto;

    &:active {
      transform: Scale(0.96);
    }
  }

  .btn-primary {
    background-color: $primaryColor;
    color: #1a1a1a;
    box-shadow: 0 0.5vmin 0 #b38f00;
  }

  .btn-secondary {
    background-color: $textColor;
    color: #1a1a1a;
    box-shadow: 0 0.5vmin 0 #888888;
  }

  .btn-danger {
    background-color: $secondaryColor;
    color: white;
    box-shadow: 0 0.5vmin 0 #800026;
  }

  .btn-outline {
    background: transparent;
    border: 0.3vmin solid $primaryColor;
    color: $primaryColor;
    box-shadow: 0 0.4vmin 0 rgba($primaryColor, 0.1);
  }
}

@media (max-width: 768px) {
  .dashboard {
    height: auto;
    overflow-y: visible;
    padding: 5vmin;

    .card {
      flex: 1 1 100%;
      padding: 6vmin;
      h3 {
        font-size: 6vmin;
      }
      p {
        font-size: 4vmin;
      }
    }

    button {
      width: 100%;
      font-size: 4.5vmin;
      padding: 4vmin;
    }
  }
}
</style>
