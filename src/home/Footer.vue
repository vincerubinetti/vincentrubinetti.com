<script setup lang="ts">
import bg from "@/assets/images/cello.jpg?url";
</script>

<template>
  <footer class="dark">
    <div class="absolute inset-0 -z-10 opacity-10">
      <img :src="bg" alt="" class="h-full w-full object-cover" />
    </div>
    &copy; 2026 Vincent Rubinetti
  </footer>
</template>
