<template>
  <div class="floating-action-panel">
    <button
      @click="$emit('export-excel')"
      class="action-btn excel-btn"
      data-tooltip="Eksportuj tabelę do Excela"
    >
      <font-awesome-icon icon="fa-solid fa-file-excel" />
    </button>

    <button
      @click="$emit('open-info')"
      class="action-btn info-btn"
      data-tooltip="Informacje o systemie"
    >
      <font-awesome-icon icon="fa-solid fa-circle-question" />
    </button>
  </div>
</template>

<script setup>
defineEmits(["export-excel", "open-info"]);
</script>

<style scoped lang="scss">
.floating-action-panel {
  position: fixed;
  bottom: 25px;
  right: 25px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 999;

  .action-btn {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-3px) scale(1.05);
    }

    @media (min-width: 1024px) {
      &[data-tooltip] {
        &::after {
          content: attr(data-tooltip);
          position: absolute;
          right: 65px;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #f1f5f9;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 6px 12px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        &::before {
          content: "";
          position: absolute;
          right: 59px;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent #1e293b;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        &:hover {
          &::after,
          &::before {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      }
    }
  }

  .excel-btn {
    background: linear-gradient(135deg, #1d6f42, #107c41);
  }
  .info-btn {
    background: linear-gradient(135deg, #2b3b4c, #1f2937);
  }
}
</style>
