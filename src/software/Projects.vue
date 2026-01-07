<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useEventListener } from "@vueuse/core";
import { countBy, uniq } from "lodash-es";
import { ExternalLink, TriangleAlert, X } from "lucide-vue-next";
import logos from "@/images/logos";
import GitHub from "@/images/logos/github.svg?component";
import { sleep } from "@/util/misc";
import { formatValue, renderMarkdown, slugify } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import projects from "./data/projects.json";
import images from "./images/projects";

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
  "Set",
  "Word4Word",
  "Simplex",
  "Word Lapse",
  "Human Microbiome Compendium",
  "Preprint Similarity Search",
  "Word Spot",
  "Exploring Cancer in Colorado",
  "Connectivity Search",
  "Het.io",
  "Adage",
  "mygeneset.info",
  "STRchive",
  "GenePlexus",
  "Wall of Software",
  "DBMI Screensaver",
  "NIH Reporting",
  "3Blue1Brown.com",
  "3Blue1Brown Dubbing",
  "Using the Music of 3Blue1Brown",
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
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.querySelector("button")?.focus();
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
</script>

<template>
  <section>
    <h2><Dash flip />Projects</h2>

    <div class="relative flex grow items-center">
      <input
        ref="input"
        v-model="search"
        placeholder="Search"
        list="projects"
        class="grow"
      />

      <button
        class="hover:text-dark absolute right-0 aspect-square h-full"
        @click="search = ''"
        aria-label="Clear search"
      >
        <X />
      </button>
    </div>

    <datalist id="projects">
      <option v-for="(option, index) in options" :key="index" :value="option">
        {{ counts[option] }}
      </option>
    </datalist>

    <b v-if="filteredProjects.length !== projects.length" class="text-center">
      {{ formatValue(filteredProjects.length) }} results
    </b>

    <div
      class="gallery grid grid-flow-dense grid-cols-3 items-start gap-8 max-md:grid-cols-2 max-sm:grid-cols-1"
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
        ) in filteredProjects"
        :key="index"
      >
        <!-- open/close button -->
        <button
          ref="button"
          class="relative flex flex-col hover:scale-105 hover:ring-2"
          aria-label="Toggle details for {{ name }}"
          :aria-expanded="opened === index"
          :aria-controls="`details-${index}`"
          @click="opened === index ? close(index) : open(index)"
        >
          <Carousel
            :slides="images.map((image) => ({ image }))"
            class="pointer-events-none aspect-4/3 transition-all"
            :class="opened === index ? 'brightness-200 contrast-0' : ''"
          />

          <div class="p-2 text-lg">{{ name }}</div>

          <div
            class="absolute top-full size-8"
            :class="opened === index ? '' : 'opacity-0'"
          >
            <svg viewBox="-50 -50 100 100">
              <polygon points="-50 50 0 0 50 50" class="fill-light" />
            </svg>
          </div>
        </button>

        <!-- details -->
        <div
          ref="details"
          v-if="opened === index"
          class="bg-light paper max relative z-10 col-start-1 -col-end-1 flex flex-col items-center gap-4 p-4"
        >
          <button
            class="hover:text-dark absolute top-4 right-4 size-8 transition-opacity"
            aria-label="Close details"
            @click="close(index)"
          >
            <X />
          </button>

          <p class="font-sans text-xl font-medium">{{ name }}</p>

          <!-- images -->
          <Carousel
            :controls="true"
            :slides="
              images.map((image, index) => ({ image, debug: name + index }))
            "
            :name="name"
            class="aspect-4/3 w-full max-w-100"
          />

          <p class="flex gap-4">
            <a v-if="site" :href="site">Site<ExternalLink /></a>
            <a v-if="repo" :href="repo">Repo<ExternalLink /></a>
          </p>

          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(item, index) in [group, type, work, base, tech, lib]
                  .flat()
                  .filter(Boolean)"
                :key="index"
                class="flex items-center gap-1 bg-zinc-200 p-1 hover:bg-zinc-300"
                :aria-label="`Search '${item}'`"
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

            <p v-if="warning">
              <TriangleAlert class="fill-orange-300" />
              {{ warning }}
            </p>

            <p v-html="renderMarkdown(description)" />

            <ul>
              <li v-for="(feature, index) in feat" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>

    <a href="/github" class="button-big highlight corners-4 self-center">
      <GitHub />All public GitHub contributions
    </a>

    <p class="text-center">
      Plus many in-progress, private, and legacy projects not listed here!
    </p>
  </section>
</template>
