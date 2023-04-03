<template>
  <section>
    <slot />
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px max(40px, calc((100% - 1000px) / 2));
}

@media (max-width: 600px) {
  section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
