<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { IconExternalLink, IconX } from "@tabler/icons-vue";
import {
  onClickOutside,
  useElementBounding,
  useEventListener,
} from "@vueuse/core";
import { countBy, uniq } from "lodash-es";
import logos from "@/images/logos";
import { sleep } from "@/util/misc";
import { formatValue, renderMarkdown, slugify } from "@/util/string";
import Autocomplete from "./components/Autocomplete.vue";
import Carousel from "./components/Carousel.vue";
import Divider from "./components/Divider.vue";
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
  "3Blue1Brown.com",
  "Manubot",
  "UX/UI for Researchers",
  "Word4Word",
  "Simplex",
  "Human Microbiome Compendium",
  "Meta2Onto",
  "Exploring Cancer in Colorado",
  "STRchive",
  "VincentRubinetti.com",
  "Using the Music of 3Blue1Brown",
  "Word Lapse",
  "Preprint Similarity Search",
  "Connectivity Search",
  "Het.io",
  "Word Spot",
  "Wall of Software",
  "GenePlexus",
  "DBMI Screensaver",
  "Adage",
  "mygeneset.info",
  "NIH Reporting",
  "3Blue1Brown Dubbing",
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
const options = uniq(keywords)
  /** remove empty values */
  .filter(Boolean)
  /** sort options by frequency */
  .sort((a, b) => counts[b] - counts[a])
  /** map to full option */
  .map((option) => ({
    value: option,
    label: option,
    info: counts[option],
    icon: logos[option as keyof typeof logos],
  }));

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
  const element = details.value?.[0];
  if (!element) return;
  console.log(element);
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

/** close project details */
const close = async () => {
  await sleep();
  const element = button.value?.[opened.value];
  opened.value = -1;
  if (!element) return;
  element.focus();
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

/** close project details */
useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") close();
});
onClickOutside(
  () => details.value?.[0],
  ({ target }) => {
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("section")) return;
    close();
  },
);

const buttonBbox = useElementBounding(() => button.value?.[opened.value]);
const detailsBbox = useElementBounding(() => details.value?.[0]);

/** coords relative to opened details */
const coords = computed(() => ({
  w: detailsBbox.width.value,
  h: detailsBbox.height.value,
  x:
    buttonBbox.left.value - detailsBbox.left.value + buttonBbox.width.value / 2,
}));
</script>

<template>
  <section class="bg-light">
    <h2>Projects<Divider /></h2>

    <!-- search -->
    <Autocomplete
      ref="input"
      v-model="search"
      :options="options"
      placeholder="Search projects"
    />

    <!-- filter info -->
    <b class="-my-8 text-center">
      {{ formatValue(filteredProjects.length) }} projects
    </b>

    <!-- gallery -->
    <div
      class="gallery grid grid-flow-dense grid-cols-4 items-start gap-8 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2"
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
          class="hover:before:bg-mid relative flex flex-col gap-2 before:absolute before:-inset-2 before:-z-10 before:transition-colors hover:scale-103"
          :title="
            opened === index ? 'Hide project details' : 'Show project details'
          "
          :aria-expanded="opened === index"
          :aria-controls="`details-${index}`"
          @click="
            opened === index ? close() : open(index);
            sleep().then(detailsBbox.update);
          "
        >
          <div class="box pointer-events-none grid aspect-4/3 w-full">
            <Carousel
              :images="images.map((image) => ({ image }))"
              fit="cover"
              :class="opened === index ? 'brightness-200 contrast-0' : ''"
            />
          </div>

          {{ name }}
        </button>

        <!-- details -->
        <div
          v-if="opened === index"
          class="col-start-1 -col-end-1 flex flex-col items-center"
        >
          <div
            ref="details"
            class="relative z-10 flex w-dvw max-w-360 scroll-mt-8 items-center gap-8 p-8 max-md:flex-col"
          >
            <svg
              class="absolute inset-0 -z-10"
              :class="opened === index ? '' : 'opacity-0'"
            >
              <defs>
                <linearGradient
                  id="details-gradient"
                  x1="0%"
                  y1="-10%"
                  x2="0%"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stop-color="#00000020" />
                  <stop offset="15%" stop-color="#00000006" />
                </linearGradient>
              </defs>
              <path
                class="stroke-mid-alt fill-white stroke-1"
                stroke-dasharray="4 4"
                :d="
                  [
                    ['M', 0, 0],
                    ['h', coords.x - 15],
                    ['l', 15, -15],
                    ['l', 15, 15],
                    ['H', coords.w],
                    ['V', coords.h],
                    ['H', 0],
                    ['z'],
                  ]
                    .flat()
                    .join(' ')
                "
              />
            </svg>

            <!-- close -->
            <button
              class="button absolute top-0 right-0 z-10"
              @click="close()"
              title="Close project details"
            >
              <IconX />
            </button>

            <!-- images -->
            <div class="box grid aspect-4/3 max-w-120 flex-1 max-md:w-full">
              <Carousel
                :images="images.map((image) => ({ image }))"
                :controls="true"
              />
            </div>

            <div class="flex flex-1 flex-col items-start gap-4">
              <!-- title -->
              <div class="font-sans text-xl font-medium text-balance">
                {{ name }}
              </div>

              <!-- description -->
              <p v-html="renderMarkdown(description)" />

              <!-- warning -->
              <p v-if="warning" class="text-red-500">
                {{ warning }}
              </p>

              <!-- links -->
              <div class="flex flex-wrap gap-4">
                <a
                  v-for="(url, label) in links"
                  :key="label"
                  :href="files[url as keyof typeof files] ?? url"
                  class="button gap-2 p-2"
                >
                  {{ label }}
                  <IconExternalLink />
                </a>
              </div>

              <!-- features -->
              <ul>
                <li v-for="(feature, index) in feat" :key="index">
                  {{ feature }}
                </li>
              </ul>

              <!-- tags -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(item, index) in [group, type, work, base, tech, lib]
                    .flat()
                    .filter(Boolean)"
                  :key="index"
                  class="button gap-1 p-1"
                  :title="`Filter by &quot;${item}&quot;`"
                  @click="
                    search = item;
                    input?.anchor?.scrollIntoView({
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
            </div>
          </div>
        </div>
      </template>

      <p class="box col-span-full p-4 text-center text-balance">
        Plus <b>many more</b> professional and personal projects, private or
        in-progress work, and an archive of apps/<wbr />games/<wbr />experiments/<wbr />etc.
        too long to list.
      </p>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.box {
  @apply relative;

  &::before {
    @apply pointer-events-none absolute -inset-px content-[''];
    background-image: url("./images/box.svg");
  }
}
</style>
