<template>
  <div class="report-view">
    <nav class="report-nav">
      <router-link to="/" class="btn-back"
        ><span>←</span> Dashboard</router-link
      >
    </nav>

    <header class="report-header">
      <h1>Shame<span>List</span></h1>
      <p>Analiza pominiętych ataków i braku aktywności</p>
    </header>

    <main class="report-content">
      <div class="control-card shame">
        <h3>Raport Grzeszników</h3>
        <p>Wykrywa graczy, którzy nie oddali ataków w wyznaczonym terminie.</p>
        <button class="btn-danger">Generuj Listę Wstydu</button>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.control-card.shame {
  border-color: rgba($secondaryColor, 0.3);
  h3 {
    color: $secondaryColor;
  }
}
</style>
