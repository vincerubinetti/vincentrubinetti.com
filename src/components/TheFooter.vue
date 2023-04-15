<template>
  <footer>
    <AppSection class="footer" :dark="true" :background="background">
      &copy; {{ new Date().getFullYear() }} Vincent Rubinetti
    </AppSection>
  </footer>
</template>

<script setup lang="ts">
import background from "@/assets/cello.jpg";
</script>

<style scoped>
.footer {
  padding: 50px !important;
}

.footer :deep(.image) {
  right: 0;
  -webkit-mask-image: linear-gradient(-90deg, #fff8, transparent);
  mask-image: linear-gradient(-90deg, #fff8, transparent);
}
</style>
