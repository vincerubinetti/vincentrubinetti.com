<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useElementBounding, useEventListener } from "@vueuse/core";
import { countBy, uniq } from "lodash-es";
import { ExternalLink, X } from "lucide-vue-next";
import logos from "@/images/logos";
import { sleep } from "@/util/misc";
import { formatValue, renderMarkdown, slugify } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import collaborators from "./data/collaborators.json";
import projects from "./data/projects.json";
import collaboratorLogos from "./images/collaborators";
import { files, images } from "./images/projects";

/** indexOf with fallback */
const index = (array: unknown[], value: unknown, fallback: number) => {
  const index = array.indexOf(value);
  return index === -1 ? fallback : index;
};

/** hand-selected project order */
const projectOrder = [
  "SVG to PNG",
  "Lab Website Template",
  "Manubot",
  "UX/UI for Researchers",
  "Word4Word",
  "Simplex",
  "Word Lapse",
  "Human Microbiome Compendium",
  "Preprint Similarity Search",
  "Exploring Cancer in Colorado",
  "Connectivity Search",
  "Het.io",
  "Word Spot",
  "Wall of Software",
  "DBMI Screensaver",
  "Adage",
  "mygeneset.info",
  "STRchive",
  "GenePlexus",
  "NIH Reporting",
  "3Blue1Brown.com",
  "3Blue1Brown Dubbing",
  "Using the Music of 3Blue1Brown",
  "Set",
  "MIDI Humanizer",
  "Lab Website Template Poster",
  "Other Logos",
  "Intro to SVGs",
  "Redirects",
  "hclust",
  "3Blue1Brown Captions",
  "Monarch",
  "Preprint Bot",
  "Mute Tabs By URL",
];

/** sort projects */
projects.sort(
  (a, b) =>
    index(projectOrder, a.name, Infinity) -
    index(projectOrder, b.name, Infinity),
);

/** project "keywords" */
const keywords = projects.flatMap((project) =>
  [
    project.group,
    project.type,
    project.work,
    project.base,
    project.tech,
    project.lib,
  ].flat(),
);

/** how often keyword occurs */
const counts = countBy(keywords);

/** search suggestion options */
const options = uniq(keywords);

/** sort options by frequency */
options.sort((a, b) => counts[b] - counts[a]);

const input = useTemplateRef("input");

/** search query */
const search = ref("");

/** projects with computed props */
const derivedProjects = projects.map((project) => ({
  ...project,
  /** associated images */
  images: images[slugify(project.name)] ?? [],
  /** concat-ed string values */
  search: Object.values(project).flat().join(" ").toLowerCase(),
}));

/** filtered projects to display */
const filteredProjects = computed(() =>
  derivedProjects.filter((project) =>
    project.search.includes(search.value.toLowerCase()),
  ),
);

/** opened project details */
const opened = ref(-1);

const button = useTemplateRef("button");
const details = useTemplateRef("details");

/** open project details */
const open = async (index: number) => {
  opened.value = index;
  await sleep();
  const el = details.value?.[0];
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** close project details */
const close = async (index: number) => {
  opened.value = -1;
  await sleep();
  const el = button.value?.[index];
  if (!el) return;
  el.focus();
  el.scrollIntoView({ behavior: "smooth", block: "center" });
};

/** close project details */
useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") close(opened.value);
});

const buttonBbox = useElementBounding(() => button.value?.[opened.value]);
const detailsBbox = useElementBounding(() => details.value?.[0]);

/** x coord offset of opened button */
const xOffset = computed(
  () =>
    buttonBbox.left.value - detailsBbox.left.value + buttonBbox.width.value / 2,
);
</script>

