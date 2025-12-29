<script setup lang="ts">
import { Bot, Cpu, Drum, Library, MicVocal, Plug } from "lucide-vue-next";
import setup from "./data/setup.json";
import picture from "./images/studio.jpg?url";

const icons = { Bot, Cpu, Drum, Library, MicVocal, Plug };
</script>

<template>
  <section>
    <h2>Studio</h2>

    <div class="grid grid-cols-2 items-start gap-4 max-md:grid-cols-1">
      <a :href="picture" class="self-stretch overflow-hidden">
        <img
          :src="picture"
          alt=""
          loading="lazy"
          class="size-full object-cover transition-transform hover:scale-110"
        />
      </a>

      <div
        v-for="({ name, icon, items }, index) in setup"
        :key="index"
        class="flex flex-col gap-6 rounded bg-zinc-100 p-4"
        :class="[items.length > 10 && 'row-span-2']"
      >
        <h3>
          <component
            :is="icons[icon as keyof typeof icons]"
            class="text-zinc-500"
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
