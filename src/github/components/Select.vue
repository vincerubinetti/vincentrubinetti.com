<script
  lang="ts"
  setup
  generic="Option extends { value: string | number; label?: string }"
>
import { ChevronDown } from "lucide-vue-next";

type Props = {
  options: Option[];
};

defineProps<Props>();

const model = defineModel<Option["value"]>();
</script>

<template>
  <div class="relative flex grow">
    <select
      class="bg-current/5 p-2 pr-8 transition-all hover:bg-current/10"
      v-model="model"
    >
      <option v-for="{ value, label } in options" :key="value" :value="value">
        {{ label ?? value }}
      </option>
    </select>
    <ChevronDown class="absolute top-1/2 right-2 -translate-y-1/2" />
  </div>
</template>
