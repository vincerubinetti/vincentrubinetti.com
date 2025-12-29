<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { pick, uniq } from "lodash-es";
import { ChevronDown, ExternalLink, TriangleAlert, X } from "lucide-vue-next";
import logos from "@/images/logos";
import { renderMarkdown } from "@/util/string";
import Carousel from "./components/Carousel.vue";
import Dash from "./components/Dash.vue";
import projects from "./data/projects.json";
import images from "./images/projects";
import List from "./List.vue";

/** indexOf with fallback */
const index = (array: unknown[], value: unknown, fallback: number) => {
  const index = array.indexOf(value);
  return index === -1 ? fallback : index;
};

/** project order */
const projectOrder = [
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

/** sort projects */
projects.sort(
  (a, b) =>
    index(projectOrder, a.name, Infinity) -
    index(projectOrder, b.name, Infinity),
);

/** search suggestion options */
const options = uniq(
  ["work", "base", "tech", "lib"].flatMap((key) =>
    projects.flatMap((project) => project[key as keyof typeof project]),
  ),
);

/** search option order */
const optionOrder = [
  "TypeScript",
  "JavaScript",
  "React",
  "Vue",
  "Node",
  "Next",
  "Jekyll",
  "Astro",
  "SVG",
  "Canvas",
  "D3",
  "Three JS",
  "GSAP",
  "Tailwind",
  "Playwright",
  "Figma",
  "Data Visualization",
  "Design",
  "Implementation",
  "CI/CD",
  "Logo",
  "Web Workers",
];

/** sort options */
options.sort(
  (a, b) => index(optionOrder, a, Infinity) - index(optionOrder, b, Infinity),
);

const input = useTemplateRef("input");

/** search query */
const search = ref("");

/** filtered projects to display */
const filteredProjects = computed(() =>
  projects
    .map(({ name, ...project }) => ({
      name,
      ...project,
      images: images[name.toLowerCase()] ?? [],
    }))
    .filter((project) =>
      JSON.stringify(project)
        .toLowerCase()
        .includes(search.value.toLowerCase()),
    ),
);
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
        class="absolute right-4"
        @click="search = ''"
        aria-label="Clear search"
      >
        <X />
      </button>
    </div>

    <datalist id="projects">
      <option v-for="(option, index) in options" :key="index" :value="option" />
    </datalist>

    <b v-if="filteredProjects.length !== projects.length" class="text-center">
      {{ filteredProjects.length.toLocaleString() }} results
    </b>

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
        ) in filteredProjects"
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

        <a
          :href="site || repo"
          class="button group bg-transparent p-2 text-lg"
          :title="name"
        >
          {{ name }}
          <div
            class="flex w-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ExternalLink />
          </div>
        </a>

        <details name="project">
          <summary class="button bg-transparent p-2" aria-label="Details">
            <ChevronDown />
          </summary>

          <div class="flex flex-col gap-2 p-4">
            <a :href="repo" class="button bg-transparent p-2">
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
                <button
                  v-for="(item, index) in [work, base, tech, lib].flat()"
                  :key="index"
                  class="flex items-center gap-1 bg-zinc-200 p-1 font-sans"
                  @click="
                    search = item;
                    input?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                    });
                  "
                >
                  {{ item }}
                </button>
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
