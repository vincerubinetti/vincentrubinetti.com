<template>
  <component
    :is="component"
    class="button"
    :href="href"
    :data-outline="outline"
    :data-color="color"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Props = {
  href?: string;
  outline?: boolean;
  color?: "dark" | "fill";
};

const props = defineProps<Props>();

const component = computed(() => (props.href ? "a" : "button"));
</script>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-radius: var(--rounded);
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: none;
  line-height: 1.5em;
  cursor: pointer;
  transition: var(--fast);
  transition-property: background, color, box-shadow, transform;
  z-index: 0;
}

.button:where(:hover, :focus) {
  box-shadow: var(--shadow);
  transform: translate(-1px, -1px);
}

.button:active {
  box-shadow: var(--shadow-inset);
  transform: translate(0, 0);
}

.button[data-outline="true"]:after {
  content: "";
  position: absolute;
  inset: 0;
  border: solid 2px transparent;
  border-radius: inherit;
}

.button[data-outline="true"]:where(:hover, :focus):after {
  animation: outline 0.3s linear;
}

@keyframes outline {
  0%,
  100% {
    border-color: transparent;
    clip-path: inset(0 0 97% 0);
  }

  25% {
    border-color: var(--primary);
    clip-path: inset(0 97% 0 0);
  }
  50% {
    border-color: var(--secondary);
    clip-path: inset(97% 0 0 0);
  }
  75% {
    border-color: var(--tertiary);
    clip-path: inset(0 0 0 97%);
  }
}

.button[data-color="dark"] {
  background: var(--gray);
  color: white;
}

.button[data-color="fill"] {
  background: none;
  color: white;
  letter-spacing: 1px;
  backdrop-filter: blur(5px);
}

.button[data-color="fill"]:hover {
  background: var(--gray);
}

.button[data-color="fill"]:before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    var(--primary),
    var(--secondary),
    var(--tertiary)
  );
  border-radius: inherit;
  opacity: 0.5;

  z-index: -1;
  transition: opacity var(--fast);
}

.button[data-color="fill"]:hover:before {
  opacity: 0;
}

.button > :deep(svg) {
  height: 20px;
  flex-shrink: 0;
}

.button:where(:hover, :focus) > :deep(svg) path {
  stroke-dasharray: var(--length);
  animation: draw 1s both;
}

@keyframes draw {
  0% {
    stroke-dashoffset: var(--length);
    stroke: var(--primary-light);
  }
  33% {
    stroke: var(--secondary-light);
  }
  66% {
    stroke: var(--tertiary-light);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
</style>
