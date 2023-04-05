<template>
  <div class="cols">
    <slot />
  </div>
</template>

<style scoped>
.cols {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px 60px;
}
</style>
