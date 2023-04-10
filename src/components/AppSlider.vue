<template>
  <input
    class="input"
    type="range"
    :value="modelValue"
    @input="onInput"
    @change="onInput"
  />
</template>

<script setup lang="ts">
type Props = {
  modelValue: number;
};

defineProps<Props>();

type Emits = {
  (event: "update:modelValue", value: number): void;
};

const emit = defineEmits<Emits>();

const onInput = (event: Event) =>
  emit("update:modelValue", Number((event.target as HTMLInputElement).value));
</script>

<style scoped>
.input {
  margin: 0;
  padding: 15px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  transition: var(--fast);
  transition-property: filter;
}

.input::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 999px;
  background: var(--primary);
}

.input::-webkit-slider-thumb {
  height: 15px;
  width: 15px;
  margin-top: -5px;
  background: var(--gray);
  border-radius: 999px;
  -webkit-appearance: none;
  appearance: none;
}

.input::-moz-range-track {
  height: 5px;
  border-radius: 999px;
  background: var(--primary);
}

.input::-moz-range-thumb {
  height: 15px;
  width: 15px;
  border: none;
  border-radius: 999px;
  background: var(--gray);
}
</style>
