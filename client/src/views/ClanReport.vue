<template>
  <div class="report-view">
    <nav class="report-nav">
      <router-link to="/" class="btn-back"
        ><span>←</span> Dashboard</router-link
      >
    </nav>

    <header class="report-header">
      <h1>Clan<span>Members</span></h1>
      <p>Aktualny przegląd wojsk i poziomów TH</p>
    </header>

    <main class="report-content">
      <div class="control-card">
        <h3>Lista Członków</h3>
        <p>
          Generuje pełne zestawienie graczy wraz z ich tagami i poziomami
          ratusza.
        </p>
        <button class="btn-secondary">Pobierz Skład (.xlsx)</button>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
