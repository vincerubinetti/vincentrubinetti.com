<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useElementBounding, useEventListener } from "@vueuse/core";
import { countBy, uniq } from "lodash-es";
import { ExternalLink, Logs, X } from "lucide-vue-next";
import logos from "@/images/logos";
import { sleep } from "@/util/misc";
import { formatValue, renderMarkdown, slugify } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import projects from "./data/projects.json";
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
  "VincentRubinetti.com",
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

    <!-- search -->
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

    <!-- autocomplete -->
    <datalist id="search-suggestions">
      <option v-for="(option, index) in options" :key="index" :value="option">
        {{ counts[option] }}
      </option>
    </datalist>

    <!-- filter info -->
    <b class="-my-4 text-center max-md:-my-2">
      {{ formatValue(filteredProjects.length) }} projects
    </b>

    <!-- gallery -->
    <div
      class="gallery grid grid-flow-dense grid-cols-3 items-start gap-8 max-md:grid-cols-2 max-md:gap-4 max-sm:grid-cols-1"
    >
      <!-- card -->
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
          class="hover:before:bg-mid relative flex flex-col gap-2 before:absolute before:-inset-2 before:-z-10 before:transition-all hover:scale-105"
          :title="
            opened === index ? 'Hide project details' : 'Show project details'
          "
          :aria-expanded="opened === index"
          :aria-controls="`details-${index}`"
          @click="opened === index ? close(index) : open(index)"
        >
          <Carousel
            :images="images.map((image) => ({ image }))"
            class="pointer-events-none aspect-4/3 w-full bg-black transition-all"
            :class="opened === index ? 'brightness-200 contrast-0' : ''"
          />

          <div class="text-lg">{{ name }}</div>
        </button>

        <!-- details -->
        <div
          ref="details"
          v-if="opened === index"
          class="relative z-10 col-start-1 -col-end-1 flex scroll-mt-8 flex-col items-center gap-4 bg-white p-4"
        >
          <div
            class="absolute top-0 size-6 -translate-1/2 rotate-45 bg-white [clip-path:polygon(0%_0%,100%_0%,0%_100%)]"
            :class="opened === index ? '' : 'opacity-0'"
            :style="{ left: `${xOffset}px` }"
          ></div>

          <!-- title -->
          <div class="font-sans text-xl font-medium">{{ name }}</div>

          <!-- images -->
          <Carousel
            :images="images.map((image) => ({ image }))"
            :controls="true"
            class="aspect-4/3 w-full max-w-100 bg-black"
          />

          <!-- description -->
          <p v-html="renderMarkdown(description)" />

          <!-- warning -->
          <p v-if="warning">
            ⚠️
            {{ warning }}
          </p>

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
            <div class="flex flex-wrap justify-center gap-2">
              <button
                v-for="(item, index) in [group, type, work, base, tech, lib]
                  .flat()
                  .filter(Boolean)"
                :key="index"
                class="button-small"
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

    <a href="/github" class="button self-center"> <Logs />GitHub Catalog </a>

    <div class="flex flex-col gap-2 self-center">
      <p>Plus <b>many more</b> professional and personal projects...</p>
      <ul>
        <li>Private or in-progress work I can't share (yet)</li>
        <li>An archive of apps/games/experiments/etc. too long to list</li>
      </ul>
    </div>
  </section>
</template>