<template>
  <section class="bg-light paper">
    <h2>Projects<Dash /></h2>

    <div
      class="flex justify-center-safe gap-8 overflow-auto max-lg:gap-6 max-md:gap-4 max-sm:gap-2"
    >
      <div
        v-for="({ name }, index) in collaborators"
        :key="index"
        :title="name"
        role="img"
      >
        <component
          :is="collaboratorLogos[slugify(name)]"
          class="-0 size-12 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        />
      </div>
    </div>

    <div class="relative flex items-center">
      <input
        ref="input"
        v-model="search"
        placeholder="Search"
        list="search-suggestions"
        class="grow"
      />

      <button
        class="hover:text-dark absolute right-0 aspect-square h-full"
        @click="search = ''"
        title="Clear search"
      >
        <X />
      </button>
    </div>

    <datalist id="search-suggestions">
      <option v-for="(option, index) in options" :key="index" :value="option">
        {{ counts[option] }}
      </option>
    </datalist>

    <b class="text-center">
      {{ formatValue(filteredProjects.length) }} projects
    </b>

    <div
      class="gallery grid grid-flow-dense grid-cols-3 items-start gap-4 max-md:grid-cols-2 max-sm:grid-cols-1"
    >
      <!-- project card -->
      <template
        v-for="(
          {
            images,
            name,
            group,
            type,
            description,
            links,
            feat,
            work,
            base,
            tech,
            lib,
            warning,
          },
          index
        ) in filteredProjects"
        :key="index"
      >
        <!-- open/close button -->
        <button
          ref="button"
          class="hover:bg-mid flex flex-col gap-2 p-2 hover:scale-105"
          :title="
            opened === index ? 'Hide project details' : 'Show project details'
          "
          :aria-expanded="opened === index"
          :aria-controls="`details-${index}`"
          @click="opened === index ? close(index) : open(index)"
        >
          <Carousel
            :images="images.map((image) => ({ image }))"
            class="pointer-events-none aspect-4/3 w-full border border-zinc-500 bg-black transition-all"
            :class="opened === index ? 'brightness-200 contrast-0' : ''"
          />

          <div class="text-lg">{{ name }}</div>
        </button>

        <!-- details -->
        <div
          ref="details"
          v-if="opened === index"
          class="relative z-10 col-start-1 -col-end-1 flex scroll-mt-8 flex-col items-center gap-4 bg-black/5 p-4 max-sm:gap-2"
        >
          <div
            class="absolute -top-8 size-8 -translate-x-1/2"
            :class="opened === index ? '' : 'opacity-0'"
            :style="{ left: `${xOffset}px` }"
          >
            <svg viewBox="-50 -50 100 100">
              <polygon points="-50 50 0 0 50 50" class="fill-black/5" />
            </svg>
          </div>

          <!-- title -->
          <p class="font-sans text-xl font-medium">{{ name }}</p>

          <!-- images -->
          <Carousel
            :images="images.map((image) => ({ image }))"
            :controls="true"
            class="aspect-4/3 w-full max-w-100 border border-current/10 bg-black"
          />

          <!-- links -->
          <div class="flex flex-wrap justify-center gap-x-2">
            <a
              v-for="(url, label) in links"
              :key="label"
              :href="files[url as keyof typeof files] ?? url"
              class="button p-2"
            >
              {{ label }}
              <ExternalLink />
            </a>
          </div>

          <div class="flex flex-col gap-4">
            <!-- tags -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(item, index) in [group, type, work, base, tech, lib]
                  .flat()
                  .filter(Boolean)"
                :key="index"
                class="hover:bg-mid flex items-center gap-1 border border-current/25 p-1"
                :title="`Filter by ${item}`"
                @click="
                  search = item;
                  input?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                  });
                "
              >
                <component
                  :is="logos[item as keyof typeof logos] ?? 'template'"
                  :title="item"
                  class="size-[1em]"
                />
                {{ item }}
              </button>
            </div>

            <!-- warning -->
            <p v-if="warning">
              ⚠️
              {{ warning }}
            </p>

            <!-- description -->
            <p v-html="renderMarkdown(description)" />

            <!-- features -->
            <ul>
              <li v-for="(feature, index) in feat" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>

    <p class="text-center">
      Plus many other <a href="/github">public GitHub contributions</a> and
      private/in-progress/legacy/etc. projects not listed here!
    </p>
  </section>
</template>
