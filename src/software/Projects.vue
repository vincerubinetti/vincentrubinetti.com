<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { countBy, pick, uniq } from "lodash-es";
import { ChevronDown, ExternalLink, TriangleAlert, X } from "lucide-vue-next";
import logos from "@/images/logos";
import GitHub from "@/images/logos/github.svg?component";
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

/** project order */
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
  [project.type, project.work, project.base, project.tech, project.lib].flat(),
);

/** how often keyword occurs */
const counts = countBy(keywords);

/** search suggestion options */
const options = uniq(keywords);

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
  (a, b) =>
    index(optionOrder, a, Infinity) - index(optionOrder, b, Infinity) ||
    counts[b] - counts[a],
);

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
      {{ formatValue(filteredProjects.length) }} results
    </b>

    <div
      class="gallery grid grid-cols-3 items-start gap-8 max-md:grid-cols-2 max-sm:grid-cols-1"
    >
      <!-- project card -->
      <div
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
        class="bg-light relative flex flex-col"
      >
        <Carousel
          v-if="images.length"
          :slides="
            images.map((image, index) => ({ image, debug: name + index }))
          "
          class="aspect-4/3 bg-zinc-800"
        />
        <div
          v-else
          class="grid aspect-4/3 place-items-center font-sans text-4xl text-current/50"
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

        <div class="absolute top-0 right-0 left-0 z-10 flex gap-2 p-2">
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

        <hr />

        <a
          :href="site || repo"
          class="button group gap-0 bg-transparent p-2 text-lg"
          :title="name"
        >
          {{ name }}
          <div
            class="flex w-0 translate-x-2 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ExternalLink />
          </div>
        </a>

        <details name="project">
          <summary class="button bg-transparent p-2" aria-label="Details">
            <ChevronDown />
          </summary>

          <hr />

          <div class="flex flex-col gap-2 p-4">
            <a :href="repo" class="button bg-transparent p-2">
              Repo
              <ExternalLink />
            </a>

            <p>
              For: <b>{{ group }}</b>
            </p>

            <p v-if="warning">
              <TriangleAlert class="fill-orange-300" />
              {{ warning }}
            </p>

            <p v-html="renderMarkdown(description)" class="leading-loose" />

            <ul>
              <li v-for="(feature, index) in feat" :key="index">
                {{ feature }}
              </li>
            </ul>

            <div class="flex flex-wrap gap-4">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(item, index) in [type, work, base, tech, lib].flat()"
                  :key="index"
                  class="flex items-center gap-1 bg-zinc-200 p-1 hover:bg-zinc-300"
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

    <a href="/github" class="button-big highlight corners-4 self-center">
      <GitHub />All public GitHub contributions
    </a>

    <p class="text-center">
      Plus many in-progress, private, and legacy projects not listed here!
    </p>
  </section>
</template>
