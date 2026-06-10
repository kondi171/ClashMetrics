<template>
  <div class="loader-container">
    <!-- Klasa spinnera zmieni się dynamicznie np. na "spinner glory" lub "spinner league" -->
    <div :class="['spinner', type]"></div>
    <p v-if="message" :class="['loader-text', type]">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: "Ładowanie danych klanowych...",
  },
  type: {
    type: String,
    default: "clan",
    // Walidator upewni się, że nikt nie wpisze tam literówki
    validator: (value) => ["glory", "league", "shame", "clan"].includes(value),
  },
});
</script>

<style scoped lang="scss">
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  width: 100%;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &.glory {
    border-left-color: $gloryGreen;
  }

  &.league {
    border-left-color: $leagueOrange;
  }

  &.shame {
    border-left-color: $shameRed;
  }

  &.clan {
    border-left-color: $clanBlue;
  }
}

.loader-text {
  margin-top: 1.2rem;
  color: #94a3b8;
  font-size: 2vmin;
  font-weight: 500;
  letter-spacing: 0.5px;
  &.glory {
    color: $gloryGreen;
  }

  &.league {
    color: $leagueOrange;
  }

  &.shame {
    color: $shameRed;
  }

  &.clan {
    color: $clanBlue;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
