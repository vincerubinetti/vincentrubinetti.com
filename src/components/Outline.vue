<template>
  <svg class="group draw absolute inset-0 size-full">
    <rect
      class="opacity-0 group-hover:opacity-100"
      width="100%"
      height="100%"
      rx="7.5"
      ry="7.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      pathLength="1"
    />
  </svg>
</template>

<style scoped>
:hover > .draw {
  animation: draw 0.5s linear both;
}

@keyframes draw {
  0% {
    opacity: 0;
    stroke-dashoffset: 1;
    stroke-dasharray: 0.25 0.75;
  }
  50% {
    opacity: 1;
    stroke-dashoffset: 0.5;
    stroke-dasharray: 0.25 0.75;
  }
  100% {
    opacity: 0;
    stroke-dashoffset: 0;
    stroke-dasharray: 0.25 0.75;
  }
}
</style>
