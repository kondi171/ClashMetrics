<script setup>
import { ref } from "vue";
import axios from "axios";

const isLoading = ref(false);
const error = ref(null);

const downloadExcel = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Zakładamy, że Twój serwer działa na porcie 3000
    const response = await axios({
      url: "http://localhost:3000/api/cwl-report",
      method: "GET",
      responseType: "blob", // WAŻNE: serwer wysyła plik binarny
    });

    // Tworzenie linku do pobrania pliku
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Raport_CWL.xlsx");
    document.body.appendChild(link);
    link.click();

    // Sprzątanie
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value =
      "Błąd podczas pobierania raportu. Upewnij się, że serwer działa.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="report-view">
    <nav class="report-nav">
      <router-link to="/" class="btn-back">
        <span>←</span> Powrót do Dashboardu
      </router-link>
    </nav>

    <header class="report-header">
      <div class="title-group">
        <h1>CWL<span>Report</span></h1>
        <p>Generowanie statystyk Ligi Wojen Klanów</p>
      </div>
    </header>

    <main class="report-content">
      <div class="control-card">
        <div class="info-section">
          <h3>Eksport Sezonowy</h3>
          <p>
            System pobierze dane z ostatniego zapisanego sezonu CWL, przeliczy
            gwiazdki oraz bonusy i przygotuje plik Excel zgodny z szablonem
            Husarii.
          </p>
        </div>

        <div class="action-section">
          <div v-if="error" class="error-msg">{{ error }}</div>

          <button
            @click="downloadExcel"
            class="btn-download"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">🚀 Generuj i Pobierz .XLSX</span>
            <span v-else class="loader">Generowanie...</span>
          </button>
        </div>
      </div>

      <div class="preview-placeholder">
        <p>Wkrótce: Tutaj pojawi się podgląd tabeli przed pobraniem.</p>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
