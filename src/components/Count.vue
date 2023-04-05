<template>
  <a
    :href="to"
    target="_blank"
    class="count"
    :style="{ flexDirection: flip ? 'row-reverse' : 'row' }"
  >
    <span class="icon">
      <slot></slot>
    </span>
    {{ typeof count === "number" ? formatCount(count || 0) : count }}
  </a>
</template>

<script setup lang="ts">
import { formatCount } from "@/util/string";

type Props = {
  count?: number | string;
  flip?: boolean;
  to?: string;
};

defineProps<Props>();
</script>

<style scoped>
.count {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  color: currentColor;
  opacity: 0.35;
  font-size: var(--tiny);
  text-align: right;
  white-space: nowrap;
  text-decoration: none;
}

.icon {
  display: contents;
}

.icon > :deep(*) {
  position: relative;
  top: -1px;
  height: 15px;
  flex-shrink: 0;
}
</style>
