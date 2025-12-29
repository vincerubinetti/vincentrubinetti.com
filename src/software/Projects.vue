<script setup lang="ts">
import { orderBy, pick } from "lodash-es";
import { ChevronDown, ExternalLink, TriangleAlert } from "lucide-vue-next";
import * as logos from "@/images/logos";
import { renderMarkdown } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import projects from "./data/projects.json";
import images from "./images/projects";
import List from "./List.vue";

/** project order */
const order = [
  "Lab Website Template",
  "SVG to PNG",
  "Human Microbiome Compendium",
  "Exploring Cancer in Colorado",
  "NIH Reporting",
  "3Blue1Brown.com",
  "3Blue1Brown Dubbing",
  "Simplex",
  "GenePlexus",
  "Manubot",
  "Adage",
  "Connectivity Search",
  "Het.io",
  "mygeneset.info",
  "Misc. Logos",
  "Word Spot",
  "STRchive",
  "Word Lapse",
  "Preprint Similarity Search",
  "Set",
  "Word4Word",
  "Wall of Software",
  "DBMI Screensaver",
  "MIDI Humanizer",
  "Using the Music of 3Blue1Brown",
  "Lab Website Template Poster",
  "Redirects",
  "Intro to SVGs",
  "hclust",
  "3Blue1Brown Captions",
  "Monarch",
  "Preprint Bot",
  "Mute Tabs By URL",
];

/** displayed projects */
const _projects = orderBy(
  projects.map(({ name, ...project }) => ({
    name,
    ...project,
    images: images[name.toLowerCase()] ?? [],
  })),
  (project) => {
    const index = order.indexOf(project.name);
    return index === -1 ? 999 : index;
  },
);
</script>

<template>
  <section>
    <h2><Dash flip />Projects</h2>

    <div class="grid grid-cols-3 gap-8 max-md:grid-cols-2 max-sm:grid-cols-1">
      <!-- project card -->
      <div
        v-for="(
          {
            images,
            name,
            description,
            site,
            repo,
            feat,
            work,
            base,
            tech,
            libs,
            warning,
          },
          index
        ) in _projects"
        :key="index"
        class="bg-light paper flex flex-col"
      >
        <Carousel
          v-if="images.length"
          :slides="images.map((image) => ({ image }))"
        />
        <div
          v-else
          class="grid aspect-square place-items-center font-sans text-4xl text-current/50"
          :style="{ background: `oklch(90% 0.025 ${index * 30})` }"
        >
          {{
            name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
          }}
        </div>

        <div
          class="absolute top-0 right-0 left-0 z-10 flex gap-2 bg-linear-to-b from-black/25 from-0% to-transparent to-100% p-2"
        >
          <span
            v-if="warning"
            :title="warning"
            class="size-[1em] cursor-help"
            tabindex="0"
          >
            <TriangleAlert class="fill-orange-300" />
          </span>

          <div class="grow" />

          <component
            v-for="(logo, name, index) in pick(logos, base)"
            :key="index"
            :is="logo"
            :title="name"
            class="size-[1em]"
          />
        </div>

        <a :href="site || repo" class="button-sm" :title="name">
          {{ name }}
        </a>

        <details name="project">
          <summary class="button-sm w-full" aria-label="Details">
            <ChevronDown />
          </summary>

          <div class="flex flex-col items-center gap-2 p-4">
            <a :href="repo" class="button-sm">
              Repo
              <ExternalLink />
            </a>

            <p v-html="renderMarkdown(description)" class="leading-relaxed" />

            <ul>
              <li v-for="(feature, index) in feat" :key="index">
                {{ feature }}
              </li>
            </ul>

            <div class="flex flex-wrap gap-4">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(item, index) in [work, base, tech, libs].flat()"
                  :key="index"
                  class="flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-1"
                >
                  {{ item }}
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>

    <List />

    <p class="text-center">
      Plus many in-progress, private, and legacy projects not listed here!
    </p>
  </section>
</template>
