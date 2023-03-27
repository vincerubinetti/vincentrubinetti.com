<template>
  <section>
    <slot />
  </section>
</template>

<style scoped>
section {
  padding: 40px max(40px, calc((100% - 800px) / 2));
}
</style>
