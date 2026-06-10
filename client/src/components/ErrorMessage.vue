<template>
  <div :class="['empty-state-container', { 'is-error': isError }]">
    <div class="icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p class="message">{{ message }}</p>

    <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">
      Spróbuj ponownie
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "🔍",
  },
  title: {
    type: String,
    default: "Brak danych",
  },
  message: {
    type: String,
    required: true,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  showRetry: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["retry"]);
</script>

<style scoped lang="scss">
.empty-state-container {
  padding: 3rem 1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  margin: 2rem 0;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
  }

  &.error {
    border: 1px solid rgba(255, 0, 0, 0.3);
    background: rgba(255, 0, 0, 0.05);

    h3 {
      color: #ff6b6b;
    }
  }
}
.retry-btn {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: #ffcc00;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

@media (max-width: 1100px) {
  .empty-state-container h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .empty-state-container h3 {
    font-size: 1.1rem;
  }
}
</style>
