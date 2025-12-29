<script setup lang="ts">
import { computed, ref } from "vue";
import { countBy, flatMap, orderBy, pick, toPairs } from "lodash-es";
import { ChevronDown, ExternalLink, TriangleAlert } from "lucide-vue-next";
import logos from "@/images/logos";
import Select from "@/software/components/Select.vue";
import { renderMarkdown } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import projects from "./data/projects.json";
import images from "./images/projects";
import List from "./List.vue";

/** project order */
const order = [
  "SVG to PNG",
  "Set",
  "Word4Word",
  "Lab Website Template",
  "Manubot",
  "Exploring Cancer in Colorado",
  "Simplex",
  "Word Lapse",
  "Preprint Similarity Search",
  "Word Spot",
  "STRchive",
  "Human Microbiome Compendium",
  "GenePlexus",
  "Connectivity Search",
  "Het.io",
  "Adage",
  "mygeneset.info",
  "Wall of Software",
  "DBMI Screensaver",
  "NIH Reporting",
  "3Blue1Brown.com",
  "3Blue1Brown Dubbing",
  "Using the Music of 3Blue1Brown",
  "MIDI Humanizer",
  "Lab Website Template Poster",
  "Misc. Logos",
  "Redirects",
  "Intro to SVGs",
  "hclust",
  "3Blue1Brown Captions",
  "Monarch",
  "Preprint Bot",
  "Mute Tabs By URL",
];

/** generate filter options */
const toOptions = (key: keyof (typeof projects)[number]) =>
  orderBy(toPairs(countBy(flatMap(projects, key))), "[1]")
    .map(([value, count]) => ({ label: `${value} (${count})`, value }))
    .concat([{ label: "All", value: "" }])
    .reverse();

/** generate filter options */
const byGroup = toOptions("group");
const byWork = toOptions("work");
const byBase = toOptions("base");
const byTech = toOptions("tech");
const byLib = toOptions("lib");

/** filter state */
const group = ref("");
const work = ref("");
const base = ref("");
const tech = ref("");
const lib = ref("");
const search = ref("");

/** displayed projects */
const _projects = computed(() =>
  orderBy(
    projects.map(({ name, ...project }) => ({
      name,
      ...project,
      images: images[name.toLowerCase()] ?? [],
    })),
    (project) => {
      const index = order.indexOf(project.name);
      return index === -1 ? 999 : index;
    },
  ).filter(
    (project) =>
      (group.value ? project.group.includes(group.value) : true) &&
      (work.value ? project.work.includes(work.value) : true) &&
      (base.value ? project.base.includes(base.value) : true) &&
      (tech.value ? project.tech.includes(tech.value) : true) &&
      (lib.value ? project.lib.includes(lib.value) : true) &&
      JSON.stringify(project)
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);
</script>

<template>
  <section>
    <h2><Dash flip />Projects</h2>

    <details class="w-full">
      <summary class="button">Filters<ChevronDown /></summary>

      <div
        class="grid w-full grid-cols-3 gap-x-8 gap-y-4 *:grid *:grid-cols-[--spacing(10)_1fr] max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        <label>
          For
          <Select v-model="group" :options="byGroup" />
        </label>

        <label>
          Base
          <Select v-model="base" :options="byBase" />
        </label>

        <label>
          Tech
          <Select v-model="tech" :options="byTech" />
        </label>

        <label>
          Lib
          <Select v-model="lib" :options="byLib" />
        </label>

        <label>
          Work
          <Select v-model="work" :options="byWork" />
        </label>

        <input v-model="search" placeholder="Search" class="p-2" />
      </div>

      <div class="self-center">
        {{ _projects.length.toLocaleString() }} projects
      </div>
    </details>

    <div
      class="grid grid-cols-3 items-start gap-8 max-md:grid-cols-2 max-sm:grid-cols-1"
    >
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
            lib,
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
          <summary class="button-sm">
            Details
            <ChevronDown />
          </summary>

          <div class="flex flex-col gap-2 p-4 pt-0">
            <a :href="repo" class="button-sm">
              Repo
              <ExternalLink />
            </a>

            <p v-html="renderMarkdown(description)" class="leading-loose" />

            <ul>
              <li v-for="(feature, index) in feat" :key="index">
                {{ feature }}
              </li>
            </ul>

            <div class="flex flex-wrap gap-4">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(item, index) in [work, base, tech, lib].flat()"
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
