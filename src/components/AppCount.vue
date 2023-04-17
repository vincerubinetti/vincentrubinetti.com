<template>
  <a
    :href="to"
    target="_blank"
    class="count"
    :style="{ flexDirection: flip ? 'row-reverse' : 'row' }"
  >
    <component v-if="icon" :is="icon" class="icon" />
    {{ typeof count === "number" ? formatCount(count || 0) : count }}
  </a>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from "vue";
import { formatCount } from "@/util/string";

type Props = {
  icon?: FunctionalComponent;
  count?: number | string;
  flip?: boolean;
  to?: string;
};

defineProps<Props>();
</script>

<style scoped>
.count {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  padding: 5px;
  color: var(--gray);
  font-size: var(--tiny);
  text-decoration: none;
}

.count[href]:hover {
  color: var(--primary);
}

.icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
</style>
