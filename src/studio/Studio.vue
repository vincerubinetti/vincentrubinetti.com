<script setup lang="ts">
import {
  IconCpu,
  IconLibrary,
  IconMicrophone,
  IconPiano,
  IconPlug,
  IconRobot,
} from "@tabler/icons-vue";
import setup from "./data/setup.json";
import picture from "./images/studio.jpg?url";

const icons = {
  Machine: IconCpu,
  Software: IconRobot,
  Equipment: IconMicrophone,
  Instruments: IconPiano,
  Plugins: IconPlug,
  "Sample Libraries": IconLibrary,
};
</script>

<template>
  <section class="[--width:300]">
    <h2 class="self-center text-center">Studio</h2>

    <div class="grid grid-cols-2 items-start gap-8 max-md:grid-cols-1">
      <a :href="picture" class="self-stretch overflow-hidden">
        <img
          :src="picture"
          alt=""
          loading="lazy"
          class="size-full object-cover transition-transform hover:scale-110"
        />
      </a>

      <div
        v-for="({ name, items }, index) in setup"
        :key="index"
        class="flex flex-col gap-6 rounded bg-zinc-100 p-4"
        :class="[items.length > 10 && 'row-span-2']"
      >
        <h3>
          <component
            :is="icons[name as keyof typeof icons]"
            class="text-dark opacity-50"
          />
          {{ name }}
        </h3>

        <ul>
          <li v-for="(item, index) in items" :key="index" class="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
