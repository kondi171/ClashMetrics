<template>
  <footer>
    <p>
      &copy; 2026 Polska Husaria Management System v2.3 • Made By &#64;Kondi
    </p>
  </footer>
</template>

<script setup></script>

<style lang="scss" scoped>
footer {
  flex-shrink: 0;
  text-align: center;
  opacity: 0.4;
  font-size: 1.6vmin;
  padding: 3vmin 0;
  color: #888;
}

@media (max-width: 1100px) {
  footer {
    font-size: 0.9rem !important;
    padding: 2rem 1rem;
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  footer {
    font-size: 0.85rem !important;
    line-height: 1.5;
    padding: 3rem 1rem;
  }
}
</style>
