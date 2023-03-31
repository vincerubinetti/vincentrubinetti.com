<template>
  <input class="input" type="range" />
</template>

<style scoped>
.input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  margin: 0;
  padding: 10px 25px;
  cursor: pointer;
}

.input[type="range"]:focus {
  outline: none;
}

.input[type="range"]::-webkit-slider-runnable-track {
  background-color: var(--a);
  border-radius: 999px;
  height: 10px;
}

.input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -5px;
  background-color: var(--dark);
  border-radius: 999px;
  height: 20px;
  width: 20px;
}

.input[type="range"]:focus::-webkit-slider-thumb {
  outline: 3px solid var(--dark);
  outline-offset: 0.125rem;
}

.input[type="range"]::-moz-range-track {
  background-color: var(--a);
  border-radius: 999px;
  height: 10px;
}

.input[type="range"]::-moz-range-thumb {
  background-color: var(--dark);
  border: none;
  border-radius: 999px;
  height: 20px;
  width: 20px;
}

.input[type="range"]:focus::-moz-range-thumb {
  outline: 3px solid var(--dark);
  outline-offset: 0.125rem;
}
</style>
