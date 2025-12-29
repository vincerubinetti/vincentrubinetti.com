<script setup lang="ts">
import { watchEffect } from "vue";
import { ChevronDown } from "lucide-vue-next";

type Props = {
  options: { value: string; label: string }[];
};

const { options } = defineProps<Props>();

const model = defineModel();

/** auto-select first option if none selected */
watchEffect(() => {
  if (model.value === undefined && options.length > 0)
    model.value = options[0].value;
});
</script>

<template>
  <div class="relative flex min-w-0 grow">
    <select
      v-model="model"
      class="min-w-0! grow appearance-none border-none bg-current/5 pr-8"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <ChevronDown class="absolute top-1/2 right-2 -translate-y-1/2" />
  </div>
</template>
