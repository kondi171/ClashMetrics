<script setup>
import { ref } from "vue";
const isLoading = ref(false);
</script>

<template>
  <div class="report-view">
    <nav class="report-nav">
      <router-link to="/" class="btn-back"
        ><span>←</span> Dashboard</router-link
      >
    </nav>

    <header class="report-header">
      <h1>Glory<span>List</span></h1>
      <p>Najlepsi wojownicy klanu Polska Husaria</p>
    </header>

    <main class="report-content">
      <div class="control-card">
        <h3>Eksport Listy Chwały</h3>
        <p>Wybierz kryterium sortowania dla raportu Excel.</p>

        <div class="btn-stack">
          <button class="btn-outline">🏆 Sortuj wg Gwiazdek</button>
          <button class="btn-outline">💥 Sortuj wg Destrukcji</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.btn-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
