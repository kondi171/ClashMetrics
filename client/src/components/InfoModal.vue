<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["close"]);
</script>
<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <h2>
            <font-awesome-icon icon="fa-solid fa-circle-question" /> System
            Analizy Wojennej
          </h2>
          <button @click="$emit('close')" class="close-btn">&times;</button>
        </header>

        <main class="modal-body">
          <h3>Instrukcja i Metryki Systemu</h3>
          <p>
            Witaj w systemie zarządzania i analizy statystyk klanu
            <strong>Polska Husaria</strong>. System automatycznie przelicza
            efektywność każdego gracza na podstawie poniższych reguł:
          </p>

          <hr class="modal-divider" />

          <section class="modal-section">
            <h4>⚔️ Skuteczność Ofensywna</h4>
            <table class="modal-info-table">
              <tbody>
                <tr class="rank-perfect">
                  <td><strong>Fioletowa (Perfekcyjna)</strong></td>
                  <td>Skuteczność dokładnie 3.0 gwiazdki na atak</td>
                </tr>
                <tr class="rank-good">
                  <td><strong>Zielona (Świetna)</strong></td>
                  <td>Skuteczność od 2.5 do 2.99 gwiazdki na atak</td>
                </tr>
                <tr class="rank-neutral">
                  <td><strong>Żółta (Stabilna)</strong></td>
                  <td>Skuteczność od 2.0 do 2.49 gwiazdki na atak</td>
                </tr>
                <tr class="rank-negative">
                  <td><strong>Czerwona (Słaba)</strong></td>
                  <td>Skuteczność poniżej 2.0 gwiazdki na atak</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="modal-section">
            <h4>🛡️ Skuteczność Defensywna</h4>
            <table class="modal-info-table">
              <tbody>
                <tr class="rank-perfect">
                  <td><strong>Fioletowa (Twierdza)</strong></td>
                  <td>Średnio do 1.50 straconych gwiazdek</td>
                </tr>
                <tr class="rank-good">
                  <td><strong>Zielona (Zamek)</strong></td>
                  <td>Średnio od 1.51 do 2.00 straconych gwiazdek</td>
                </tr>
                <tr class="rank-neutral">
                  <td><strong>Żółta (Wioska)</strong></td>
                  <td>Średnio od 2.01 do 2.50 straconych gwiazdek</td>
                </tr>
                <tr class="rank-negative">
                  <td><strong>Czerwona (Szałas)</strong></td>
                  <td>Średnio powyżej 2.50 straconych gwiazdek</td>
                </tr>
              </tbody>
            </table>
          </section>
          <p>
            Ponieważ głównie skupiamy się na skuteczności po gwiazdkach,
            skuteczność zniszczeń jest dodatkowym wskaźnikiem, który pomaga
            zrozumieć, jak blisko byliśmy do zdobycia dodatkowej gwiazdki.
            Zniszczczenia pomagają również ocenić, którego gracza umieścić na
            podium, gdy kilku graczy ma tą samą ilość gwiazdek za pomocą
            <strong>Sortowania Wielopoziomowego</strong>.
          </p>
          <section class="modal-section penalty-box">
            <h4>
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
              Sprawiedliwość rankingowa i Brak Udziału
            </h4>
            <p>
              Aby uniknąć nieuczciwej klasyfikacji, każda wojna, w której gracz
              miał przypisany status
              <strong>"BRAK UDZIAŁU"</strong>, jest kalkulowana jako karna.
              Oznacza to, że nawet jeśli gracz nie uczestniczył w wojnie, jego
              statystyki będą odzwierciedlać tę nieobecność w sposób, który
              wpływa na jego ogólną ocenę.
            </p>
            <div class="penalty-values">
              <span><strong>Karne:</strong> 3 Gwiazdki</span>
              <span><strong>Karne:</strong> 100%</span>
            </div>
            <p>
              Dzięki temu system sprawiedliwie ocenia aktywność i skuteczność
              każdego gracza. Zachęcamy wszystkich do regularnego udziału w
              wojnach, aby utrzymać lub poprawić swoją pozycję w rankingu!
            </p>
          </section>
        </main>

        <footer class="modal-footer">
          <button @click="$emit('close')" class="confirm-btn">
            Zrozumiałem
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(6, 9, 14, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, #0f172a, #050b14);
  border: 2px solid #1e293b;
  border-radius: 16px;
  width: 92%;
  max-width: 550px;
  box-shadow:
    0 0 30px rgba(0, 0, 0, 0.6),
    0 0 15px rgba(59, 130, 246, 0.1);
  overflow: hidden;
  color: #f1f5f9;
  font-family: "Inter", sans-serif;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .modal-header {
    background: #111827;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #1e293b;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #dc2626, #3b82f6);
    }

    h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #3b82f6;
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-size: 1.4rem;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: #ef4444;
        color: #ffffff;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        transform: rotate(90deg);
      }
    }
  }

  .modal-body {
    padding: 24px;
    max-height: 65vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
      &:hover {
        background: #3b82f6;
      }
    }

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
    }

    p {
      font-size: 0.95rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .modal-divider {
      border: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #334155, transparent);
      margin: 24px 0;
    }
  }

  .modal-section {
    margin-bottom: 28px;

    h4 {
      margin-top: 0;
      margin-bottom: 14px;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-left: 3px solid #3b82f6;
      padding-left: 10px;
    }

    &:nth-of-type(2) h4 {
      border-left-color: #f59e0b;
    }
  }

  .modal-info-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;

    tr {
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.01) translateX(4px);
      }

      td {
        padding: 12px 16px;
        font-size: 0.9rem;
        background: rgba(30, 41, 59, 0.4);

        &:first-child {
          border-radius: 8px 0 0 8px;
          font-weight: 700;
          width: 35%;
        }

        &:last-child {
          border-radius: 0 8px 8px 0;
          color: #cbd5e1;
          text-align: right;
        }
      }
      &.rank-perfect td {
        /* Przywracamy standardowe, bezproblemowe obramowanie */
        border-left: 4px solid #a855f7;

        &:first-child {
          border-radius: 8px 0 0 8px;
          color: #c084fc; /* Jaśniejszy fiolet dla tekstu, żeby był czytelny */

          /* Przepiękny, fioletowy efekt poświaty/świecenia (glow) */
          text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        &:last-child {
          border-radius: 0 8px 8px 0;
        }
      }
      &.rank-good td {
        border-left: 4px solid #10b981;
        &:first-child {
          color: #34d399;
          text-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
        }
      }

      &.rank-neutral td {
        border-left: 4px solid #f59e0b;
        &:first-child {
          color: #fbbf24;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
        }
      }

      &.rank-negative td {
        border-left: 4px solid #ef4444;
        &:first-child {
          color: #f87171;
          text-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
        }
      }
    }
  }

  .penalty-box {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.07),
      rgba(0, 0, 0, 0.2)
    );
    border: 1px dashed rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    padding: 20px;
    margin-top: 10px;
    box-shadow: inset 0 0 15px rgba(239, 68, 68, 0.05);
    text-align: justify;
    h4 {
      color: #f87171 !important;
      border-left-color: #ef4444 !important;
      text-align: left;
    }

    p {
      color: #cbd5e1;
      font-size: 0.9rem;
      margin-bottom: 16px;
    }

    .penalty-values {
      display: flex;
      gap: 16px;
      margin: 16px 0;

      span {
        flex: 1;
        background: #090d16;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.2);
        text-align: center;
        font-size: 0.9rem;
        color: #fca5a5;

        strong {
          color: #ef4444;
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
      }
    }

    small {
      color: #64748b;
      display: block;
      line-height: 1.4;
      font-style: italic;
    }
  }

  .modal-footer {
    padding: 16px 24px;
    background: #0b0f19;
    border-top: 2px solid #1e293b;
    display: flex;
    justify-content: flex-end;

    .confirm-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 0.85rem;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;

  .modal-content {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;

  .modal-content {
    transform: translateY(30px) scale(0.96);
  }
}
@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
