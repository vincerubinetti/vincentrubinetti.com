<script
  lang="ts"
  setup
  generic="Option extends { value: string | number; label?: string }"
>
import { IconChevronDown } from "@tabler/icons-vue";

type Props = {
  options: Option[];
};

defineProps<Props>();

const model = defineModel<Option["value"]>();
</script>

<template>
  <div class="relative flex grow">
    <select class="bg-current/5 p-2 pr-8 hover:bg-current/10" v-model="model">
      <option v-for="{ value, label } in options" :key="value" :value="value">
        {{ label ?? value }}
      </option>
    </select>
    <IconChevronDown class="absolute top-1/2 right-2 -translate-y-1/2" />
  </div>
</template>
