<script setup lang="ts">
type Props = {
  src: string;
};

defineProps<Props>();
</script>

<template>
  <svg viewBox="-50 -50 100 100" width="100%" height="100%">
    <defs>
      <filter id="burn-filter">
        <feComponentTransfer>
          <feFuncR type="linear">
            <animate
              attributeName="intercept"
              dur="1s"
              values="-1;0"
              fill="freeze"
            />
          </feFuncR>
        </feComponentTransfer>
        <feColorMatrix
          type="matrix"
          values="
                1 0 0 0 0
                1 0 0 0 0
                1 0 0 0 0
                0 0 0 1 0"
        />
      </filter>
    </defs>

    <image
      :xlink:href="src"
      x="-50"
      y="-50"
      width="100"
      height="100"
      filter="url(#burn-filter)"
    />
  </svg>
</template>
